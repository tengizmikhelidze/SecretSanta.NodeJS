require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const logger = require('./utils/logger');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Start listening
    app.listen(PORT, () => {
      logger.info(`
        ╔═══════════════════════════════════════════════════════╗
        ║                                                       ║
        ║     🎅 Secret Santa API Server Started! 🎄          ║
        ║                                                       ║
        ║     Environment: ${process.env.NODE_ENV?.padEnd(37) || 'development'.padEnd(37)}║
        ║     Port: ${PORT.toString().padEnd(44)}║
        ║     API Version: ${(process.env.API_VERSION || 'v1').padEnd(38)}║
        ║                                                       ║
        ║     Server: http://localhost:${PORT.toString().padEnd(26)}║
        ║     Health: http://localhost:${PORT}/health${' '.repeat(18)}║
        ║                                                       ║
        ╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();

