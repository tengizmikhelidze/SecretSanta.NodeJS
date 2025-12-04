# 🎅 Secret Santa Backend API

A comprehensive Node.js REST API for managing Secret Santa gift exchanges with user authentication, party management, participant coordination, and wishlist features.

## 🌟 Features

- **User Authentication**
  - Email/Password registration and login
  - Google OAuth 2.0 integration
  - JWT-based authentication
  - Email verification
  - Password reset functionality
  - Change password (for authenticated users)

- **Party Management**
  - Create and manage Secret Santa parties
  - Add/remove participants
  - Set party details (date, location, budget)
  - Unique email validation per party
  - Access token-based party access

- **Secret Santa Assignment**
  - Automated random assignment algorithm
  - Email notifications for assignments
  - View assigned person's wishlist
  - Host can optionally see all assignments

- **Wishlist Management**
  - Create, update, delete wishlist items
  - Set item priorities (high, medium, low)
  - Add item descriptions and URLs
  - Price range suggestions
  - Reorder wishlist items

- **Account Management**
  - View all hosted parties
  - View all participated parties
  - User statistics dashboard
  - Profile management

- **Security Features**
  - Helmet.js for security headers
  - CORS configuration
  - Rate limiting
  - Input validation with Joi
  - SQL injection protection
  - XSS protection

- **Additional Features**
  - Audit logging
  - Email notifications
  - Error handling
  - Winston logging
  - Database connection pooling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## 🚀 Installation

### 1. Clone the repository

\`\`\`bash
git clone <repository-url>
cd secretSanta.NodeJs
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Database Setup

Run the schema.sql file to create the database:

\`\`\`bash
mysql -u root -p < schema.sql
\`\`\`

Or manually import it:
1. Open MySQL Workbench or command line
2. Execute the contents of `schema.sql`

### 4. Environment Configuration

Copy `.env.example` to `.env` and configure the following:

\`\`\`bash
cp .env.example .env
\`\`\`

Update the `.env` file with your credentials:

#### Database Configuration
Already configured with your credentials:
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_USER=root
- DB_PASSWORD=Lamazi21!
- DB_NAME=secret_santa

#### JWT Configuration
The JWT secrets are pre-configured, but **CHANGE THEM IN PRODUCTION**:
- Generate new secrets using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

#### Email Configuration (Gmail)

**To use Gmail for sending emails:**

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left menu
3. Enable "2-Step Verification" if not already enabled
4. After enabling 2FA, go back to Security settings
5. Search for "App passwords" or go to: https://myaccount.google.com/apppasswords
6. Select app: "Mail"
7. Select device: "Other" (Custom name) - enter "Secret Santa API"
8. Click "Generate"
9. Copy the 16-character password (without spaces)
10. Update your `.env` file:

\`\`\`env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
EMAIL_FROM=Secret Santa <your_gmail_address@gmail.com>
\`\`\`

**Alternative Email Services:**
- **SendGrid**: More reliable for production (free tier: 100 emails/day)
- **Mailgun**: Another good option (free tier: 5000 emails/month)
- **AWS SES**: Best for high volume (pay as you go)

#### Google OAuth Configuration (Optional)

**To enable Google OAuth login:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: External
   - Add app name: "Secret Santa"
   - Add authorized domains: localhost
6. Create OAuth Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:4200`
   - Authorized redirect URIs: `http://localhost:5000/api/v1/auth/google/callback`
7. Copy Client ID and Client Secret
8. Update `.env`:

