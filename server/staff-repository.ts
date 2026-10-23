import "server-only";
import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { menuCategories, menuItems, modifierGroups, modifierOptions, orderItemModifiers, orderItems, orders, openingHours, reservations, restaurantSettings } from "@/db/schema";
import { requireStaff } from "./auth";
import type { OrderStatus } from "@/lib/staff-permissions";

function parisDate() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }

export async function getDashboardData() {
  await requireStaff(); const db = getDb(); const today = parisDate();
  const [orderCounts, todayReservations, upcomingReservations, soldOut] = await Promise.all([
    db.select({ status: orders.status, count: sql<number>`count(*)::int` }).from(orders).where(inArray(orders.status, ["PENDING","ACCEPTED","PREPARING","READY"])).groupBy(orders.status),
    db.select({ count: sql<number>`count(*)::int` }).from(reservations).where(and(eq(reservations.reservationDate, today), inArray(reservations.status,["PENDING","CONFIRMED"]))),
    db.select({ count: sql<number>`count(*)::int` }).from(reservations).where(and(gte(reservations.reservationDate, today), inArray(reservations.status,["PENDING","CONFIRMED"]))),
    db.select({ id: menuItems.id, name: menuItems.name }).from(menuItems).where(eq(menuItems.available,false)).orderBy(asc(menuItems.name)),
  ]);
  const count = (status: string) => Number(orderCounts.find((row) => row.status === status)?.count || 0);
  return { pending: count("PENDING") + count("ACCEPTED"), preparing: count("PREPARING"), ready: count("READY"), todayReservations: Number(todayReservations[0]?.count || 0), upcomingReservations: Number(upcomingReservations[0]?.count || 0), soldOut };
}

export async function getStaffOrders() {
  await requireStaff();
  return getDb().select({ id: orders.id, reference: orders.reference, customer: orders.customerName, mode: orders.fulfilmentMode, date: orders.requestedDate, time: orders.requestedTime, totalCents: orders.totalCents, status: orders.status, createdAt: orders.createdAt }).from(orders).orderBy(desc(orders.createdAt)).limit(100);
}

export async function getStaffOrder(id: string) {
  await requireStaff(); const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id,id)).limit(1); if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId,id)); const itemIds = items.map((item) => item.id);
  const modifiers = itemIds.length ? await db.select().from(orderItemModifiers).where(inArray(orderItemModifiers.orderItemId,itemIds)) : [];
  return { ...order, items: items.map((item) => ({ ...item, modifiers: modifiers.filter((modifier) => modifier.orderItemId === item.id) })) };
}

export async function getStaffReservations(date?: string) {
  await requireStaff(); const db = getDb(); const selected = date || parisDate();
  return db.select().from(reservations).where(eq(reservations.reservationDate, selected)).orderBy(asc(reservations.reservationTime));
}

export async function getStaffMenu() {
  const user = await requireStaff(); const db = getDb();
  const items = await db.select({ item: menuItems, category: menuCategories.name }).from(menuItems).innerJoin(menuCategories,eq(menuItems.categoryId,menuCategories.id)).orderBy(asc(menuCategories.sortOrder),asc(menuItems.sortOrder));
  return { user, items };
}

export async function getStaffSettings() {
  const user = await requireStaff("EDIT_SETTINGS"); const db = getDb();
  const [settings] = await db.select().from(restaurantSettings).where(eq(restaurantSettings.id,"primary")).limit(1);
  const hours = await db.select().from(openingHours).orderBy(asc(openingHours.dayOfWeek),asc(openingHours.openTime));
  return { user, settings, hours };
}

export async function getMenuItemForEdit(id: string) {
  await requireStaff("EDIT_MENU"); const db=getDb();
  const [item] = await db.select().from(menuItems).where(eq(menuItems.id,id)).limit(1);
  if (!item) return null;
  const groups=await db.select().from(modifierGroups).where(eq(modifierGroups.menuItemId,id)); const ids=groups.map(g=>g.id);
  const options=ids.length?await db.select().from(modifierOptions).where(inArray(modifierOptions.groupId,ids)):[];
  return { item, groups, options };
}

export const asOrderStatus = (value: string) => value as OrderStatus;
