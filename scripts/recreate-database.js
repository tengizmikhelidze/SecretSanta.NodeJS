// Database Recreation Script
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function recreateDatabase() {
  console.log('🗄️  Starting database recreation...\n');

  // Connect without database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    // Drop existing database
    console.log('⚠️  Dropping existing database...');
    await connection.query('DROP DATABASE IF EXISTS secret_santa');
    console.log('✓ Old database dropped\n');

    // Read schema file
    console.log('📄 Reading schema file...');
    const schemaFile = fs.readFileSync(
      path.join(__dirname, '../schema.sql'),
      'utf8'
    );
    console.log('✓ Schema file loaded\n');

    // Execute schema
    console.log('📦 Creating database and tables...');
    await connection.query(schemaFile);
    console.log('✓ Database and tables created\n');

    // Verify tables
    console.log('✅ Verifying tables...');
    await connection.query('USE secret_santa');
    const [tables] = await connection.query('SHOW TABLES');

    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ DATABASE RECREATION SUCCESSFUL!');
    console.log('═══════════════════════════════════════════════\n');

    console.log(`📊 Created ${tables.length} tables:\n`);

    const newTables = ['participant_exclusions', 'previous_assignments', 'assignment_metadata'];

    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      const isNew = newTables.includes(tableName);
      console.log(`  ${isNew ? '✨' : '  '} ${tableName}${isNew ? ' (NEW - Assignment System)' : ''}`);
    });

    console.log('\n═══════════════════════════════════════════════');
    console.log('🎉 Your Secret Santa database is ready!');
    console.log('═══════════════════════════════════════════════\n');

    console.log('Next steps:');
    console.log('  1. Restart your server (if needed): npm run dev');
    console.log('  2. Test the new assignment endpoints');
    console.log('  3. Check ASSIGNMENT_API_DOCUMENTATION.md\n');

  } catch (error) {
    console.error('\n❌ Database recreation failed:', error.message);
    console.error('\nPlease check:');
    console.error('  - MySQL is running');
    console.error('  - Credentials in .env are correct');
    console.error('  - schema.sql file exists\n');
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the script
recreateDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

