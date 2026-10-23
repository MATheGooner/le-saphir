import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

type DatabaseState = { client?: Sql; db?: PostgresJsDatabase<typeof schema> };
const state = globalThis as typeof globalThis & { __leSaphirDb?: DatabaseState };

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");
  state.__leSaphirDb ??= {};
  state.__leSaphirDb.client ??= postgres(databaseUrl, { max: process.env.NODE_ENV === "production" ? 10 : 3 });
  state.__leSaphirDb.db ??= drizzle(state.__leSaphirDb.client, { schema });
  return state.__leSaphirDb.db;
}
