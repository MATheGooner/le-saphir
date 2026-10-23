import "server-only";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { menuItems, modifierGroups, modifierOptions, orderItemModifiers, orderItems, orders } from "@/db/schema";
import { assertServiceTime } from "./availability";
import { ServiceError } from "./service-error";
import type { OrderInput } from "./validation";
import { orderConfirmationEmail } from "@/lib/email-content";
import { sendTransactionalEmail } from "./email";

function orderReference() { return `LS-${Date.now().toString(36).slice(-5).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`; }

export async function createOrder(input: OrderInput) {
  const rules = await assertServiceTime(input.requestedDate, input.requestedTime, input.fulfilmentMode);
  if (!rules.orderingEnabled) throw new ServiceError("ORDERING_CLOSED", "Online ordering is temporarily unavailable.", 409);
  if (input.fulfilmentMode === "DELIVERY") {
    const postcode = input.delivery!.postcode.toUpperCase();
    if (!rules.deliveryPostcodes.includes(postcode)) throw new ServiceError("OUTSIDE_DELIVERY_ZONE", "That postcode is outside our current delivery area.");
  }

  const db = getDb();
  const ids = [...new Set(input.items.map((item) => item.menuItemId))];
  const authoritativeItems = await db.select().from(menuItems).where(inArray(menuItems.id, ids));
  if (authoritativeItems.length !== ids.length) throw new ServiceError("INVALID_ITEM", "One or more dishes are no longer on the menu.");
  const itemGroups = await db.select().from(modifierGroups).where(inArray(modifierGroups.menuItemId, ids));
  const groupIds = itemGroups.map((group) => group.id);
  const validOptions = groupIds.length ? await db.select().from(modifierOptions).where(inArray(modifierOptions.groupId, groupIds)) : [];

  const verified = input.items.map((submitted) => {
    const item = authoritativeItems.find((candidate) => candidate.id === submitted.menuItemId)!;
    if (!item.available) throw new ServiceError("SOLD_OUT", `${item.name} is currently sold out.`, 409);
    const groups = itemGroups.filter((group) => group.menuItemId === item.id);
    const optionIds = [...new Set(submitted.modifierOptionIds)];
    if (optionIds.length !== submitted.modifierOptionIds.length) throw new ServiceError("INVALID_MODIFIERS", `Duplicate options were submitted for ${item.name}.`);
    const selected = optionIds.map((id) => {
      const option = validOptions.find((candidate) => candidate.id === id && candidate.available);
      const group = option && groups.find((candidate) => candidate.id === option.groupId);
      if (!option || !group) throw new ServiceError("INVALID_MODIFIERS", `An option for ${item.name} is invalid or unavailable.`);
      return { option, group };
    });
    for (const group of groups) {
      const count = selected.filter((selection) => selection.group.id === group.id).length;
      if (group.required && count === 0) throw new ServiceError("MISSING_MODIFIER", `Please choose an option for ${group.name}.`);
      if (count > group.maxSelections) throw new ServiceError("TOO_MANY_MODIFIERS", `Too many choices were selected for ${group.name}.`);
    }
    const modifierCents = selected.reduce((sum, selection) => sum + selection.option.priceCents, 0);
    return { submitted, item, selected, lineCents: (item.priceCents + modifierCents) * submitted.quantity };
  });

  const subtotalCents = verified.reduce((sum, line) => sum + line.lineCents, 0);
  const feeCents = input.fulfilmentMode === "DELIVERY" ? rules.deliveryFeeCents : 0;
  const totalCents = subtotalCents + feeCents;
  const reference = orderReference();

  await db.transaction(async (tx) => {
    const [order] = await tx.insert(orders).values({
      reference, customerName: input.customer.name, email: input.customer.email.toLowerCase(), phone: input.customer.phone,
      fulfilmentMode: input.fulfilmentMode, requestedDate: input.requestedDate, requestedTime: input.requestedTime,
      addressLine: input.fulfilmentMode === "DELIVERY" ? input.delivery!.addressLine : null,
      postcode: input.fulfilmentMode === "DELIVERY" ? input.delivery!.postcode.toUpperCase() : null,
      city: input.fulfilmentMode === "DELIVERY" ? input.delivery!.city : null,
      deliveryNotes: input.fulfilmentMode === "DELIVERY" ? input.delivery?.notes : null,
      subtotalCents, feeCents, totalCents, status: "PENDING", paymentMode: "DEMO",
    }).returning({ id: orders.id });
    for (const line of verified) {
      const [createdItem] = await tx.insert(orderItems).values({
        orderId: order.id, menuItemId: line.item.id, nameSnapshot: line.item.name,
        unitPriceCents: line.item.priceCents, quantity: line.submitted.quantity, notes: line.submitted.notes,
      }).returning({ id: orderItems.id });
      if (line.selected.length) await tx.insert(orderItemModifiers).values(line.selected.map(({ option, group }) => ({
        orderItemId: createdItem.id, modifierOptionId: option.id, groupNameSnapshot: group.name,
        optionNameSnapshot: option.name, priceCents: option.priceCents,
      })));
    }
  });
  await sendTransactionalEmail(orderConfirmationEmail({
    reference, email: input.customer.email, customerName: input.customer.name, mode: input.fulfilmentMode,
    requestedDate: input.requestedDate, requestedTime: input.requestedTime, totalCents,
    items: verified.map(({ submitted, item, selected, lineCents }) => ({ name: item.name, quantity: submitted.quantity, options: selected.map(({ option }) => option.name), lineCents })),
  }));
  return { reference, subtotalCents, feeCents, totalCents, status: "PENDING" as const };
}

export async function getOrderConfirmation(reference: string) {
  const [order] = await getDb().select({ reference: orders.reference, mode: orders.fulfilmentMode, date: orders.requestedDate, time: orders.requestedTime, totalCents: orders.totalCents, status: orders.status }).from(orders).where(eq(orders.reference, reference)).limit(1);
  return order;
}
