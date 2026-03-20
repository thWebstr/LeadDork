import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Use DATABASE_URL if it exists (Render) otherwise fall back to local variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://leaddork_db_user:1I9MKnWkKbJDT2KKMtTKBQD0PJUm09FU@dpg-d6ua84ua2pns7398teog-a/leaddork_db',
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'leaddork',
  password: process.env.DB_PASSWORD || 'leaddork_password',
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;