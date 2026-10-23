"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import { menuItems, openingHours, orders, reservations, restaurantSettings } from "@/db/schema";
import { canTransitionOrder, type OrderStatus } from "@/lib/staff-permissions";
import { authenticateStaff, createSession, destroySession, requireStaff } from "@/server/auth";
import { ServiceError } from "@/server/service-error";

export type LoginState = { error?: string };
export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = z.object({ email: z.email(), password: z.string().min(1).max(200) }).safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  const user = await authenticateStaff(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Email or password is incorrect." };
  await createSession(user.id); redirect("/staff");
}
export async function logoutAction() { await destroySession(); redirect("/staff/login"); }

const statusSchema = z.enum(["PENDING","ACCEPTED","PREPARING","READY","COMPLETED","CANCELLED"]);
export async function updateOrderStatusAction(formData: FormData) {
  await requireStaff("UPDATE_ORDER"); const id=z.uuid().parse(formData.get("id")); const next=statusSchema.parse(formData.get("status"));
  const db=getDb(); const [order]=await db.select({status:orders.status}).from(orders).where(eq(orders.id,id)).limit(1);
  if (!order || !canTransitionOrder(order.status as OrderStatus,next)) throw new ServiceError("INVALID_TRANSITION","That order status change is not allowed.");
  await db.update(orders).set({status:next}).where(and(eq(orders.id,id),eq(orders.status,order.status))); revalidatePath("/staff"); revalidatePath("/staff/orders"); revalidatePath(`/staff/orders/${id}`);
}

export async function updateReservationStatusAction(formData: FormData) {
  await requireStaff("UPDATE_RESERVATION"); const id=z.uuid().parse(formData.get("id")); const status=z.enum(["CONFIRMED","CANCELLED"]).parse(formData.get("status"));
  await getDb().update(reservations).set({status}).where(eq(reservations.id,id)); revalidatePath("/staff"); revalidatePath("/staff/reservations");
}

export async function toggleMenuAvailabilityAction(formData: FormData) {
  await requireStaff("TOGGLE_MENU"); const id=z.string().min(1).max(80).parse(formData.get("id")); const available=z.enum(["true","false"]).parse(formData.get("available")) === "true";
  await getDb().update(menuItems).set({available}).where(eq(menuItems.id,id)); revalidatePath("/"); revalidatePath("/menu"); revalidatePath("/staff"); revalidatePath("/staff/menu");
}

export async function updateMenuItemAction(formData: FormData) {
  await requireStaff("EDIT_MENU"); const data=z.object({id:z.string().min(1),name:z.string().trim().min(2).max(100),description:z.string().trim().min(10).max(300),price:z.coerce.number().positive().max(500),dietary:z.string().max(200),popular:z.string().optional(),recommended:z.string().optional()}).parse(Object.fromEntries(formData));
  await getDb().update(menuItems).set({name:data.name,description:data.description,priceCents:Math.round(data.price*100),dietary:data.dietary.split(",").map(v=>v.trim()).filter(Boolean),popular:data.popular==="on",recommended:data.recommended==="on"}).where(eq(menuItems.id,data.id));
  revalidatePath("/"); revalidatePath("/menu"); revalidatePath("/staff/menu"); redirect("/staff/menu");
}

export async function updateSettingsAction(formData: FormData) {
  await requireStaff("EDIT_SETTINGS"); const data=z.object({ordering:z.string().optional(),reservations:z.string().optional(),collectionLead:z.coerce.number().int().min(5).max(180),deliveryLead:z.coerce.number().int().min(10).max(240),deliveryFee:z.coerce.number().min(0).max(50),capacity:z.coerce.number().int().min(1).max(200)}).parse(Object.fromEntries(formData));
  await getDb().update(restaurantSettings).set({orderingEnabled:data.ordering==="on",reservationsEnabled:data.reservations==="on",collectionLeadMinutes:data.collectionLead,deliveryLeadMinutes:data.deliveryLead,deliveryFeeCents:Math.round(data.deliveryFee*100),reservationCapacity:data.capacity}).where(eq(restaurantSettings.id,"primary"));
  revalidatePath("/menu"); revalidatePath("/reservations"); revalidatePath("/staff/settings");
}

export async function updateOpeningHourAction(formData: FormData) {
  await requireStaff("EDIT_SETTINGS"); const data=z.object({id:z.coerce.number().int().positive(),open:z.string().regex(/^\d{2}:\d{2}$/),close:z.string().regex(/^\d{2}:\d{2}$/),collection:z.string().optional(),delivery:z.string().optional(),reservation:z.string().optional()}).parse(Object.fromEntries(formData));
  if (data.open>=data.close) throw new ServiceError("INVALID_HOURS","Closing time must be later than opening time.");
  await getDb().update(openingHours).set({openTime:data.open,closeTime:data.close,collectionEnabled:data.collection==="on",deliveryEnabled:data.delivery==="on",reservationsEnabled:data.reservation==="on"}).where(eq(openingHours.id,data.id));
  revalidatePath("/staff/settings"); revalidatePath("/reservations");
}
