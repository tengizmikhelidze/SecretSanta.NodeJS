# 🚀 Quick Start Guide

## Step-by-Step Setup

### 1. ✅ Install Dependencies
```bash
npm install
```
**Status: COMPLETED** ✓

### 2. 📧 Configure Email (Gmail - FREE)

#### Option A: Using Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication on Gmail**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" and follow the steps

2. **Generate App Password**
   - After enabling 2FA, visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter: "Secret Santa API"
   - Click "Generate"
   - Copy the 16-character password (example: `abcd efgh ijkl mnop`)

3. **Update .env file**
   ```env
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop  # (no spaces)
   EMAIL_FROM=Secret Santa <your_gmail@gmail.com>
   ```

#### Option B: Other Free Email Services

**Mailtrap (Best for Testing - Catches all emails)**
```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
```
Sign up: https://mailtrap.io/

**SendGrid (Production Ready - 100 emails/day free)**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```
Sign up: https://sendgrid.com/

### 3. 🔐 Google OAuth Setup (Optional - for "Login with Google")

**Skip this if you only want email/password authentication**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Secret Santa"
3. Click "APIs & Services" → "Credentials"
4. Click "CREATE CREDENTIALS" → "OAuth client ID"
5. Configure consent screen:
   - App name: "Secret Santa"
   - User support email: your email
   - Developer contact: your email
6. Create OAuth Client:
   - Application type: "Web application"
   - Name: "Secret Santa Web Client"
   - Authorized JavaScript origins: `http://localhost:4200`
   - Authorized redirect URIs: `http://localhost:5000/api/v1/auth/google/callback`
7. Copy the Client ID and Client Secret
8. Update `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

### 4. 🗄️ Database Setup

The database is already configured with your credentials. Just verify MySQL is running:

```bash
# Test MySQL connection
mysql -u root -p
# Enter password: Lamazi21!

# If it works, you're good to go!
```

The schema is already created if you ran `schema.sql`.

### 5. 🎯 Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
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

### 6. ✨ Test the API

**Check if server is running:**
```bash
# Open browser or use curl
curl http://localhost:5000/health
```

**Register a test user:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

You'll receive a JWT token. Save it for authenticated requests.

## 🎮 Testing with Postman

### Import Collection

1. Open Postman
2. Click "Import"
3. Create a new collection: "Secret Santa API"
4. Add environment variables:
   - `baseUrl`: `http://localhost:5000/api/v1`
   - `token`: (will be set after login)

### Test Workflow

1. **Register** → POST `{{baseUrl}}/auth/register`
2. **Login** → POST `{{baseUrl}}/auth/login` → Save token
3. **Get Profile** → GET `{{baseUrl}}/auth/me` (with Bearer token)
4. **Create Party** → POST `{{baseUrl}}/parties` (with Bearer token)
5. **Add Participants** → POST `{{baseUrl}}/parties/:partyId/participants`
6. **Draw Names** → POST `{{baseUrl}}/parties/:partyId/draw-names`

## 🐛 Common Issues

### ❌ Database Connection Error
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution:** Check `.env` file - verify DB_PASSWORD matches your MySQL root password

### ❌ Email Not Sending
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution:** 
- Enable 2FA on Gmail
- Generate App Password (not your regular Gmail password)
- Remove spaces from the 16-character password

### ❌ Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** 
- Change PORT in `.env` to 5001 or another port
- Or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### ❌ Google OAuth Not Working
```
Error: redirect_uri_mismatch
```
**Solution:** Make sure the redirect URI in Google Cloud Console EXACTLY matches:
```
http://localhost:5000/api/v1/auth/google/callback
```

## 📊 What's Working

✅ Database schema created
✅ All dependencies installed
✅ Layered architecture (Routes → Controllers → Services → Repositories)
✅ JWT Authentication
✅ Email/Password registration and login
✅ Google OAuth integration (when configured)
✅ Party management
✅ Participant management with email uniqueness validation
✅ Secret Santa assignment algorithm
✅ Wishlist management
✅ Email notifications
✅ Password reset functionality
✅ Change password feature
✅ Account page with all parties (host + participant)
✅ Audit logging
✅ Error handling
✅ Input validation
✅ Rate limiting
✅ Security headers (Helmet, CORS)

## 🎯 Next Steps

1. **Start the server** (after configuring email)
2. **Test with Postman** or your Angular frontend
3. **Configure Google OAuth** (optional)
4. **Customize email templates** in `src/services/email.service.js`
5. **Deploy to production** (see README.md deployment section)

## 📞 Need Help?

Check the full documentation in `README.md` for:
- Complete API documentation
- Architecture details
- Security best practices
- Deployment guide

---

**You're ready to go! 🎅🎄🎁**

