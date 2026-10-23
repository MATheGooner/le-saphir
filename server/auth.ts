import "server-only";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { staffSessions, staffUsers } from "@/db/schema";
import { can, type StaffCapability, type StaffRole } from "@/lib/staff-permissions";
import { ServiceError } from "./service-error";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "le_saphir_staff";
const SESSION_DAYS = 7;

export async function hashPassword(password: string) {
  const salt = randomBytes(16); const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [algorithm, saltHex, hashHex] = stored.split(":"); if (algorithm !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex"); const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url"); const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await getDb().insert(staffSessions).values({ userId, tokenHash: tokenHash(token), expiresAt });
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt, priority: "high" });
}
export async function destroySession() {
  const store = await cookies(); const token = store.get(COOKIE_NAME)?.value;
  if (token) await getDb().delete(staffSessions).where(eq(staffSessions.tokenHash, tokenHash(token)));
  store.delete(COOKIE_NAME);
}
export async function getStaffSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value; if (!token) return null;
  const [result] = await getDb().select({ id: staffUsers.id, email: staffUsers.email, name: staffUsers.name, role: staffUsers.role })
    .from(staffSessions).innerJoin(staffUsers, eq(staffSessions.userId, staffUsers.id))
    .where(and(eq(staffSessions.tokenHash, tokenHash(token)), gt(staffSessions.expiresAt, new Date()), eq(staffUsers.active, true))).limit(1);
  return result || null;
}
export async function requireStaff(capability: StaffCapability = "VIEW_OPERATIONS") {
  const user = await getStaffSession(); if (!user) redirect("/staff/login");
  if (!can(user.role as StaffRole, capability)) throw new ServiceError("FORBIDDEN", "You do not have permission to perform this action.", 403);
  return { ...user, role: user.role as StaffRole };
}
export async function authenticateStaff(email: string, password: string) {
  const [user] = await getDb().select().from(staffUsers).where(and(eq(staffUsers.email, email.toLowerCase()), eq(staffUsers.active, true))).limit(1);
  if (!user) { await scrypt(password, Buffer.alloc(16), 64); return null; }
  if (!(await verifyPassword(password, user.passwordHash))) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role as StaffRole };
}
