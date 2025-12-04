# 🎯 EXACT STEPS TO RUN YOUR SERVER

## ✅ What's Already Done
- [x] All code files created (45+ files)
- [x] Dependencies installed (npm install completed)
- [x] Database configured (.env has your MySQL credentials)
- [x] Project structure complete

## 📧 STEP 1: Configure Email (Choose One Option)

### Option A: Gmail (Recommended - 5 minutes)

1. **Open Gmail Settings:**
   - Go to: https://myaccount.google.com/security
   - Scroll down and enable "2-Step Verification"
   - Follow the prompts to set it up

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" for the app
   - Select "Other" for device and type "Secret Santa"
   - Click "Generate"
   - Copy the 16-character password (example: `abcd efgh ijkl mnop`)

3. **Update Your .env File:**
   - Open: `A:\projects\secretSanta.NodeJs\.env`
   - Find these lines:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=Secret Santa <your_email@gmail.com>
   ```
   - Replace with YOUR email and the app password (remove spaces):
   ```env
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   EMAIL_FROM=Secret Santa <youremail@gmail.com>
   ```
   - Save the file

### Option B: Mailtrap (For Testing - Catches All Emails)

1. Sign up at: https://mailtrap.io/
2. Go to "Email Testing" → "Inboxes" → "My Inbox"
3. Copy SMTP credentials
4. Update `.env`:
   ```env
   EMAIL_HOST=sandbox.smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your_mailtrap_username
   EMAIL_PASSWORD=your_mailtrap_password
   EMAIL_FROM=Secret Santa <test@example.com>
   ```

### Option C: Skip Email (For Now)
If you want to test without email, you can start the server but emails won't be sent.

---

## 🚀 STEP 2: Start the Server

### Open PowerShell in Project Directory
```powershell
cd A:\projects\secretSanta.NodeJs
```

### Start Development Server
```powershell
npm run dev
```

### You Should See:
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     🎅 Secret Santa API Server Started! 🎄          ║
║                                                       ║
║     Environment: development                         ║
║     Port: 5000                                        ║
║     API Version: v1                                   ║
║                                                       ║
║     Server: http://localhost:5000                    ║
║     Health: http://localhost:5000/health             ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

✅ **If you see this, YOUR SERVER IS RUNNING!**

---

## 🧪 STEP 3: Test the API

### Test 1: Health Check (In Browser)
Open your browser and go to:
```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "OK",
  "timestamp": "2025-12-04T...",
  "environment": "development"
}
```

### Test 2: Register a User (PowerShell)
Open a NEW PowerShell window and run:
```powershell
curl -X POST http://localhost:5000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\"}'
```

You should get:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful..."
}
```

### Test 3: Login (PowerShell)
```powershell
curl -X POST http://localhost:5000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

Save the token from the response!

### Test 4: Create a Party (Replace YOUR_TOKEN_HERE)
```powershell
$token = "YOUR_TOKEN_HERE"
curl -X POST http://localhost:5000/api/v1/parties `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{\"hostEmail\":\"test@example.com\",\"partyDate\":\"2025-12-25T18:00:00Z\",\"location\":\"My House\",\"maxAmount\":50,\"personalMessage\":\"Ho ho ho!\",\"participants\":[{\"name\":\"Alice\",\"email\":\"alice@example.com\"},{\"name\":\"Bob\",\"email\":\"bob@example.com\"},{\"name\":\"Charlie\",\"email\":\"charlie@example.com\"}]}'
```

---

## 📮 STEP 4: Test with Postman (Recommended)

### Import Collection
1. Open Postman
2. Click "Import"
3. Select file: `A:\projects\secretSanta.NodeJs\Secret_Santa_API.postman_collection.json`
4. Create environment variable:
   - Variable: `baseUrl`
   - Value: `http://localhost:5000/api/v1`

