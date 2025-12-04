# 🗄️ DATABASE RECREATION GUIDE

## Quick Steps to Recreate Database

### Option 1: MySQL Workbench (Recommended)

1. **Open MySQL Workbench**
2. **Connect to localhost**
   - Username: `root`
   - Password: `Lamazi21!`

3. **Delete Old Database**
   ```sql
   DROP DATABASE IF EXISTS secret_santa;
   ```

4. **Run Schema File**
   - File → Run SQL Script
   - Navigate to: `A:\projects\secretSanta.NodeJs\schema.sql`
   - Click **Run**
   - Wait for completion

5. **Verify Tables**
   ```sql
   USE secret_santa;
   SHOW TABLES;
   ```
   
   **Should see 11 tables:**
   - users
   - parties
   - participants
   - assignments ✨
   - participant_exclusions ✨ (NEW)
   - previous_assignments ✨ (NEW)
   - assignment_metadata ✨ (NEW)
   - notifications
   - party_settings
   - wishlists
   - audit_logs

6. **Done!** Your database is ready.

---

### Option 2: PowerShell Script

Save this as `recreate-db.ps1`:

```powershell
# Recreate Secret Santa Database

Write-Host "🗄️ Recreating Secret Santa Database..." -ForegroundColor Cyan

# Configuration
$mysqlPath = "mysql"  # Adjust if MySQL not in PATH
$dbUser = "root"
$dbPassword = "Lamazi21!"
$schemaFile = "A:\projects\secretSanta.NodeJs\schema.sql"

# Drop database
Write-Host "⚠️  Dropping existing database..." -ForegroundColor Yellow
$dropCmd = "DROP DATABASE IF EXISTS secret_santa;"
echo $dropCmd | & $mysqlPath -u $dbUser -p"$dbPassword"

# Create database
Write-Host "📦 Creating new database from schema..." -ForegroundColor Green
Get-Content $schemaFile | & $mysqlPath -u $dbUser -p"$dbPassword"

# Verify
Write-Host "✅ Verifying tables..." -ForegroundColor Green
$verifyCmd = "USE secret_santa; SHOW TABLES;"
echo $verifyCmd | & $mysqlPath -u $dbUser -p"$dbPassword"

Write-Host "🎉 Database recreation complete!" -ForegroundColor Green
```

Run with:
```powershell
.\recreate-db.ps1
```

---

### Option 3: Node.js Script (No MySQL CLI needed)

I'll create this for you:

```javascript
// scripts/recreate-database.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function recreateDatabase() {
  console.log('🗄️ Starting database recreation...');

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
    
    // Read schema file
    console.log('📄 Reading schema file...');
    const schemaFile = fs.readFileSync(
      path.join(__dirname, '../schema.sql'),
      'utf8'
    );

    // Execute schema
    console.log('📦 Creating database and tables...');
    await connection.query(schemaFile);

    // Verify tables
    console.log('✅ Verifying tables...');
    await connection.query('USE secret_santa');
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('\n✅ Database created successfully!');
    console.log(`\n📊 Created ${tables.length} tables:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      const isNew = ['participant_exclusions', 'previous_assignments', 'assignment_metadata'].includes(tableName);
      console.log(`  ${isNew ? '✨' : '  '} ${tableName} ${isNew ? '(NEW)' : ''}`);
    });

    console.log('\n🎉 Database is ready for use!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

recreateDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
```

Run with:
```bash
node scripts/recreate-database.js
```

---

## ✅ After Database Recreation

### 1. Restart Server
Your nodemon server should automatically restart, or:
```bash
# Stop with Ctrl+C, then:
npm run dev
```

### 2. Verify Server Started
Check console for:
```
✓ Database connected successfully
🎅 Secret Santa API Server Started! 🎄
```

### 3. Test New Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Register user (if needed)
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'
```

---

## 🎯 What Changed in Database

### New Tables (3)
1. **participant_exclusions** - Custom exclusion rules
2. **previous_assignments** - Historical tracking
3. **assignment_metadata** - Generation metadata

### Modified Tables (2)
1. **assignments** - Added 2 composite indexes
2. **participants** - Added 1 composite index

### Total Tables: 11
- Original: 8 tables
- New: 3 tables
- **All working together** ✅

---

## 🚨 Important Notes

### ⚠️ Data Loss Warning
Dropping the database will delete:
- All users
- All parties
- All participants
- All assignments
- All wishlists
- Everything!

**Make sure you're okay with this!**

### 💾 Backup First (Optional)
```sql
-- Backup before dropping
mysqldump -u root -p secret_santa > backup_before_assignment_tables.sql

-- Restore if needed
mysql -u root -p secret_santa < backup_before_assignment_tables.sql
```

---

## ✅ Verification Checklist

After recreation:

- [ ] Database `secret_santa` exists
- [ ] 11 tables created
- [ ] 3 new tables present:
  - [ ] participant_exclusions
  - [ ] previous_assignments
  - [ ] assignment_metadata
- [ ] Server connects successfully
- [ ] No errors in server console
- [ ] New routes registered:
  - [ ] POST /api/v1/parties/:id/assignments/generate
  - [ ] GET /api/v1/parties/:id/assignments
  - [ ] DELETE /api/v1/parties/:id/assignments
  - [ ] POST /api/v1/parties/:id/assignments/regenerate
  - [ ] POST /api/v1/parties/:id/assignments/lock
  - [ ] POST /api/v1/parties/:id/assignments/unlock
  - [ ] GET /api/v1/parties/:id/assignments/stats

---

## 🎉 Ready!

Once database is recreated, your Secret Santa assignment system is fully operational!

**Test it:**
1. Create party with participants
2. Generate assignments
3. View assignments
4. Celebrate! 🎅🎄🎁

