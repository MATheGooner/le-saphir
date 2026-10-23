import { notFound } from "next/navigation";
import { getMenuItemBySlug } from "@/server/menu-repository";
import { DishConfigurator } from "./dish-configurator";
import { getRestaurantRules } from "@/server/availability";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const item = await getMenuItemBySlug((await params).slug);
  if (!item) return { title: "Dish not found", robots: { index: false, follow: false } };
  return { title: item.name, description: item.description, alternates: { canonical: `/menu/${item.slug}` }, openGraph: { title: `${item.name} | Le Saphir`, description: item.description, images: [{ url: item.image }] } };
}

export default async function DishPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [item, rules] = await Promise.all([getMenuItemBySlug(slug), getRestaurantRules()]);
  if (!item) notFound();
  return <main id="main" className="page-shell"><DishConfigurator item={item} orderingEnabled={rules.orderingEnabled} /></main>;
}
