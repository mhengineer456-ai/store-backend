import mysql from 'mysql2/promise';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseDotEnvCaseSensitive(filePath) {
  const config = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        const val = trimmed.substring(index + 1).trim();
        config[key] = val;
      }
    }
  } catch (err) {
    console.error('Error reading .env file:', err.message);
  }
  return config;
}

async function testConnection() {
  const envConfig = parseDotEnvCaseSensitive(path.join(__dirname, '../.env'));

  const host = envConfig['host'] || envConfig['MYSQL_HOST'] || 'localhost';
  const port = Number(envConfig['port'] || envConfig['MYSQL_PORT']) || 3306;
  const user = envConfig['user'] || envConfig['MYSQL_USER'] || 'root';
  const password = envConfig['password'] || envConfig['MYSQL_PASSWORD'] || '';
  const database = envConfig['defaultdatabase'] || envConfig['MYSQL_DATABASE'] || 'defaultdb';

  console.log('Testing connection to Aiven MySQL (Case-Sensitive Parsing) with:');
  console.log(`Host: ${host}`);
  console.log(`Port: ${port}`);
  console.log(`User: ${user}`);
  console.log(`Database: ${database}`);
  console.log('Password length:', password ? password.length : 0);

  // Test 1: Without SSL
  console.log('\n--- Test 1: Connecting WITHOUT SSL ---');
  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 10000
    });
    console.log('✅ Connected successfully without SSL!');
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Query result:', rows);
    await connection.end();
  } catch (error) {
    console.log('❌ Connection failed without SSL:', error.message);
  }

  // Test 2: With SSL (rejectUnauthorized: false)
  console.log('\n--- Test 2: Connecting WITH SSL (rejectUnauthorized: false) ---');
  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 10000
    });
    console.log('✅ Connected successfully with SSL!');
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Query result:', rows);
    await connection.end();
  } catch (error) {
    console.log('❌ Connection failed with SSL:', error.message);
  }
}

testConnection();

