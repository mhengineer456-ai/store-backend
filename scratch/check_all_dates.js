import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'newdata'
  });

  try {
    const [rows] = await connection.execute("SELECT id, lot_number, scan_type, scanned_at FROM scans WHERE scan_type = 'rgp_entry'");
    console.log('All RGP scans:');
    console.log(rows);
  } catch (err) {
    console.error('Failed to query scans:', err.message);
  }

  await connection.end();
}

main().catch(console.error);
