import type { Metadata } from "next";
export const metadata: Metadata = { title: "Menu & Online Ordering", description: "Browse Le Saphir’s modern French menu for collection and local Paris delivery.", alternates: { canonical: "/menu" } };
export default function MenuLayout({ children }: { children: React.ReactNode }) { return children; }
