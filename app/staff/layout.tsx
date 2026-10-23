import type { Metadata } from "next";
export const metadata: Metadata = { title: "Staff Operations", robots: { index: false, follow: false, noarchive: true, nocache: true } };
export default function StaffLayout({ children }: { children: React.ReactNode }) { return children; }
