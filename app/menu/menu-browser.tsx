"use client";

import { useState } from "react";
import { MenuCard } from "@/components/menu-card";
import type { MenuItem } from "@/types/menu";

const categories = ["All", "Starters", "Mains", "Sides", "Desserts", "Drinks"] as const;

export function MenuBrowser({ menu }: { menu: MenuItem[] }) {
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const shown = category === "All" ? menu : menu.filter((item) => item.category === category);
  return <>
    <div className="category-bar"><div className="container category-list" aria-label="Filter menu by category">{categories.map((item) => <button type="button" aria-pressed={category === item} className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div>
    <section className="section container menu-section" aria-live="polite"><div className="menu-results-heading"><h2>{category === "All" ? "Everything from the kitchen" : category}</h2><span>{shown.length} items</span></div>{shown.length ? <div className="card-grid">{shown.map((item) => <MenuCard item={item} key={item.id} />)}</div> : <div className="empty-inline"><h3>Nothing in this section today</h3><p>Please choose another category.</p></div>}</section>
  </>;
}
