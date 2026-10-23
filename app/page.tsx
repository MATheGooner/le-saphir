import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, PinIcon } from "@/components/icons";
import { MenuCard } from "@/components/menu-card";
import { getPopularMenuItems } from "@/server/menu-repository";
import { absoluteUrl, RESTAURANT } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const popularItems = await getPopularMenuItems();
  return <main id="main">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Restaurant", name: RESTAURANT.name, url: absoluteUrl(), image: absoluteUrl("/images/hero.jpeg"), telephone: RESTAURANT.telephone, email: RESTAURANT.email, priceRange: "€€", servesCuisine: ["French", "Mediterranean"], acceptsReservations: true, address: { "@type": "PostalAddress", streetAddress: RESTAURANT.streetAddress, postalCode: RESTAURANT.postalCode, addressLocality: RESTAURANT.city, addressCountry: RESTAURANT.country }, openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "12:00", closes: "14:30" }, { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "18:00", closes: "22:30" }, { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday","Sunday"], opens: "12:00", closes: "22:30" }], potentialAction: [{ "@type": "ReserveAction", target: absoluteUrl("/reservations") }, { "@type": "OrderAction", target: absoluteUrl("/menu") }] }).replace(/</g, "\\u003c") }} />
    <section className="home-hero">
      <Image src="/images/hero.jpeg" alt="A candlelit table at Le Saphir" fill priority sizes="100vw" />
      <div className="hero-shade" />
      <div className="hero-copy container">
        <p className="eyebrow">Modern French kitchen · Paris 7e</p>
        <h1>Paris cooking,<br/><em>wherever you’re dining.</em></h1>
        <p className="hero-lede">Season-led plates, generous favourites and thoughtful details—served in our dining room, ready to collect, or delivered nearby.</p>
        <div className="hero-actions"><Link className="button button-gold" href="/menu">Order online <ArrowIcon /></Link><Link className="button button-ghost" href="/reservations">Book a table</Link></div>
        <div className="service-strip">
          <span><b className="status-dot" /> Open today until 22:30</span>
          <span><PinIcon /> 42 rue du Bac, Paris 7e</span>
          <span>Collection from 20 min · Local delivery</span>
        </div>
      </div>
    </section>

    <section className="section popular-section container">
      <div className="section-heading split-heading"><div><p className="eyebrow">Most ordered</p><h2>Le Saphir favourites</h2></div><div><p>Restaurant-quality dishes designed to travel beautifully.</p><Link className="text-link" href="/menu">View the full menu <ArrowIcon /></Link></div></div>
      <div className="card-grid">{popularItems.slice(0, 3).map((item, i) => <MenuCard item={item} key={item.id} priority={i < 2} />)}</div>
    </section>

    <section className="service-section">
      <div className="container service-grid">
        <div className="service-image"><Image src="/images/story.jpeg" alt="A composed dish from the Le Saphir kitchen" fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
        <div className="service-copy"><p className="eyebrow">One kitchen, three ways</p><h2>A restaurant evening.<br/>Even on a Tuesday.</h2><p>Our menu moves between French comfort and bright Mediterranean produce. Join us in Saint-Thomas-d’Aquin, collect on your way home, or order within our local delivery area.</p>
          <div className="service-options"><div><b>01</b><h3>Dine in</h3><p>Lunch and dinner, seven days.</p></div><div><b>02</b><h3>Collect</h3><p>Order ahead, ready from 20 minutes.</p></div><div><b>03</b><h3>Delivery</h3><p>Available within 4 km of the restaurant.</p></div></div>
          <Link className="button button-outline" href="/about">Meet the kitchen</Link>
        </div>
      </div>
    </section>

    <section className="reservation-banner">
      <Image src="/images/cta.jpeg" alt="The softly lit dining room at Le Saphir" fill sizes="100vw" />
      <div className="hero-shade" />
      <div className="container reservation-banner-copy"><p className="eyebrow">Stay for the evening</p><h2>Your table in the 7th</h2><p>Unhurried dinners, a concise wine list and a room made for conversation.</p><div><Link href="/reservations" className="button button-gold">Book a table</Link><Link href="/visit" className="button button-ghost">Plan your visit</Link></div></div>
    </section>
  </main>;
}
