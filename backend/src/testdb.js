const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('DB connection failed:', err.message)
  } else {
    console.log('DB connected successfully:', res.rows[0])
  }
  pool.end()
})
