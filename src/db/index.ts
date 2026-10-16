import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL;

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(connectionString && connectionString.trim().length > 0);
}

export function getPool(): Pool | null {
  if (!connectionString) return null;
  if (!pool) {
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export function getDb() {
  if (!dbInstance) {
    const activePool = getPool();
    if (activePool) {
      dbInstance = drizzle(activePool, { schema });
    } else {
      // Dummy pool for compilation/build time without crashing
      dbInstance = drizzle(new Pool({ connectionString: 'postgres://dummy:dummy@localhost:5432/dummy' }), { schema });
    }
  }
  return dbInstance;
}

export const db = getDb();
export { schema };

let schemaPromise: Promise<void> | null = null;

export async function ensureSchema(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    const p = getPool();
    if (!p) return;
    try {
      const client = await p.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS roles (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL UNIQUE,
            description text
          );
          CREATE TABLE IF NOT EXISTS permissions (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name text NOT NULL UNIQUE
          );
          CREATE TABLE IF NOT EXISTS users (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            reference text UNIQUE,
            name text NOT NULL,
            email text NOT NULL UNIQUE,
            password_hash text NOT NULL,
            role text DEFAULT 'gestionnaire' NOT NULL,
            role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
            residence_ids jsonb DEFAULT '["*"]'::jsonb,
            avatar text,
            two_factor_enabled boolean DEFAULT false NOT NULL,
            hide_online_status boolean DEFAULT false NOT NULL,
            is_active boolean DEFAULT true NOT NULL,
            created_at timestamp DEFAULT now() NOT NULL,
            last_login_at timestamp,
            deleted_at timestamp
          );
          CREATE TABLE IF NOT EXISTS residences (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            reference text UNIQUE,
            name text NOT NULL,
            address text NOT NULL,
            city text,
            country text,
            manager_name text,
            description text,
            created_at timestamp DEFAULT now() NOT NULL
          );
          CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            email text NOT NULL,
            token text NOT NULL UNIQUE,
            expires_at timestamp NOT NULL,
            used_at timestamp,
            created_at timestamp DEFAULT now() NOT NULL
          );
          INSERT INTO roles (name, description) VALUES
            ('super_admin', 'Super Administrateur Global'),
            ('admin', 'Administrateur système'),
            ('proprietaire', 'Propriétaire'),
            ('gestionnaire', 'Gestionnaire'),
            ('intendant', 'Intendant'),
            ('comptable', 'Comptable'),
            ('technicien', 'Technicien')
          ON CONFLICT (name) DO NOTHING;
        `);
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn("[ensureSchema] Auto-migration error:", err);
    }
  })();

  return schemaPromise;
}
