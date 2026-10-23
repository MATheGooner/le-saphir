import Image from "next/image";
import Link from "next/link";
import type { MenuItem } from "@/types/menu";
import { formatPrice } from "@/lib/format";

export function MenuCard({ item, priority = false }: { item: MenuItem; priority?: boolean }) {
  return <article className={`menu-card ${!item.available ? "sold-out" : ""}`}>
    <Link href={item.available ? `/menu/${item.slug}` : "#"} aria-disabled={!item.available} tabIndex={item.available ? 0 : -1}>
      <div className="menu-card-image">
        <Image src={item.image} alt={item.name} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" priority={priority} />
        <div className="card-badges">
          {item.popular && <span className="badge badge-gold">Le Saphir favourite</span>}
          {!item.available && <span className="badge">Sold out today</span>}
        </div>
      </div>
      <div className="menu-card-body">
        <div className="card-heading"><h3>{item.name}</h3><strong>{formatPrice(item.price)}</strong></div>
        <p>{item.description}</p>
        <div className="card-meta"><span>{item.dietary.join(" · ") || "Chef’s selection"}</span>{item.available && <b>Choose +</b>}</div>
      </div>
    </Link>
  </article>;
}
