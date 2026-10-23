import { redirect } from "next/navigation";
import { getStaffSession } from "@/server/auth";
import { LoginForm } from "./login-form";

export const dynamic="force-dynamic";
export default async function StaffLoginPage(){if(await getStaffSession())redirect("/staff");return <main id="main" className="staff-login"><div><p className="staff-kicker">Le Saphir · Operations</p><h1>Service starts here.</h1><p>Sign in to manage today’s orders, reservations and menu availability.</p><LoginForm/><a href="/">← Return to restaurant</a></div></main>}
