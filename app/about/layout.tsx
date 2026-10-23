import type { Metadata } from "next";
export const metadata: Metadata = { title: "Our Kitchen", description: "Discover the approach behind Le Saphir’s relaxed modern French cooking.", alternates: { canonical: "/about" } };
export default function AboutLayout({ children }: { children: React.ReactNode }) { return children; }
