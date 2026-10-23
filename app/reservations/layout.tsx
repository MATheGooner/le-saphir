import type { Metadata } from "next";
export const metadata: Metadata = { title: "Book a Table", description: "Reserve a table at Le Saphir in Paris 7e.", alternates: { canonical: "/reservations" } };
export default function ReservationsLayout({ children }: { children: React.ReactNode }) { return children; }
