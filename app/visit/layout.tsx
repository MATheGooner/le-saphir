import type { Metadata } from "next";
export const metadata: Metadata = { title: "Visit", description: "Find Le Saphir at 42 rue du Bac in Paris 7e, with opening hours and directions.", alternates: { canonical: "/visit" } };
export default function VisitLayout({ children }: { children: React.ReactNode }) { return children; }