### Test Workflow
1. **Auth → Register** - Create new user
2. **Auth → Login** - Get JWT token (auto-saved to environment)
3. **Users → Get Account Page** - See your parties
4. **Parties → Create Party** - Create a Secret Santa party
5. **Parties → Add Participant** - Add more people
6. **Parties → Draw Names** - Create assignments (sends emails!)

---

## 🔧 Common Issues & Solutions

### ❌ Error: "Port 5000 already in use"
**Solution:**
```powershell
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```
Or change port in `.env`:
```env
PORT=5001
```

### ❌ Error: "Database connection failed"
**Solution:**
1. Make sure MySQL is running:
   ```powershell
   # Check if MySQL service is running
   Get-Service -Name "MySQL*"
   ```
2. Verify password in `.env` matches: `Lamazi21!`
3. Check database exists:
   ```sql
   mysql -u root -p
   SHOW DATABASES;
   -- You should see 'secret_santa'
   ```

### ❌ Error: "Email not sending"
**Solution:**
1. If using Gmail:
   - Verify 2FA is enabled
   - Verify app password is correct (16 characters, no spaces)
   - Check EMAIL_USER and EMAIL_PASSWORD in `.env`
2. Check server logs for specific error
3. Try Mailtrap instead (no 2FA needed)

### ❌ Error: "Module not found"
**Solution:**
```powershell
# Reinstall dependencies
npm install
```

### ❌ Can't run PowerShell scripts
**Solution:**
```powershell
# Enable script execution (one time)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## 📱 STEP 5: Connect Angular Frontend

In your Angular service, use these base URLs:

```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:5000/api/v1'
};

// auth.service.ts
login(email: string, password: string) {
  return this.http.post(`${environment.apiUrl}/auth/login`, { email, password });
}

// party.service.ts
createParty(data: any) {
  return this.http.post(`${environment.apiUrl}/parties`, data, {
    headers: { Authorization: `Bearer ${this.getToken()}` }
  });
}
```

---

## 🎯 Complete Test Scenario

### Scenario: Create a Secret Santa Party

1. **Register** (POST /api/v1/auth/register)
2. **Login** (POST /api/v1/auth/login) → Get token
3. **Create Party** (POST /api/v1/parties) with 3+ participants
4. **View Party** (GET /api/v1/parties/:id)
5. **Add Wishlist** (POST /api/v1/wishlists/participant/:id)
6. **Draw Names** (POST /api/v1/parties/:id/draw-names)
7. **Check Emails** - Everyone gets their assignment!
8. **View Account** (GET /api/v1/users/account) - See all parties

---

## 📊 Server Status Commands

### Start Server
```powershell
npm run dev
```

### Stop Server
Press `Ctrl + C` in the PowerShell window

### Check if Server is Running
```powershell
curl http://localhost:5000/health
```

### View Logs
Logs are saved in: `A:\projects\secretSanta.NodeJs\logs\`
- `combined.log` - All logs
- `error.log` - Only errors

---

## 🎓 What You Can Do Now

✅ **Full Authentication System**
- Register with email/password
- Login and get JWT token
- Change password
- Reset password via email
- Verify email

✅ **Party Management**
- Create parties
- Add participants (email uniqueness validated!)
- Update party details
- Delete parties
- Draw Secret Santa names

✅ **Account Features**
- View all hosted parties
- View all participated parties
- User statistics
- Profile management

✅ **Wishlist Features**
- Add items with priorities
- Update items
- Delete items
- View assigned person's wishlist

---

## 🎉 YOU'RE READY!

Your Secret Santa backend is **fully functional** and ready for your Angular frontend!

**Next Steps:**
1. ✅ Configure email (Step 1)
2. ✅ Start server: `npm run dev` (Step 2)
3. ✅ Test with Postman (Step 4)
4. ✅ Connect Angular app (Step 5)

**Need Help?**
- Setup issues? Check: `QUICKSTART.md`
- API docs? Check: `README.md`
- File structure? Check: `FILE_STRUCTURE.md`

---

**Happy Secret Santa! 🎅🎄🎁**

Your backend is waiting to spread holiday cheer! 🎊

