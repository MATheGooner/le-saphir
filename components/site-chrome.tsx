"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/staff")) {
    return children;
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <Header />
    {children}
    <Footer />
  </>;
}
