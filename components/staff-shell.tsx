import Link from "next/link";
import type { StaffRole } from "@/lib/staff-permissions";
import { logoutAction } from "@/app/staff/actions";

export function StaffShell({ user, active, children }: { user: { name: string; role: StaffRole }; active: string; children: React.ReactNode }) {
  const links = [{href:"/staff",label:"Overview"},{href:"/staff/orders",label:"Orders"},{href:"/staff/reservations",label:"Reservations"},{href:"/staff/menu",label:"Menu"},...(user.role === "ADMIN" ? [{href:"/staff/settings",label:"Settings"}] : [])];
  return <div className="staff-app"><a className="skip-link" href="#staff-main">Skip to operations</a><aside className="staff-sidebar"><Link href="/staff" className="staff-brand">Le Saphir <span>Operations</span></Link><nav aria-label="Staff navigation">{links.map(link=><Link key={link.href} aria-current={active===link.href?"page":undefined} className={active===link.href?"active":""} href={link.href}>{link.label}</Link>)}</nav><div className="staff-user"><b>{user.name}</b><span>{user.role}</span><form action={logoutAction}><button type="submit">Log out</button></form></div></aside><main id="staff-main" className="staff-main">{children}</main></div>;
}
