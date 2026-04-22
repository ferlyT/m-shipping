import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

let connection;

try {
  connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  console.log(`✅ Connected to MySQL: ${process.env.DB_NAME} as ${process.env.DB_USER}`);
} catch (error: any) {
  console.error('❌ FAILED TO CONNECT TO MYSQL:');
  console.error(`   Host: ${process.env.DB_HOST}`);
  console.error(`   Database: ${process.env.DB_NAME}`);
  console.error(`   Error: ${error.message}`);
  process.exit(1); 
}

export const db = drizzle(connection, { schema, mode: 'default' });
