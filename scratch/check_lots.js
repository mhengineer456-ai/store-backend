import pool from '../db.js';

async function main() {
  try {
    const [rows] = await pool.execute('SELECT Lot_Number, Style, Fabric, Saved_At FROM cutting_header');
    console.log('--- ALL CUTTING HEADERS IN DB ---');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
