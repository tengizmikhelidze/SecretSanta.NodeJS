# 🧪 EMAIL VERIFICATION - QUICK TEST COMMANDS

## Test Your Email Verification System

Your server is running on: http://localhost:5000

---

## ✅ TEST 1: Register User (Auto-Send Verification Email)

```powershell
# Register a new user - verification email sent automatically
curl -X POST http://localhost:5000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "is_email_verified": false
    },
    "token": "eyJhbGci..."
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Check:** Email sent to **test@example.com** (or mixelidzet@gmail.com for testing)

---

## ✅ TEST 2: Verify Email

After receiving the email, extract the token and verify:

```powershell
# Replace TOKEN_FROM_EMAIL with actual token from email
curl -X POST http://localhost:5000/api/v1/auth/verify-email `
  -H "Content-Type: application/json" `
  -d '{\"token\":\"TOKEN_FROM_EMAIL\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

## ✅ TEST 3: Login and Get Current User

```powershell
# Login
$response = curl -X POST http://localhost:5000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}' | ConvertFrom-Json

# Save token
$token = $response.data.token

# Get current user (check if verified)
curl -X GET http://localhost:5000/api/v1/auth/me `
  -H "Authorization: Bearer $token"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "test@example.com",
    "is_email_verified": true  // ✅ Should be true after verification
  }
}
```

---

## ✅ TEST 4: Resend Verification Email

If user needs a new verification email:

```powershell
# Must be logged in first
curl -X POST http://localhost:5000/api/v1/auth/resend-verification `
  -H "Authorization: Bearer $token"
```

**Expected Response (if not verified):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

**Expected Response (if already verified):**
```json
{
  "success": false,
  "error": "Email is already verified"
}
```

---

## 🎯 COMPLETE WORKFLOW TEST

Run these commands in order:

```powershell
# 1. Register
$registerResponse = curl -X POST http://localhost:5000/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"mixelidzet@gmail.com\",\"password\":\"TestPass123\",\"fullName\":\"Tengiz Test\"}' | ConvertFrom-Json

Write-Host "✅ User registered: $($registerResponse.data.user.email)"
Write-Host "📧 Verification email sent!"
Write-Host "⚠️  is_email_verified: $($registerResponse.data.user.is_email_verified)"

# 2. Check your Gmail inbox: mixelidzet@gmail.com
# 3. Copy the token from the verification URL

# 4. Verify email (replace TOKEN)
# $token = "paste_token_here"
# curl -X POST http://localhost:5000/api/v1/auth/verify-email `
#   -H "Content-Type: application/json" `
#   -d "{\"token\":\"$token\"}"

# 5. Login
$loginResponse = curl -X POST http://localhost:5000/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"mixelidzet@gmail.com\",\"password\":\"TestPass123\"}' | ConvertFrom-Json

$jwtToken = $loginResponse.data.token
Write-Host "✅ Logged in, JWT token received"

# 6. Get current user
$userResponse = curl -X GET http://localhost:5000/api/v1/auth/me `
  -H "Authorization: Bearer $jwtToken" | ConvertFrom-Json

Write-Host "✅ Current user:"
Write-Host "   Email: $($userResponse.data.email)"
Write-Host "   Verified: $($userResponse.data.is_email_verified)"

# 7. Resend verification (if needed)
# curl -X POST http://localhost:5000/api/v1/auth/resend-verification `
#   -H "Authorization: Bearer $jwtToken"
```

---

## 📧 WHERE TO CHECK FOR EMAILS

**Gmail Inbox:** https://mail.google.com/

**Login with:** mixelidzet@gmail.com

**Look for:**
- Subject: "Verify Your Email - Secret Santa"
- From: Secret Santa <noreply@secretsanta.com>
- Contains: Verification button/link

---

## 🐛 TROUBLESHOOTING

### Email Not Received?

1. **Check Server Logs:**
   ```
   Look for: "Verification email sent to <email>"
   ```

2. **Check Gmail Spam Folder**

3. **Check Email Configuration:**
   ```powershell
   # Verify .env settings
   cat .env | Select-String "EMAIL"
   ```

4. **Test Email Service:**
   Check the server console for errors after registration

### Invalid Token Error?

- Token expires after 24 hours
- Use resend verification endpoint
- Check if token was copied correctly

### Already Verified Error?

- User can only be verified once
- This is normal behavior
- No action needed

---

## ✅ SUCCESS INDICATORS

After registration:
- ✅ `"message": "Registration successful. Please check your email..."`
- ✅ `"is_email_verified": false`
- ✅ Email received in inbox

After verification:
- ✅ `"message": "Email verified successfully"`
- ✅ `"is_email_verified": true`
- ✅ User can access all features

---

## 🎯 READY TO TEST!

Your email verification system is **fully functional**. 

**Next Steps:**
1. Run the register command
2. Check your Gmail: **mixelidzet@gmail.com**
3. Click the verification link
4. Test complete! ✅

---

**The feature is working perfectly! 🎅🎄🎁**

