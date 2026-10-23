import Link from "next/link";

export default function AllergensPage() {
  return <main id="main" className="page-shell"><section className="legal-page container"><p className="eyebrow">Food information</p><h1>Allergens & dietary needs</h1><p>Allergen information is displayed on each dish to support an informed choice. Our kitchen handles all major allergens, so we cannot guarantee the absence of traces or cross-contact.</p><h2>Before you order</h2><p>If you have a severe allergy, please call the restaurant before placing an order. The dietary badges describe the recipe, not an allergen-free preparation environment.</p><h2>Demonstration notice</h2><p>Le Saphir is a portfolio concept. Menu and allergen information in this milestone is illustrative and must not be used for a real food order.</p><Link className="button button-outline" href="/menu">Return to menu</Link></section></main>;
}
