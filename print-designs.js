import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.all('SELECT id, name, bom FROM designs', [], (err, rows) => {
  if (err) {
    console.error('Error querying designs:', err.message);
  } else {
    console.log('\n=== DESIGNS IN DATABASE ===');
    rows.forEach(row => {
      console.log(`\nDesign ID: ${row.id} - ${row.name}`);
      try {
        const bom = JSON.parse(row.bom);
        console.table(bom.filter(item => item.status === 'Yes'));
      } catch (e) {
        console.log('BOM raw:', row.bom);
      }
    });
    console.log('===========================\n');
  }
  db.close();
});
