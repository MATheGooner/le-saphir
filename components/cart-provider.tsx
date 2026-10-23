"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types/menu";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "le-saphir-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    hydrated,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + (item.unitPrice + item.selections.reduce((s, option) => s + option.price, 0)) * item.quantity, 0),
    addItem: (incoming) => setItems((current) => {
      const match = current.find((item) => item.lineId === incoming.lineId);
      return match
        ? current.map((item) => item.lineId === incoming.lineId ? { ...item, quantity: item.quantity + incoming.quantity } : item)
        : [...current, incoming];
    }),
    removeItem: (lineId) => setItems((current) => current.filter((item) => item.lineId !== lineId)),
    setQuantity: (lineId, quantity) => setItems((current) => quantity < 1
      ? current.filter((item) => item.lineId !== lineId)
      : current.map((item) => item.lineId === lineId ? { ...item, quantity } : item)),
    clearCart: () => setItems([]),
  }), [items, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
