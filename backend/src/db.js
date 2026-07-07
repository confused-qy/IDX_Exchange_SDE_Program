// Import the mysql2/promise module to create a connection pool
const mysql = require("mysql2/promise");

// Create a connection pool using environment variables for configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the pool for use in other parts of the application
module.exports = pool;
