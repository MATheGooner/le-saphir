import { boolean, date, integer, pgTable, serial, text, time, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const menuCategories = pgTable("menu_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  categoryId: text("category_id").notNull().references(() => menuCategories.id),
  priceCents: integer("price_cents").notNull(),
  image: text("image").notNull(),
  dietary: text("dietary").array().notNull().default([]),
  allergens: text("allergens").array().notNull().default([]),
  popular: boolean("popular").notNull().default(false),
  recommended: boolean("recommended").notNull().default(false),
  available: boolean("available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const modifierGroups = pgTable("modifier_groups", {
  id: text("id").primaryKey(),
  menuItemId: text("menu_item_id").notNull().references(() => menuItems.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  required: boolean("required").notNull().default(false),
  maxSelections: integer("max_selections").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const modifierOptions = pgTable("modifier_options", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull().references(() => modifierGroups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull().default(0),
  available: boolean("available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const restaurantSettings = pgTable("restaurant_settings", {
  id: text("id").primaryKey().default("primary"),
  timezone: text("timezone").notNull().default("Europe/Paris"),
  orderingEnabled: boolean("ordering_enabled").notNull().default(true),
  reservationsEnabled: boolean("reservations_enabled").notNull().default(true),
  collectionLeadMinutes: integer("collection_lead_minutes").notNull().default(20),
  deliveryLeadMinutes: integer("delivery_lead_minutes").notNull().default(40),
  deliveryFeeCents: integer("delivery_fee_cents").notNull().default(390),
  deliveryPostcodes: text("delivery_postcodes").array().notNull().default([]),
  reservationSlotMinutes: integer("reservation_slot_minutes").notNull().default(30),
  reservationCapacity: integer("reservation_capacity").notNull().default(24),
  maxPartySize: integer("max_party_size").notNull().default(8),
});

export const openingHours = pgTable("opening_hours", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(),
  openTime: time("open_time", { withTimezone: false }).notNull(),
  closeTime: time("close_time", { withTimezone: false }).notNull(),
  collectionEnabled: boolean("collection_enabled").notNull().default(true),
  deliveryEnabled: boolean("delivery_enabled").notNull().default(true),
  reservationsEnabled: boolean("reservations_enabled").notNull().default(true),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull().unique(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  fulfilmentMode: text("fulfilment_mode", { enum: ["COLLECTION", "DELIVERY"] }).notNull(),
  requestedDate: date("requested_date", { mode: "string" }).notNull(),
  requestedTime: time("requested_time", { withTimezone: false }).notNull(),
  addressLine: text("address_line"),
  postcode: text("postcode"),
  city: text("city"),
  deliveryNotes: text("delivery_notes"),
  subtotalCents: integer("subtotal_cents").notNull(),
  feeCents: integer("fee_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  status: text("status").notNull().default("PENDING"),
  paymentMode: text("payment_mode").notNull().default("DEMO"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: text("menu_item_id").notNull().references(() => menuItems.id),
  nameSnapshot: text("name_snapshot").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
  notes: text("notes"),
});

export const orderItemModifiers = pgTable("order_item_modifiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderItemId: uuid("order_item_id").notNull().references(() => orderItems.id, { onDelete: "cascade" }),
  modifierOptionId: text("modifier_option_id").notNull().references(() => modifierOptions.id),
  groupNameSnapshot: text("group_name_snapshot").notNull(),
  optionNameSnapshot: text("option_name_snapshot").notNull(),
  priceCents: integer("price_cents").notNull(),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull().unique(),
  reservationDate: date("reservation_date", { mode: "string" }).notNull(),
  reservationTime: time("reservation_time", { withTimezone: false }).notNull(),
  partySize: integer("party_size").notNull(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  specialRequests: text("special_requests"),
  status: text("status").notNull().default("CONFIRMED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("reservation_customer_slot_idx").on(table.reservationDate, table.reservationTime, table.email)]);

export const staffUsers = pgTable("staff_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["ADMIN", "STAFF"] }).notNull(),
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staffSessions = pgTable("staff_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => staffUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
