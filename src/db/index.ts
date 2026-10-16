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