\`\`\`env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
\`\`\`

### 5. Start the Server

**Development mode (with auto-restart):**
\`\`\`bash
npm run dev
\`\`\`

**Production mode:**
\`\`\`bash
npm start
\`\`\`

The server will start on http://localhost:5000

## 📚 API Documentation

### Base URL
\`\`\`
http://localhost:5000/api/v1
\`\`\`

### Authentication Endpoints

#### Register
\`\`\`http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
\`\`\`

#### Login
\`\`\`http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

#### Google OAuth
\`\`\`http
GET /api/v1/auth/google
\`\`\`

#### Verify Email
\`\`\`http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
\`\`\`

#### Forgot Password
\`\`\`http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
\`\`\`

#### Reset Password
\`\`\`http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
\`\`\`

#### Change Password (Authenticated)
\`\`\`http
POST /api/v1/auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
\`\`\`

#### Get Current User
\`\`\`http
GET /api/v1/auth/me
Authorization: Bearer <jwt_token>
\`\`\`

### User Endpoints

#### Get Profile
\`\`\`http
GET /api/v1/users/profile
Authorization: Bearer <jwt_token>
\`\`\`

#### Update Profile
\`\`\`http
PUT /api/v1/users/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "avatarUrl": "https://example.com/avatar.jpg"
}
\`\`\`

#### Get Account Page (All Parties)
\`\`\`http
GET /api/v1/users/account
Authorization: Bearer <jwt_token>
\`\`\`

#### Get User Statistics
\`\`\`http
GET /api/v1/users/stats
Authorization: Bearer <jwt_token>
\`\`\`

### Party Endpoints

#### Create Party
\`\`\`http
POST /api/v1/parties
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "hostEmail": "host@example.com",
  "partyDate": "2025-12-25T18:00:00Z",
  "location": "My House",
  "maxAmount": 50.00,
  "personalMessage": "Ho ho ho! Let's have fun!",
  "hostCanSeeAll": false,
  "participants": [
    {
      "name": "Alice",
      "email": "alice@example.com"
    },
    {
      "name": "Bob",
      "email": "bob@example.com"
    }
  ]
}
\`\`\`

#### Get Party Details
\`\`\`http
GET /api/v1/parties/:partyId
Authorization: Bearer <jwt_token>
\`\`\`

#### Get Party by Access Token
\`\`\`http
GET /api/v1/parties/by-token?token=<access_token>
Authorization: Bearer <jwt_token>
\`\`\`

#### Update Party
\`\`\`http
PUT /api/v1/parties/:partyId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "partyDate": "2025-12-26T18:00:00Z",
  "location": "New Location",
  "maxAmount": 75.00
}
\`\`\`

#### Delete Party
\`\`\`http
DELETE /api/v1/parties/:partyId
Authorization: Bearer <jwt_token>
\`\`\`

#### Get My Parties
\`\`\`http
GET /api/v1/parties/my-parties
Authorization: Bearer <jwt_token>
\`\`\`

#### Add Participant
\`\`\`http
POST /api/v1/parties/:partyId/participants
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Charlie",
  "email": "charlie@example.com"
}
\`\`\`

#### Remove Participant
\`\`\`http
DELETE /api/v1/parties/:partyId/participants/:participantId
Authorization: Bearer <jwt_token>
\`\`\`

#### Draw Names (Create Assignments)
\`\`\`http
POST /api/v1/parties/:partyId/draw-names
Authorization: Bearer <jwt_token>
\`\`\`

### Wishlist Endpoints

#### Get Participant's Wishlist
\`\`\`http
GET /api/v1/wishlists/participant/:participantId
Authorization: Bearer <jwt_token>
\`\`\`

#### Add Wishlist Item
\`\`\`http
POST /api/v1/wishlists/participant/:participantId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "itemName": "Wireless Headphones",
  "itemDescription": "Noise-cancelling, over-ear",
  "itemUrl": "https://example.com/product",
  "priceRange": "$100-$150",
  "priority": "high"
}
\`\`\`

#### Update Wishlist Item
\`\`\`http
PUT /api/v1/wishlists/:itemId
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "itemName": "Updated Item Name",
  "priority": "medium"
}
\`\`\`

#### Delete Wishlist Item
\`\`\`http
DELETE /api/v1/wishlists/:itemId
Authorization: Bearer <jwt_token>
\`\`\`

#### Reorder Wishlist Items
\`\`\`http
POST /api/v1/wishlists/participant/:participantId/reorder
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "itemOrders": [
    { "id": 1, "sortOrder": 0 },
    { "id": 2, "sortOrder": 1 },
    { "id": 3, "sortOrder": 2 }
  ]
}
\`\`\`

## 🗂️ Project Structure

\`\`\`
secretSanta.NodeJs/
├── src/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool
│   │   └── passport.js          # Passport strategies (JWT, Google OAuth)
│   ├── controllers/
│   │   ├── auth.controller.js   # Authentication logic
│   │   ├── user.controller.js   # User management
│   │   ├── party.controller.js  # Party management
│   │   └── wishlist.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT authentication
│   │   ├── error.middleware.js  # Error handling
│   │   └── validation.middleware.js # Joi validation
│   ├── repositories/
│   │   ├── user.repository.js   # User database operations
│   │   ├── party.repository.js
│   │   ├── participant.repository.js
│   │   ├── wishlist.repository.js
│   │   └── assignment.repository.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── party.routes.js
│   │   └── wishlist.routes.js
│   ├── services/
│   │   ├── auth.service.js      # Business logic for auth
│   │   ├── user.service.js
│   │   ├── party.service.js
│   │   ├── wishlist.service.js
│   │   ├── email.service.js     # Email sending
│   │   └── audit.service.js     # Audit logging
│   ├── utils/
│   │   ├── errors.js            # Custom error classes
│   │   ├── helpers.js           # Helper functions
│   │   └── logger.js            # Winston logger
│   ├── validators/
│   │   ├── auth.validator.js    # Joi schemas for auth
│   │   ├── party.validator.js
│   │   ├── participant.validator.js
│   │   └── wishlist.validator.js
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
├── logs/                        # Log files (created automatically)
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── package.json
├── schema.sql                   # Database schema
└── README.md
\`\`\`

## 🏗️ Architecture

This project follows a **layered architecture** pattern:

1. **Routes Layer**: Handle HTTP requests and route to controllers
2. **Controllers Layer**: Handle request/response, call services
3. **Services Layer**: Business logic and orchestration
4. **Repository Layer**: Database operations and queries
5. **Middleware Layer**: Authentication, validation, error handling

**Benefits:**
- Clear separation of concerns
- Easy to test each layer independently
- Reusable components
- Maintainable and scalable code

## 🔒 Security Best Practices

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens for stateless authentication
- Rate limiting to prevent brute force attacks
- Helmet.js for security headers
- Input validation with Joi
- SQL injection protection with parameterized queries
- XSS protection
- CORS configuration

## 📧 Email Templates

The API includes beautiful HTML email templates for:
- Email verification
- Password reset
- Party invitations
- Secret Santa assignments
- Party updates

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
\`\`\`

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure `secret_santa` database exists

### Email Not Sending
- Check Gmail app password is correct
- Verify 2FA is enabled on Gmail account
- Check firewall isn't blocking SMTP port 587

### Google OAuth Not Working
- Verify Client ID and Secret are correct
- Check redirect URI matches exactly
- Ensure Google+ API is enabled

## 📝 Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Server port | 5000 |
| DB_HOST | MySQL host | 127.0.0.1 |
| DB_PORT | MySQL port | 3306 |
| DB_USER | MySQL username | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | secret_santa |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| GOOGLE_CLIENT_ID | Google OAuth Client ID | - |
| GOOGLE_CLIENT_SECRET | Google OAuth Client Secret | - |
| EMAIL_HOST | SMTP host | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USER | SMTP username | - |
| EMAIL_PASSWORD | SMTP password (app password) | - |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:4200 |

## 🚀 Deployment

### Production Checklist
- [ ] Change JWT secrets to strong random values
- [ ] Use production database credentials
- [ ] Set NODE_ENV=production
- [ ] Configure production email service (SendGrid/Mailgun)
- [ ] Set up proper logging
- [ ] Configure HTTPS
- [ ] Set up database backups
- [ ] Configure monitoring (PM2, New Relic, etc.)

## 📄 License

ISC

## 👨‍💻 Author

Secret Santa API - Built with Node.js, Express, and MySQL

---

**Happy Secret Santa! 🎅🎄🎁**

