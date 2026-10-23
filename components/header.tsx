"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BagIcon } from "@/components/icons";
import { useCart } from "@/components/cart-provider";

const links = [
  { href: "/menu", label: "Menu" },
  { href: "/reservations", label: "Reservations" },
  { href: "/visit", label: "Visit" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return <>
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Le Saphir home">Le Saphir<span>Paris</span></Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map((link) => <Link key={link.href} className={pathname === link.href ? "active" : ""} href={link.href}>{link.label}</Link>)}
      </nav>
      <div className="header-actions">
        <Link href="/menu" className="button button-gold header-order">Order online</Link>
        <Link href="/cart" className="cart-button" aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}>
          <BagIcon /><span>Cart</span>{count > 0 && <b>{count}</b>}
        </Link>
        <button className="menu-toggle" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>
          <span className="sr-only">{open ? "Close" : "Open"} navigation</span><i /><i />
        </button>
      </div>
    </header>
    <div ref={menuRef} id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open ? true : undefined}>
      <nav aria-label="Mobile navigation">
        <Link className="mobile-primary" href="/menu">Order online <span>Collection & delivery</span></Link>
        {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
      </nav>
      <p>42 rue du Bac, Paris 7e<br/>Open today 12:00–22:30</p>
    </div>
  </>;
}
