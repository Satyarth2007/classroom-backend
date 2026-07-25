import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL is not defined. Set it in your environment to enable database queries.');
}

const sql = databaseUrl ? neon(databaseUrl) : null;
export const db = sql ? drizzle(sql) : null;
