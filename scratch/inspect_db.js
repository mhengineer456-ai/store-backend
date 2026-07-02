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
    const [cols] = await connection.execute('DESCRIBE cutting_header');
    console.log('--- cutting_header columns ---');
    console.log(cols.map(c => c.Field).join(', '));
  } catch (err) {
    console.error('Failed to describe cutting_header:', err.message);
  }

  try {
    const [cols] = await connection.execute('DESCRIBE doori');
    console.log('\n--- doori columns ---');
    console.log(cols.map(c => c.Field).join(', '));
  } catch (err) {
    console.error('Failed to describe doori:', err.message);
  }

  await connection.end();
}

main().catch(console.error);
