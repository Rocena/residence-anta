import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local if it exists
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://anta:password@localhost:5432/anta_db',
  }
} satisfies Config;
