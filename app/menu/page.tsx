import { getMenu } from "@/server/menu-repository";
import { MenuBrowser } from "./menu-browser";
import { getRestaurantRules } from "@/server/availability";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [menu, rules] = await Promise.all([getMenu(), getRestaurantRules()]);
  return <main id="main" className="page-shell">
    <section className="page-intro container">
      <p className="eyebrow">Order for collection or delivery</p>
      <h1>The menu</h1>
      <p>Modern French favourites, built around the season. Collection is usually ready in 20–30 minutes; local delivery in 35–50 minutes.</p>
      <div className="service-notice"><span><b className={`status-dot ${rules.orderingEnabled ? "" : "closed-dot"}`} /> {rules.orderingEnabled ? "Ordering open" : "Online ordering paused"}</span><span>Delivery to selected Paris postcodes</span><span>Allergen details on every dish</span></div>
    </section>
    <MenuBrowser menu={menu} />
  </main>;
}
