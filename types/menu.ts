export type DietaryLabel = "Vegetarian" | "Vegan" | "Gluten-aware";

export type ModifierOption = {
  id: string;
  name: string;
  price: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  required: boolean;
  maxSelections?: number;
  options: ModifierOption[];
};

export type MenuItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "Starters" | "Mains" | "Sides" | "Desserts" | "Drinks";
  price: number;
  image: string;
  dietary: DietaryLabel[];
  allergens: string[];
  popular?: boolean;
  recommended?: boolean;
  available: boolean;
  modifierGroups?: ModifierGroup[];
};

export type CartSelection = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
};

export type CartItem = {
  lineId: string;
  menuItemId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
  selections: CartSelection[];
  notes?: string;
};
