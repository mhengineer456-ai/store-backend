import pool from '../db.js';

async function main() {
  try {
    const [designs] = await pool.execute('SELECT * FROM designs WHERE id = ?', ['11028']);
    console.log('DESIGN:', designs[0]);
    
    const [history] = await pool.execute('SELECT * FROM design_history WHERE lotId = ?', ['11028']);
    console.log('HISTORY:', history);
    
    const [scans] = await pool.execute('SELECT * FROM scans WHERE lot_number = ?', ['11028']);
    console.log('SCANS:', scans);

    const [doori] = await pool.execute('SELECT * FROM doori WHERE Lot_Number = ?', ['11028']);
    console.log('DOORI:', doori);

    const [cutting] = await pool.execute('SELECT * FROM cutting_header WHERE Lot_Number = ?', ['11028']);
    console.log('CUTTING HEADER:', cutting);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
