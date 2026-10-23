import assert from "node:assert/strict";
import test from "node:test";
import { orderConfirmationEmail, reservationConfirmationEmail } from "../lib/email-content.ts";

test("order email contains operational details and escapes customer content", () => {
  const message = orderConfirmationEmail({ reference: "LS-123", email: "guest@example.com", customerName: "A <Guest>", mode: "COLLECTION", requestedDate: "2026-11-02", requestedTime: "19:00", totalCents: 2900, items: [{ name: "Steak & frites", quantity: 1, options: ["Medium rare"], lineCents: 2900 }] });
  assert.equal(message.to, "guest@example.com");
  assert.match(message.subject, /LS-123/);
  assert.match(message.html, /A &lt;Guest&gt;/);
  assert.match(message.html, /Steak &amp; frites/);
  assert.match(message.html, /€29\.00/);
});

test("reservation email contains date, time, party size and location", () => {
  const message = reservationConfirmationEmail({ reference: "TABLE-123", email: "guest@example.com", customerName: "Guest", date: "2026-11-02", time: "20:30", partySize: 4 });
  assert.match(message.html, /2026-11-02/);
  assert.match(message.html, /20:30/);
  assert.match(message.html, /4 guests/);
  assert.match(message.html, /42 rue du Bac/);
});
