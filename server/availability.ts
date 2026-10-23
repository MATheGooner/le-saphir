import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { openingHours, restaurantSettings } from "@/db/schema";
import { addMinutes, dayOfWeek, fitsWindow, isFutureLocal, trimTime } from "@/lib/time-rules";
import { ServiceError } from "./service-error";

export type ServiceKind = "COLLECTION" | "DELIVERY" | "RESERVATION";

export async function getRestaurantRules() {
  const [settings] = await getDb().select().from(restaurantSettings).where(eq(restaurantSettings.id, "primary")).limit(1);
  if (!settings) throw new Error("Restaurant settings are not seeded");
  return settings;
}

function parisNowParts() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || "";
  return { date: `${value("year")}-${value("month")}-${value("day")}`, time: `${value("hour")}:${value("minute")}` };
}

export async function assertServiceTime(date: string, time: string, kind: ServiceKind) {
  const rules = await getRestaurantRules();
  const now = parisNowParts();
  if (!isFutureLocal(date, time, now.date, now.time)) throw new ServiceError("PAST_TIME", "Please choose a future time.");
  const lead = kind === "DELIVERY" ? rules.deliveryLeadMinutes : kind === "COLLECTION" ? rules.collectionLeadMinutes : 0;
  if (date === now.date && time < addMinutes(now.time, lead)) throw new ServiceError("TOO_SOON", `${kind === "DELIVERY" ? "Delivery" : "Collection"} needs at least ${lead} minutes.`);
  const windows = await getDb().select().from(openingHours).where(eq(openingHours.dayOfWeek, dayOfWeek(date))).orderBy(asc(openingHours.openTime));
  const permitted = windows.some((window) => {
    const enabled = kind === "COLLECTION" ? window.collectionEnabled : kind === "DELIVERY" ? window.deliveryEnabled : window.reservationsEnabled;
    return enabled && fitsWindow(time, window.openTime, window.closeTime);
  });
  if (!permitted) throw new ServiceError("CLOSED", "That time is outside our available service hours. Please choose another slot.");
  return rules;
}

export async function getReservationSlots(date: string, partySize: number) {
  const rules = await getRestaurantRules();
  if (!rules.reservationsEnabled || partySize < 1 || partySize > rules.maxPartySize) return [];
  const windows = await getDb().select().from(openingHours).where(and(eq(openingHours.dayOfWeek, dayOfWeek(date)), eq(openingHours.reservationsEnabled, true))).orderBy(asc(openingHours.openTime));
  const now = parisNowParts();
  const slots: string[] = [];
  for (const window of windows) {
    let slot = trimTime(window.openTime); const close = trimTime(window.closeTime);
    while (slot < close) { if (date > now.date || slot > now.time) slots.push(slot); slot = addMinutes(slot, rules.reservationSlotMinutes); }
  }
  return slots;
}
