import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'gpdms.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, email, role, verified, otp_code, otp_expires FROM users', [], (err, rows) => {
  if (err) {
    console.error('Error reading database:', err.message);
  } else {
    console.log('\n=== REGISTERED USERS IN DATABASE ===');
    console.table(rows);
    console.log('====================================\n');
  }
  db.close();
});
