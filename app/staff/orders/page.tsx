import Link from "next/link";
import { StaffShell } from "@/components/staff-shell";
import { requireStaff } from "@/server/auth";
import { getStaffOrders } from "@/server/staff-repository";
import { formatPrice } from "@/lib/format";

export const dynamic="force-dynamic";
export default async function StaffOrdersPage(){const user=await requireStaff();const orders=await getStaffOrders();return <StaffShell user={user} active="/staff/orders"><header className="staff-page-head"><div><p>Kitchen queue</p><h1>Orders</h1></div><span>{orders.length} recent orders</span></header><div className="staff-table-wrap"><table className="staff-table"><thead><tr><th>Order</th><th>Customer</th><th>Fulfilment</th><th>Requested</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><Link href={`/staff/orders/${order.id}`}><b>{order.reference}</b></Link><small>{order.createdAt.toLocaleString("en-GB")}</small></td><td>{order.customer}</td><td>{order.mode}</td><td>{order.date}<br/>{order.time.slice(0,5)}</td><td>{formatPrice(order.totalCents/100)}</td><td><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></td></tr>)}</tbody></table>{!orders.length&&<p className="staff-empty">No orders yet.</p>}</div></StaffShell>}
