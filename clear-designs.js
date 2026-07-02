import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS designs;", (err) => {
    if (err) {
      console.error("Error dropping designs table:", err.message);
    } else {
      console.log("Designs table successfully dropped from backend/database.db.");
    }
  });
  db.close();
});
