"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import { formatPrice, todayISO } from "@/lib/format";

type Mode = "collection" | "delivery";

export default function CheckoutPage() {
  const { items, subtotal, clearCart, hydrated } = useCart();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("collection");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fee = mode === "delivery" ? 3.9 : 0;
  const total = subtotal + fee;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      fulfilmentMode: mode === "delivery" ? "DELIVERY" : "COLLECTION",
      requestedDate: String(form.get("date") || ""), requestedTime: String(form.get("time") || ""),
      customer: { name: `${form.get("firstName") || ""} ${form.get("lastName") || ""}`.trim(), email: String(form.get("email") || ""), phone: String(form.get("phone") || "") },
      delivery: mode === "delivery" ? { addressLine: String(form.get("address") || ""), postcode: String(form.get("postcode") || ""), city: String(form.get("city") || ""), notes: String(form.get("deliveryNotes") || "") } : undefined,
      items: items.map((item) => ({ menuItemId: item.menuItemId, quantity: item.quantity, modifierOptionIds: item.selections.map((selection) => selection.optionId), notes: item.notes })),
      demoPaymentAccepted: form.get("demoPayment") === "on",
    };
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "We could not place your order.");
      clearCart(); router.push(`/order/${encodeURIComponent(result.reference)}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We could not place your order. Please try again."); setSubmitting(false); }
  }
  if (!hydrated) return <main id="main" className="page-shell container"><p>Loading checkout…</p></main>;
  if (!items.length) return <main id="main" className="page-shell"><section className="empty-state container"><h1>Nothing to check out yet</h1><p>Add a dish before continuing to checkout.</p><Link className="button button-gold" href="/menu">Browse the menu</Link></section></main>;

  return <main id="main" className="page-shell"><section className="checkout-page container"><p className="eyebrow">Secure demo checkout</p><h1>Complete your order</h1><form className="checkout-layout" onSubmit={submit}><div className="checkout-form">
    <fieldset className="checkout-section"><legend>1. How would you like your order?</legend><div className="mode-options"><label className={mode === "collection" ? "selected" : ""}><input type="radio" name="mode" value="collection" checked={mode === "collection"} onChange={() => setMode("collection")}/><b>Collection</b><span>From 42 rue du Bac · free</span></label><label className={mode === "delivery" ? "selected" : ""}><input type="radio" name="mode" value="delivery" checked={mode === "delivery"} onChange={() => setMode("delivery")}/><b>Local delivery</b><span>Selected Paris postcodes · €3.90</span></label></div><div className="field-grid"><label>Date<input type="date" name="date" min={todayISO()} required /></label><label>Time<select name="time" required defaultValue=""><option value="" disabled>Select a time</option><option>12:00</option><option>12:30</option><option>13:00</option><option>13:30</option><option>18:30</option><option>19:00</option><option>19:30</option><option>20:00</option><option>20:30</option><option>21:00</option><option>21:30</option></select></label></div></fieldset>
    {mode === "delivery" && <fieldset className="checkout-section"><legend>2. Delivery address</legend><div className="field-grid"><label className="wide">Street address<input name="address" autoComplete="street-address" required /></label><label>Postcode<input name="postcode" autoComplete="postal-code" pattern="75[0-9]{3}" placeholder="75007" required /></label><label>City<input name="city" value="Paris" readOnly /></label><label className="wide">Delivery notes <span>Optional</span><input name="deliveryNotes" placeholder="Door code, floor, instructions" /></label></div></fieldset>}
    <fieldset className="checkout-section"><legend>{mode === "delivery" ? "3" : "2"}. Your details</legend><div className="field-grid"><label>First name<input name="firstName" autoComplete="given-name" required /></label><label>Last name<input name="lastName" autoComplete="family-name" required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Phone<input name="phone" type="tel" autoComplete="tel" required /></label></div></fieldset>
    <fieldset className="checkout-section"><legend>{mode === "delivery" ? "4" : "3"}. Payment</legend><div className="demo-payment"><span>DEMO</span><div><b>Portfolio payment</b><p>Your menu choices and total will be verified by the server. No card details are requested and no money will be taken.</p></div></div><label className="check-label"><input name="demoPayment" type="checkbox" required/> I understand this is a demonstration order.</label></fieldset>
  </div><aside className="order-summary checkout-summary"><h2>Your order</h2>{items.map((item) => <div className="summary-line" key={item.lineId}><span>{item.quantity} × {item.name}<small>{item.selections.map((s) => s.optionName).join(", ")}</small></span><b>{formatPrice((item.unitPrice + item.selections.reduce((s, o) => s + o.price, 0)) * item.quantity)}</b></div>)}<hr/><div><span>Estimated subtotal</span><b>{formatPrice(subtotal)}</b></div><div><span>{mode === "delivery" ? "Delivery" : "Collection"}</span><b>{fee ? formatPrice(fee) : "Free"}</b></div><div className="summary-total"><span>Estimated total</span><strong>{formatPrice(total)}</strong></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-gold full-button" type="submit" disabled={submitting}>{submitting ? "Verifying order…" : "Validate & place demo order"}</button><small>The server recalculates the final total from current menu prices before creating the order.</small></aside></form></section></main>;
}
