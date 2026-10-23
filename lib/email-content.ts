import { RESTAURANT } from "./site.ts";

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
const euros = (cents: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(cents / 100);

export type OrderEmailData = {
  reference: string; email: string; customerName: string; mode: "COLLECTION" | "DELIVERY";
  requestedDate: string; requestedTime: string; totalCents: number;
  items: Array<{ name: string; quantity: number; options: string[]; lineCents: number }>;
};

export function orderConfirmationEmail(data: OrderEmailData) {
  const lines = data.items.map((item) => `<li>${item.quantity} × ${escapeHtml(item.name)}${item.options.length ? ` — ${item.options.map(escapeHtml).join(", ")}` : ""} (${euros(item.lineCents)})</li>`).join("");
  return {
    to: data.email,
    subject: `Order ${data.reference} received — ${RESTAURANT.name}`,
    html: `<h1>Thank you, ${escapeHtml(data.customerName)}.</h1><p>We have received order <strong>${escapeHtml(data.reference)}</strong>.</p><ul>${lines}</ul><p><strong>Total:</strong> ${euros(data.totalCents)}</p><p>${data.mode === "COLLECTION" ? "Collection" : "Delivery"}: ${escapeHtml(data.requestedDate)} at ${escapeHtml(data.requestedTime)}</p><p>${RESTAURANT.streetAddress}, ${RESTAURANT.postalCode} ${RESTAURANT.city}<br>${RESTAURANT.telephone}</p>`,
  };
}

export type ReservationEmailData = { reference: string; email: string; customerName: string; date: string; time: string; partySize: number };
export function reservationConfirmationEmail(data: ReservationEmailData) {
  return {
    to: data.email,
    subject: `Reservation ${data.reference} confirmed — ${RESTAURANT.name}`,
    html: `<h1>Your table is confirmed.</h1><p>Thank you, ${escapeHtml(data.customerName)}. Your reference is <strong>${escapeHtml(data.reference)}</strong>.</p><p>${escapeHtml(data.date)} at ${escapeHtml(data.time)} for ${data.partySize} ${data.partySize === 1 ? "guest" : "guests"}.</p><p>${RESTAURANT.streetAddress}, ${RESTAURANT.postalCode} ${RESTAURANT.city}<br>${RESTAURANT.telephone}</p>`,
  };
}
