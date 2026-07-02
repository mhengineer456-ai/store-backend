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
    const [rows] = await connection.execute('SELECT Lot_Number, zip_payload FROM cutting_header WHERE zip_payload IS NOT NULL');
    console.log('Existing zip_payload rows count:', rows.length);
    if (rows.length > 0) {
      console.log('Sample zip_payload:', rows[0]);
    }
  } catch (err) {
    console.error('Failed to query zip_payload:', err.message);
  }

  try {
    const [rows] = await connection.execute('SELECT Lot_Number, dori_payload FROM doori WHERE dori_payload IS NOT NULL');
    console.log('Existing dori_payload rows count:', rows.length);
    if (rows.length > 0) {
      console.log('Sample dori_payload:', rows[0]);
    }
  } catch (err) {
    console.error('Failed to query dori_payload:', err.message);
  }

  await connection.end();
}

main().catch(console.error);
