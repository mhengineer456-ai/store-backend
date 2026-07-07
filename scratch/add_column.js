import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Mohitca0011',
    database: 'newdata'
  });

  try {
    console.log('Adding column repeat_against to designs table...');
    await connection.execute('ALTER TABLE designs ADD COLUMN repeat_against VARCHAR(100) NULL');
    console.log('✅ Column repeat_against added successfully!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Column repeat_against already exists.');
    } else {
      console.error('❌ Error altering database schema:', err);
    }
  } finally {
    await connection.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
