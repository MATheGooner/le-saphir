import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { getOrderConfirmation } from "@/server/order-service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order Confirmation", robots: { index: false, follow: false } };
export default async function OrderConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params; const order = await getOrderConfirmation(reference);
  if (!order) notFound();
  return <main id="main" className="page-shell"><section className="confirmation container"><span className="confirmation-mark">✓</span><p className="eyebrow">Order received · {order.status}</p><h1>Thank you. Your order is in.</h1><p>Your persisted order reference is <strong>{order.reference}</strong>.</p><div className="confirmation-card"><span>{order.mode === "COLLECTION" ? "Collection" : "Delivery"}</span><b>{order.date} at {order.time.slice(0,5)} · {formatPrice(order.totalCents / 100)}</b><small>No payment was taken. This is a controlled portfolio order stored in PostgreSQL.</small></div><Link className="button button-gold" href="/">Return home</Link></section></main>;
}
