import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
});

const sql = fs.readFileSync(path.join(__dirname, '001_create_tables.sql'), 'utf8');

console.log('Running migrations...');
await connection.query(sql);
console.log('All tables created successfully.');

await connection.end();
