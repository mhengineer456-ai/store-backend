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
    const [rows] = await connection.execute('SELECT * FROM doori LIMIT 1');
    console.log('doori rows count:', rows.length);
    if (rows.length > 0) {
      console.log('Sample doori row:');
      console.log(JSON.stringify(rows[0], null, 2));
    }
  } catch (err) {
    console.error('Failed to query doori:', err.message);
  }

  await connection.end();
}

main().catch(console.error);
