"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { todayISO } from "@/lib/format";

export default function ReservationsPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!date) { setSlots([]); return; }
    const controller = new AbortController(); setLoadingSlots(true); setError(""); setTime("");
    fetch(`/api/reservations/slots?date=${encodeURIComponent(date)}&partySize=${partySize}`, { signal: controller.signal })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error?.message); return data; })
      .then((data) => setSlots(data.slots)).catch((caught) => { if (caught.name !== "AbortError") setError(caught.message || "Availability could not be loaded."); })
      .finally(() => setLoadingSlots(false));
    return () => controller.abort();
  }, [date, partySize]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(""); const form = new FormData(event.currentTarget);
    const payload = { date, time, partySize, customer: { name: String(form.get("name") || ""), email: String(form.get("email") || ""), phone: String(form.get("phone") || "") }, specialRequests: String(form.get("requests") || "") };
    try {
      const response = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error?.message || "We could not complete your reservation.");
      router.push(`/reservations/${encodeURIComponent(result.reference)}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We could not complete your reservation."); setSubmitting(false); }
  }

  return <main id="main" className="page-shell">
    <section className="booking-hero"><div className="container"><p className="eyebrow">Reservations</p><h1>Make an evening of it.</h1><p>Lunch, dinner and a dining room designed for long conversations in the heart of Paris 7e.</p></div></section>
    <section className="booking-section container"><form className="reservation-form" onSubmit={submit}>
      <div className="reservation-copy"><h2>Book your table</h2><p>Choose from live server-owned availability. For groups larger than eight, please call us.</p><div className="booking-detail"><b>Opening hours</b><p>Mon–Fri 12:00–14:30 & 18:00–22:30<br/>Sat–Sun 12:00–22:30</p></div></div>
      <div className="reservation-fields"><div className="field-grid">
        <label>Date<input type="date" min={todayISO()} name="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <label>Guests<select name="guests" value={partySize} onChange={(event) => setPartySize(Number(event.target.value))} required>{[1,2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}</select></label>
        <label className="wide">Available time<select name="time" value={time} onChange={(event) => setTime(event.target.value)} disabled={!date || loadingSlots || slots.length === 0} required><option value="">{loadingSlots ? "Checking availability…" : slots.length ? "Select a time" : date ? "No tables available" : "Choose a date first"}</option>{slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></label>
        <label>Full name<input name="name" autoComplete="name" required /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" required /></label>
        <label className="wide">Special requests <span>Optional</span><textarea name="requests" maxLength={300} placeholder="Dietary needs, access requirements, or an occasion"/></label>
      </div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-gold full-button" type="submit" disabled={!time || submitting}>{submitting ? "Confirming table…" : "Confirm this table"}</button></div>
    </form></section>
  </main>;
}
