const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('✓ Database connected successfully');
    connection.release();
  } catch (error) {
    logger.error('✗ Database connection failed:', error.message);
    throw error;
  }
};

// Execute query with error handling
const query = async (sql, params, connection = null) => {
  try {
    const executor = connection || pool;
    const [rows] = await executor.execute(sql, params);
    return rows;
  } catch (error) {
    logger.error('Database query error:', { sql, error: error.message });
    throw error;
  }
};

// Get connection from pool
const getConnection = async () => {
  return await pool.getConnection();
};

// Transaction helper
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  query,
  getConnection,
  transaction,
  testConnection
};

