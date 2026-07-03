import pool from '../db.js';

async function main() {
  try {
    const [doori] = await pool.execute('SELECT Lot_Number, Timestamp FROM doori');
    console.log('--- DOORI RECORDS ---');
    console.log(doori);

    const [cutting] = await pool.execute('SELECT Lot_Number, Saved_At, JobOrder_Date FROM cutting_header');
    console.log('--- CUTTING HEADER RECORDS ---');
    console.log(cutting);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
