import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { reservations } from "@/db/schema";
import { assertServiceTime, getReservationSlots, getRestaurantRules } from "./availability";
import { ServiceError } from "./service-error";
import type { ReservationInput } from "./validation";
import { reservationConfirmationEmail } from "@/lib/email-content";
import { sendTransactionalEmail } from "./email";

function reservationReference() { return `TABLE-${Date.now().toString(36).slice(-4).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`; }

export async function availableReservationSlots(date: string, partySize: number) {
  const rules = await getRestaurantRules();
  const slots = await getReservationSlots(date, partySize);
  if (!slots.length) return [];
  const usage = await getDb().select({ time: reservations.reservationTime, seats: sql<number>`coalesce(sum(${reservations.partySize}), 0)::int` })
    .from(reservations).where(and(eq(reservations.reservationDate, date), inArray(reservations.status, ["PENDING", "CONFIRMED"]))).groupBy(reservations.reservationTime);
  return slots.filter((slot) => Number(usage.find((row) => row.time.slice(0,5) === slot)?.seats || 0) + partySize <= rules.reservationCapacity);
}

export async function createReservation(input: ReservationInput) {
  const rules = await assertServiceTime(input.date, input.time, "RESERVATION");
  if (!rules.reservationsEnabled) throw new ServiceError("RESERVATIONS_CLOSED", "Online reservations are temporarily unavailable.", 409);
  if (input.partySize > rules.maxPartySize) throw new ServiceError("PARTY_TOO_LARGE", `Online reservations are available for up to ${rules.maxPartySize} guests.`);
  const reference = reservationReference();
  const db = getDb();
  try {
    await db.transaction(async (tx) => {
      const [capacity] = await tx.select({ seats: sql<number>`coalesce(sum(${reservations.partySize}), 0)::int` }).from(reservations)
        .where(and(eq(reservations.reservationDate, input.date), eq(reservations.reservationTime, input.time), inArray(reservations.status, ["PENDING", "CONFIRMED"])));
      if (Number(capacity.seats) + input.partySize > rules.reservationCapacity) throw new ServiceError("SLOT_UNAVAILABLE", "That time has just become unavailable. Please choose another slot.", 409);
      await tx.insert(reservations).values({ reference, reservationDate: input.date, reservationTime: input.time,
        partySize: input.partySize, customerName: input.customer.name, email: input.customer.email.toLowerCase(),
        phone: input.customer.phone, specialRequests: input.specialRequests, status: "CONFIRMED" });
    }, { isolationLevel: "serializable" });
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "23505" || code === "40001") throw new ServiceError("SLOT_UNAVAILABLE", "That reservation could not be completed. Please choose another slot.", 409);
    throw error;
  }
  await sendTransactionalEmail(reservationConfirmationEmail({ reference, email: input.customer.email, customerName: input.customer.name, date: input.date, time: input.time, partySize: input.partySize }));
  return { reference, status: "CONFIRMED" as const };
}

export async function getReservationConfirmation(reference: string) {
  const [reservation] = await getDb().select({ reference: reservations.reference, date: reservations.reservationDate, time: reservations.reservationTime, partySize: reservations.partySize, status: reservations.status }).from(reservations).where(eq(reservations.reference, reference)).limit(1);
  return reservation;
}
