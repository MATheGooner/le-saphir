import { z } from "zod";

const trimmed = (min: number, max: number) => z.string().trim().min(min).max(max);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const orderSchema = z.object({
  fulfilmentMode: z.enum(["COLLECTION", "DELIVERY"]),
  requestedDate: z.string().regex(datePattern),
  requestedTime: z.string().regex(timePattern),
  customer: z.object({ name: trimmed(2, 100), email: z.email().max(254), phone: trimmed(6, 30) }),
  delivery: z.object({ addressLine: trimmed(4, 160), postcode: trimmed(5, 10).transform((value) => value.replace(/\s/g, "")), city: trimmed(2, 80), notes: z.string().trim().max(240).optional() }).optional(),
  items: z.array(z.object({
    menuItemId: trimmed(1, 80), quantity: z.number().int().min(1).max(20),
    modifierOptionIds: z.array(trimmed(1, 80)).max(10), notes: z.string().trim().max(120).optional(),
  })).min(1).max(40),
  demoPaymentAccepted: z.literal(true),
}).superRefine((value, ctx) => {
  if (value.fulfilmentMode === "DELIVERY" && !value.delivery) ctx.addIssue({ code: "custom", path: ["delivery"], message: "A delivery address is required." });
});

export const reservationSchema = z.object({
  date: z.string().regex(datePattern), time: z.string().regex(timePattern), partySize: z.number().int().min(1).max(20),
  customer: z.object({ name: trimmed(2, 100), email: z.email().max(254), phone: trimmed(6, 30) }),
  specialRequests: z.string().trim().max(300).optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type ReservationInput = z.infer<typeof reservationSchema>;
