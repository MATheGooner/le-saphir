"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import type { CartSelection, MenuItem } from "@/types/menu";

export function DishConfigurator({ item, orderingEnabled = true }: { item: MenuItem; orderingEnabled?: boolean }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>(() => Object.fromEntries((item.modifierGroups || []).map((group) => [group.id, []])));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const selections = useMemo<CartSelection[]>(() => (item.modifierGroups || []).flatMap((group) => selected[group.id].map((id) => {
    const option = group.options.find((choice) => choice.id === id)!;
    return { groupId: group.id, groupName: group.name, optionId: option.id, optionName: option.name, price: option.price };
  })), [item.modifierGroups, selected]);
  const total = (item.price + selections.reduce((sum, option) => sum + option.price, 0)) * quantity;

  function toggle(groupId: string, optionId: string, max = 1) {
    setSelected((current) => {
      const values = current[groupId];
      return { ...current, [groupId]: values.includes(optionId) ? values.filter((id) => id !== optionId) : max === 1 ? [optionId] : [...values, optionId].slice(-max) };
    });
    setError("");
  }

  function submit() {
    const missing = item.modifierGroups?.find((group) => group.required && selected[group.id].length === 0);
    if (missing) { setError(`Please choose an option for “${missing.name}”.`); return; }
    const signature = selections.map((s) => s.optionId).sort().join("-") || "standard";
    addItem({ lineId: `${item.id}-${signature}-${notes.trim().toLowerCase()}`, menuItemId: item.id, name: item.name, image: item.image, unitPrice: item.price, quantity, selections, notes: notes.trim() });
    router.push("/cart");
  }

  return <section className="dish-page container">
    <Link className="back-link" href="/menu">← Back to menu</Link>
    <div className="dish-layout">
      <div className="dish-image"><Image src={item.image} alt={item.name} fill priority sizes="(max-width: 850px) 100vw, 50vw" /></div>
      <div className="dish-details"><p className="eyebrow">{item.category}</p><h1>{item.name}</h1><p className="dish-price">{formatPrice(item.price)}</p><p className="dish-description">{item.description}</p>
        <div className="dietary-row">{item.dietary.map((label) => <span key={label}>{label}</span>)}</div>
        {item.modifierGroups?.map((group) => <fieldset className="modifier-group" key={group.id}><legend>{group.name} {group.required ? <small>Required</small> : <small>Optional · up to {group.maxSelections || 1}</small>}</legend>{group.options.map((option) => <label key={option.id}><input type={group.maxSelections === 1 ? "radio" : "checkbox"} name={group.id} checked={selected[group.id].includes(option.id)} onChange={() => toggle(group.id, option.id, group.maxSelections)} /><span>{option.name}</span><b>{option.price ? `+${formatPrice(option.price)}` : "Included"}</b></label>)}</fieldset>)}
        <div className="order-notes"><label htmlFor="notes">Kitchen note <small>Optional</small></label><textarea id="notes" maxLength={120} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="For example: sauce on the side"/><span>{notes.length}/120</span></div>
        <div className="allergen-box"><b>Allergens</b><p>{item.allergens.length ? item.allergens.join(", ") : "No declarable allergens."} Prepared in a kitchen that handles all major allergens.</p></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {!orderingEnabled && <p className="form-error" role="status">Online ordering is temporarily paused. You can still browse the menu.</p>}
        <div className="dish-add"><div className="quantity-control" aria-label="Quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">−</button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button></div><button className="button button-gold" disabled={!item.available || !orderingEnabled} onClick={submit}>Add to cart · {formatPrice(total)}</button></div>
      </div>
    </div>
  </section>;
}
