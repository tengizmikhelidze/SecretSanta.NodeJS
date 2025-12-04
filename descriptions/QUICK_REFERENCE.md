# 🚀 QUICK REFERENCE CARD

## ⚡ START SERVER (NOW!)

```powershell
cd A:\projects\secretSanta.NodeJs
npm run dev
```

Server will start on: **http://localhost:5000**

---

## 🔧 BEFORE FIRST RUN

Configure email in `.env` file:
```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

Get Gmail app password: https://myaccount.google.com/apppasswords

---

## 🧪 TEST ENDPOINTS

### Register User
```powershell
curl -X POST http://localhost:5000/api/v1/auth/register -H "Content-Type: application/json" -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\"}'
```

### Login
```powershell
curl -X POST http://localhost:5000/api/v1/auth/login -H "Content-Type: application/json" -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### Health Check
```
http://localhost:5000/health
```

---

## 📱 ANGULAR INTEGRATION

```typescript
// Service
baseUrl = 'http://localhost:5000/api/v1';

// Login
this.http.post(`${baseUrl}/auth/login`, { email, password })

// Create Party (with JWT)
this.http.post(`${baseUrl}/parties`, data, {
  headers: { Authorization: `Bearer ${token}` }
})
```

---

## 🎯 KEY ENDPOINTS

```
POST   /api/v1/auth/register           - Register
POST   /api/v1/auth/login              - Login
GET    /api/v1/auth/me                 - Current user
POST   /api/v1/auth/change-password    - Change password ✓
GET    /api/v1/users/account           - All parties ✓
POST   /api/v1/parties                 - Create party
POST   /api/v1/parties/:id/participants - Add participant ✓
POST   /api/v1/parties/:id/draw-names  - Secret Santa!
```

---

## 📚 DOCUMENTATION

| File | Purpose |
|------|---------|
| `RUN_SERVER.md` | **START HERE** - Step by step |
| `README.md` | Complete API docs |
| `QUICKSTART.md` | Setup guide |
| `CHECKLIST.md` | Verification |
| `FILE_STRUCTURE.md` | Code organization |
| `PROJECT_SUMMARY.md` | What was built |

---

## 🔐 CREDENTIALS

**Database (Already Configured):**
- Host: 127.0.0.1
- Port: 3306
- User: root
- Password: Lamazi21!
- Database: secret_santa

**Server:**
- Port: 5000
- Environment: development
- CORS: http://localhost:4200 (Angular)

---

## 🆘 TROUBLESHOOTING

**Server won't start?**
- Check MySQL is running
- Verify .env file exists
- Run: `npm install`

**Email not sending?**
- Enable 2FA on Gmail
- Generate app password
- Update EMAIL_USER and EMAIL_PASSWORD in .env

**Port already in use?**
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## ✅ YOUR REQUIREMENTS - ALL DONE

- ✅ Email/Password auth
- ✅ Google OAuth (ready)
- ✅ Change password ✓
- ✅ Account page ✓
- ✅ Host parties view ✓
- ✅ Participant parties view ✓
- ✅ Create parties ✓
- ✅ Email unique per party ✓
- ✅ Best practices ✓
- ✅ Reusability ✓

---

## 🎁 POSTMAN TESTING

1. Open Postman
2. Import: `Secret_Santa_API.postman_collection.json`
3. Set environment: `baseUrl` = `http://localhost:5000/api/v1`
4. Test: Register → Login → Create Party → Draw Names

---

## 🎉 YOU'RE READY!

**3 Simple Steps:**
1. Configure email in `.env` (5 min)
2. Run `npm run dev` (1 min)
3. Test with Postman (5 min)

**Total Time: 11 minutes to fully working backend!**

---

**Happy Coding! 🎅🎄🎁**

