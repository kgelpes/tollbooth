import { Pool } from "pg";

const connectionString =
  process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL ?? "";

if (!connectionString) {
  throw new Error(
    "Missing database connection string: set SUPABASE_DB_URL or DATABASE_URL",
  );
}

export const dbPool = new Pool({ connectionString });


