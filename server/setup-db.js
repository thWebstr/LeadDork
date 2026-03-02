import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
  const adminClient = new Client({
    user: 'postgres',
    password: process.env.DB_PASSWORD || 'postgres', // default if not in env
    host: 'localhost',
    port: 5432,
    database: 'postgres',
  });

  try {
    await adminClient.connect();
    console.log('Connected to postgres admin db.');
    
    // Check if db exists
    const res = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname='leaddork'`);
    if (res.rowCount === 0) {
      console.log('Creating leaddork database...');
      await adminClient.query('CREATE DATABASE leaddork;');
      console.log('Database created.');
    } else {
      console.log('Database already exists.');
    }
  } catch (err) {
    console.error('Failed to create database', err);
  } finally {
    await adminClient.end();
  }

  const appClient = new Client({
    user: 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'leaddork',
  });
  
  try {
    await appClient.connect();
    console.log('Connected to leaddork db.');
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf-8');
    await appClient.query(schema);
    console.log('Schema applied.');
  } catch (err) {
    console.error('Failed to apply schema', err);
  } finally {
    await appClient.end();
  }
}

setup();
