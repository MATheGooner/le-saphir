import Link from "next/link";

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-main container">
      <div><div className="brand footer-brand">Le Saphir<span>Paris</span></div><p>Modern French cooking, made for the table or your table at home.</p></div>
      <div><h2>Explore</h2><Link href="/menu">Order online</Link><Link href="/reservations">Book a table</Link><Link href="/about">Our kitchen</Link></div>
      <div><h2>Visit</h2><p>42 rue du Bac<br/>75007 Paris</p><Link href="/visit">Hours & directions</Link></div>
      <div><h2>Contact</h2><a href="tel:+33184250372">+33 1 84 25 03 72</a><a href="mailto:bonjour@lesaphir-paris.fr">bonjour@lesaphir-paris.fr</a></div>
    </div>
    <div className="footer-bottom container"><p>© 2026 Le Saphir. Portfolio demonstration.</p><p><Link href="/allergens">Allergens</Link> · Paris 7e</p></div>
  </footer>;
}
