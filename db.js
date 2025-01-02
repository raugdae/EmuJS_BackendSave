const { Pool} = require ('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database:process.env.DB_NAME,
    password: process.env.DB_PASS,
    port:5432,
    idleTimeoutMillis:30000,

    ssl: {
        rejectUnauthorized: false 
      }
});

// Ajouter plus de logging
pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('acquire', () => {
  console.log('Client acquired from pool');
});

pool.on('error', (err) => {
  console.error('Pool error:', err);
});

module.exports = pool;