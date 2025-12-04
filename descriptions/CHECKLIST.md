# ✅ Setup Checklist

Use this checklist to ensure everything is configured correctly.

## 📦 Installation
- [x] Node.js installed (v14+)
- [x] MySQL installed (v8+)
- [x] Dependencies installed (`npm install`)
- [x] Database schema created (`schema.sql`)

## ⚙️ Configuration

### Environment Variables (.env)
- [x] Server configuration (PORT, NODE_ENV)
- [x] Database credentials configured
- [x] JWT secrets configured (⚠️ CHANGE IN PRODUCTION!)
- [ ] Email service configured (Gmail/SendGrid/Mailtrap)
- [ ] Google OAuth configured (optional)
- [x] Frontend URL set (http://localhost:4200)

### Email Setup (Choose One)
- [ ] **Gmail**: App password generated and added to .env
- [ ] **Mailtrap**: Account created for testing
- [ ] **SendGrid**: API key generated for production

### Google OAuth (Optional)
- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials created
- [ ] Redirect URI configured
- [ ] Client ID and Secret added to .env

## 🧪 Testing

### Basic Tests
- [ ] Server starts without errors (`npm run dev`)
- [ ] Health check works: http://localhost:5000/health
- [ ] API welcome page: http://localhost:5000

### Authentication Flow
- [ ] Register new user (POST /api/v1/auth/register)
- [ ] Receive verification email
- [ ] Login with credentials (POST /api/v1/auth/login)
- [ ] Receive JWT token
- [ ] Access protected route (GET /api/v1/auth/me)

### Party Flow
- [ ] Create party (POST /api/v1/parties)
- [ ] Add participants (POST /api/v1/parties/:id/participants)
- [ ] Email uniqueness validation works
- [ ] Participants receive invitation emails
- [ ] Draw names (POST /api/v1/parties/:id/draw-names)
- [ ] Assignment emails sent

### Wishlist Flow
- [ ] Create wishlist items
- [ ] Update wishlist items
- [ ] Delete wishlist items

### User Account
- [ ] Get account page (GET /api/v1/users/account)
- [ ] See hosted parties
- [ ] See participant parties
- [ ] Change password works

## 🔧 Troubleshooting

### If Server Won't Start
- [ ] MySQL service is running
- [ ] Port 5000 is available
- [ ] .env file exists and is properly formatted
- [ ] All required dependencies installed

### If Emails Don't Send
- [ ] Email credentials are correct
- [ ] Gmail 2FA enabled (if using Gmail)
- [ ] App password generated (if using Gmail)
- [ ] No firewall blocking SMTP port

### If Database Errors
- [ ] MySQL is running
- [ ] Database 'secret_santa' exists
- [ ] All tables created from schema.sql
- [ ] Database credentials match in .env

## 📱 Frontend Integration

### CORS Configuration
- [x] FRONTEND_URL in .env matches your Angular app
- [x] CORS enabled in app.js
- [ ] Test API calls from Angular app

### API Endpoints to Use
```
Base URL: http://localhost:5000/api/v1

Auth:
- POST /auth/register
- POST /auth/login
- GET /auth/me
- POST /auth/change-password

Users:
- GET /users/account
- GET /users/profile
- GET /users/stats

Parties:
- POST /parties
- GET /parties/my-parties
- GET /parties/:id
- PUT /parties/:id
- DELETE /parties/:id
- POST /parties/:id/participants
- POST /parties/:id/draw-names

Wishlists:
- GET /wishlists/participant/:participantId
- POST /wishlists/participant/:participantId
- PUT /wishlists/:id
- DELETE /wishlists/:id
```

## 🚀 Production Readiness

### Before Deploying
- [ ] Change JWT_SECRET to strong random value
- [ ] Change JWT_REFRESH_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Set up production email service (SendGrid/Mailgun)
- [ ] Configure HTTPS
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Set up logging service
- [ ] Configure database backups
- [ ] Set up CI/CD pipeline
- [ ] Add rate limiting (already configured)
- [ ] Security headers (already configured with Helmet)

## 📊 Features Implemented

### ✅ Authentication
- [x] Email/Password registration
- [x] Email/Password login
- [x] Google OAuth login
- [x] JWT authentication
- [x] Email verification
- [x] Password reset
- [x] Change password

### ✅ User Management
- [x] User profile
- [x] Account page (all parties)
- [x] User statistics

### ✅ Party Management
- [x] Create party
- [x] Update party
- [x] Delete party
- [x] Add participants
- [x] Remove participants
- [x] Email uniqueness per party
- [x] Secret Santa assignments
- [x] Access tokens for non-registered users

### ✅ Wishlist Management
- [x] Create wishlist items
- [x] Update wishlist items
- [x] Delete wishlist items
- [x] Priority levels
- [x] Reorder items

### ✅ Email Notifications
- [x] Registration verification
- [x] Password reset
- [x] Party invitations
- [x] Assignment notifications
- [x] Beautiful HTML templates

### ✅ Security
- [x] Password hashing (bcrypt)
- [x] JWT tokens
- [x] Rate limiting
- [x] Input validation (Joi)
- [x] SQL injection protection
- [x] XSS protection
- [x] CORS configuration
- [x] Security headers (Helmet)

### ✅ Best Practices
- [x] Layered architecture
- [x] Reusable code
- [x] Error handling
- [x] Logging (Winston)
- [x] Audit trail
- [x] Database connection pooling
- [x] Environment variables

## 🎯 Next Steps

1. [ ] Configure email service
2. [ ] Start the server
3. [ ] Test all endpoints with Postman
4. [ ] Integrate with Angular frontend
5. [ ] Add any custom business logic
6. [ ] Deploy to production

---

## 📞 Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Check for issues
npm run lint
```

---

**All set! Your Secret Santa backend is ready to rock! 🎅🎄🎁**

