import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function main() {
  console.log('Connecting to:', process.env.MYSQL_HOST);
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });

  try {
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in Aiven DB:', tables);
  } catch (err) {
    console.error('Error fetching tables:', err);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
