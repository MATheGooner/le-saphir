import "server-only";
import { cache } from "react";
import { asc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { menuCategories, menuItems, modifierGroups, modifierOptions } from "@/db/schema";
import type { DietaryLabel, MenuItem } from "@/types/menu";

const categoryNames = ["Starters", "Mains", "Sides", "Desserts", "Drinks"] as const;
type CategoryName = (typeof categoryNames)[number];

function isCategory(value: string): value is CategoryName { return categoryNames.includes(value as CategoryName); }

export const getMenu = cache(async (): Promise<MenuItem[]> => {
  const db = getDb();
  const rows = await db.select({ item: menuItems, category: menuCategories.name })
    .from(menuItems).innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .orderBy(asc(menuCategories.sortOrder), asc(menuItems.sortOrder));
  const itemIds = rows.map(({ item }) => item.id);
  const groups = itemIds.length ? await db.select().from(modifierGroups).where(inArray(modifierGroups.menuItemId, itemIds)).orderBy(asc(modifierGroups.sortOrder)) : [];
  const groupIds = groups.map((group) => group.id);
  const options = groupIds.length ? await db.select().from(modifierOptions).where(inArray(modifierOptions.groupId, groupIds)).orderBy(asc(modifierOptions.sortOrder)) : [];

  return rows.map(({ item, category }) => {
    if (!isCategory(category)) throw new Error(`Unsupported menu category: ${category}`);
    const itemGroups = groups.filter((group) => group.menuItemId === item.id);
    return {
      id: item.id, slug: item.slug, name: item.name, description: item.description, category,
      price: item.priceCents / 100, image: item.image, dietary: item.dietary as DietaryLabel[], allergens: item.allergens,
      popular: item.popular, recommended: item.recommended, available: item.available,
      modifierGroups: itemGroups.length ? itemGroups.map((group) => ({
        id: group.id, name: group.name, required: group.required, maxSelections: group.maxSelections,
        options: options.filter((option) => option.groupId === group.id && option.available).map((option) => ({ id: option.id, name: option.name, price: option.priceCents / 100 })),
      })) : undefined,
    };
  });
});

export async function getMenuItemBySlug(slug: string) { return (await getMenu()).find((item) => item.slug === slug); }
export async function getPopularMenuItems() { return (await getMenu()).filter((item) => item.popular && item.available); }
