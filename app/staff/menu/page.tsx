import Link from "next/link";
import { StaffShell } from "@/components/staff-shell";
import { StaffSubmit } from "@/components/staff-submit";
import { getStaffMenu } from "@/server/staff-repository";
import { formatPrice } from "@/lib/format";
import { toggleMenuAvailabilityAction } from "../actions";

export const dynamic="force-dynamic";
export default async function StaffMenuPage(){const {user,items}=await getStaffMenu();return <StaffShell user={user} active="/staff/menu"><header className="staff-page-head"><div><p>Service availability</p><h1>Menu</h1></div><span>{items.filter(({item})=>!item.available).length} sold out</span></header><div className="staff-menu-list">{items.map(({item,category})=><article key={item.id}><div><span>{category}</span><h2>{item.name}</h2><p>{formatPrice(item.priceCents/100)} · {item.popular?"Popular":"Standard"}</p></div><span className={`availability ${item.available?"available":"unavailable"}`}>{item.available?"Available":"Sold out"}</span><div className="row-actions"><form action={toggleMenuAvailabilityAction}><input type="hidden" name="id" value={item.id}/><input type="hidden" name="available" value={String(!item.available)}/><StaffSubmit className={item.available?"staff-button danger":"staff-button"}>{item.available?"Mark sold out":"Make available"}</StaffSubmit></form>{user.role==="ADMIN"&&<Link className="staff-button secondary" href={`/staff/menu/${item.id}`}>Edit</Link>}</div></article>)}</div></StaffShell>}
