import Link from "next/link";
import { notFound } from "next/navigation";
import { getReservationConfirmation } from "@/server/reservation-service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reservation Confirmation", robots: { index: false, follow: false } };
export default async function ReservationConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params; const reservation = await getReservationConfirmation(reference);
  if (!reservation) notFound();
  return <main id="main" className="page-shell"><section className="confirmation container"><span className="confirmation-mark">✓</span><p className="eyebrow">Reservation {reservation.status.toLowerCase()}</p><h1>Your table is confirmed.</h1><p>Reference <strong>{reservation.reference}</strong>.</p><div className="confirmation-card"><span>Le Saphir · Paris 7e</span><b>{reservation.date} at {reservation.time.slice(0,5)} · {reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}</b><small>42 rue du Bac, 75007 Paris</small></div><Link href="/" className="button button-gold">Return home</Link></section></main>;
}
