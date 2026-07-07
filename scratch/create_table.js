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
    console.log('Checking database table for material_transfers...');
    await connection.execute(`CREATE TABLE IF NOT EXISTS material_transfers (
      id               INT PRIMARY KEY AUTO_INCREMENT,
      materialCode     VARCHAR(50)   NOT NULL,
      materialName     VARCHAR(255)  NOT NULL,
      fromLocation     VARCHAR(255)  NOT NULL,
      toLocation       VARCHAR(255)  NOT NULL,
      quantity         INT           DEFAULT 0,
      transferType     VARCHAR(50)   DEFAULT 'packet',
      operator         VARCHAR(255)  DEFAULT 'Admin',
      transferredAt    DATETIME      DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✅ Table material_transfers created or already exists!');

    const [rows] = await connection.execute('SHOW TABLES LIKE "material_transfers"');
    console.log('Tables check:', rows);
  } catch (err) {
    console.error('❌ Error executing database setup:', err);
  } finally {
    await connection.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
