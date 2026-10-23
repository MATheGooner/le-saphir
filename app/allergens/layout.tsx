import type { Metadata } from "next";
export const metadata: Metadata = { title: "Allergens & Dietary Information", description: "Allergen and dietary guidance for the Le Saphir menu.", alternates: { canonical: "/allergens" } };
export default function AllergensLayout({ children }: { children: React.ReactNode }) { return children; }
