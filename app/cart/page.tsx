"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { MenuCard } from "@/components/menu-card";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/types/menu";

export default function CartPage() {
  const { items, hydrated, subtotal, setQuantity, removeItem } = useCart();
  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
  useEffect(() => { fetch("/api/menu?popular=true").then((response) => response.ok ? response.json() : Promise.reject()).then((data) => setRecommendations(data.items.slice(0, 3))).catch(() => setRecommendations([])); }, []);
  if (!hydrated) return <main id="main" className="page-shell container cart-page"><p>Loading your cart…</p></main>;
  if (!items.length) return <main id="main" className="page-shell"><section className="empty-state container"><p className="eyebrow">Your order</p><h1>Your cart is empty</h1><p>Start with a Le Saphir favourite, then make it yours.</p><Link className="button button-gold" href="/menu">Explore the menu</Link></section>{recommendations.length > 0 && <section className="section container"><h2>You might like</h2><div className="card-grid compact-grid">{recommendations.map((item) => <MenuCard item={item} key={item.id}/>)}</div></section>}</main>;

  return <main id="main" className="page-shell"><section className="cart-page container"><p className="eyebrow">Your order</p><h1>Cart</h1><div className="cart-layout"><div className="cart-items">{items.map((item) => <article className="cart-line" key={item.lineId}><div className="cart-line-image"><Image src={item.image} alt="" fill sizes="120px"/></div><div className="cart-line-info"><div><h2>{item.name}</h2><strong>{formatPrice((item.unitPrice + item.selections.reduce((s, o) => s + o.price, 0)) * item.quantity)}</strong></div>{item.selections.length > 0 && <p>{item.selections.map((s) => s.optionName).join(" · ")}</p>}{item.notes && <p>Note: {item.notes}</p>}<div className="line-actions"><div className="quantity-control"><button onClick={() => setQuantity(item.lineId, item.quantity - 1)} aria-label={`Decrease ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={() => setQuantity(item.lineId, item.quantity + 1)} aria-label={`Increase ${item.name}`}>+</button></div><button className="remove-link" onClick={() => removeItem(item.lineId)}>Remove</button></div></div></article>)}<Link className="text-link" href="/menu">← Add more dishes</Link></div><aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div><p>Delivery fees and any minimum order are calculated after you choose collection or delivery.</p><div className="summary-total"><span>Total so far</span><strong>{formatPrice(subtotal)}</strong></div><Link className="button button-gold full-button" href="/checkout">Continue to checkout</Link><small>Demo checkout · No payment will be taken</small></aside></div></section></main>;
}
