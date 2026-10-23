import "dotenv/config";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import postgres from "postgres";

const email = process.env.STAFF_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.STAFF_ADMIN_PASSWORD;
const name = process.env.STAFF_ADMIN_NAME?.trim() || "Le Saphir Admin";
if (!process.env.DATABASE_URL || !email || !password || password.length < 12) {
  console.error("Set DATABASE_URL, STAFF_ADMIN_EMAIL, and STAFF_ADMIN_PASSWORD (minimum 12 characters)."); process.exit(1);
}
const scrypt = promisify(scryptCallback); const salt = randomBytes(16); const derived = await scrypt(password, salt, 64);
const passwordHash = `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
await sql`INSERT INTO staff_users (email,name,role,password_hash,active) VALUES (${email},${name},'ADMIN',${passwordHash},true)
ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, role='ADMIN', password_hash=EXCLUDED.password_hash, active=true`;
await sql.end(); console.log(`Admin account ready: ${email}`);
