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
    await connection.execute('ALTER TABLE designs ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    console.log('ALTER TABLE designs succeeded!');
  } catch (err) {
    console.error('ALTER TABLE designs failed:', err);
  }
  const [rows] = await connection.execute('DESCRIBE designs');
  console.log(JSON.stringify(rows, null, 2));
  await connection.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
