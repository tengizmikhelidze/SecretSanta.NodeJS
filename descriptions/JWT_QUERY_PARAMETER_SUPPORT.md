# JWT Query Parameter Support Implementation

## Overview
The backend API now supports JWT token authentication via query parameters in addition to the standard Authorization header.

## Implementation Details

### What Changed
**File Modified**: `src/config/passport.js`

The JWT strategy was extended to extract tokens from **two sources** instead of just one:
1. **Authorization Header** (Standard): `Authorization: Bearer <jwt_token>`
2. **Query Parameter** (New): `?token=<jwt_token>`

### Code Change
```javascript
// OLD (Single extraction method)
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

// NEW (Multiple extraction methods)
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),           // Standard: Authorization: Bearer <token>
    ExtractJwt.fromUrlQueryParameter('token')          // Alternative: ?token=<token>
  ]),
  secretOrKey: process.env.JWT_SECRET
};
```

## Usage Examples

### Method 1: Authorization Header (Recommended - Standard)
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/v1/parties/66fa4136-a97c-46a8-87fc-d9b71f50810c/assignments
```

### Method 2: Query Parameter (New - For Sharing/Embedding)
```bash
curl http://localhost:3000/api/v1/parties/66fa4136-a97c-46a8-87fc-d9b71f50810c/assignments?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Affected Endpoints

All endpoints that use the `protect` middleware now accept JWT tokens via query parameters:

### Assignment Endpoints
- `GET /api/v1/parties/:partyId/assignments?token=<jwt>`
- `POST /api/v1/parties/:partyId/assignments/generate?token=<jwt>`
- `DELETE /api/v1/parties/:partyId/assignments?token=<jwt>`
- `POST /api/v1/parties/:partyId/assignments/regenerate?token=<jwt>`
- `POST /api/v1/parties/:partyId/assignments/lock?token=<jwt>`
- `POST /api/v1/parties/:partyId/assignments/unlock?token=<jwt>`
- `GET /api/v1/parties/:partyId/assignments/stats?token=<jwt>`

### Party Endpoints
- `POST /api/v1/parties?token=<jwt>`
- `GET /api/v1/parties/:id?token=<jwt>`
- `PUT /api/v1/parties/:id?token=<jwt>`
- `DELETE /api/v1/parties/:id?token=<jwt>`
- And more...

### User Endpoints
- `GET /api/v1/users/me?token=<jwt>`
- `PUT /api/v1/users/me?token=<jwt>`
- And more...

### Wishlist Endpoints
- `POST /api/v1/wishlists?token=<jwt>`
- `GET /api/v1/wishlists/:id?token=<jwt>`
- And more...

## Use Cases

### 1. Sharing Assignment Links
Generate a shareable link that includes the JWT token as a query parameter:
```
https://example.com/assignment-view?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Embedded Content
Embed API calls in web pages or mobile apps without header manipulation:
```javascript
// Frontend can now do:
fetch(`/api/v1/parties/${partyId}/assignments?token=${jwtToken}`)
  .then(res => res.json())
  .then(data => console.log(data));
```

### 3. API Testing & Debugging
Easier to test endpoints in browser or tools that don't easily support custom headers.

## Security Considerations

### ⚠️ Important Notes

1. **Token Exposure**: Query parameters are visible in:
   - Browser history
   - Server logs
   - Referrer headers
   - Browser console
   
2. **Best Practices**:
   - Use Authorization header for sensitive operations (default method)
   - Use query parameters only when necessary (sharing, embedding)
   - Short-lived tokens recommended for query parameter sharing
   - Consider HTTPS-only (already enforced in production)

3. **Recommended Token Lifetime**:
   - Standard API calls: 24 hours (current default)
   - Query parameter sharing: 1-2 hours (consider shortening)

### Security Mitigation

To further secure query parameter tokens, you could:

1. **Create Temporary Tokens**
```javascript
// Create short-lived access tokens specifically for sharing
const tempToken = jwt.sign({ id: user.id, type: 'share' }, secret, { expiresIn: '1h' });
```

2. **Log Query Parameter Usage** (Optional)
Add logging in middleware to track query parameter token usage.

3. **Rate Limiting** (Already Implemented)
Existing rate limiting applies to all requests, including those with query parameter tokens.

## Token Extraction Order

Passport.js tries extractors in order and uses the **first one that finds a token**:

1. First attempts: `Authorization: Bearer <token>`
2. If not found, attempts: `?token=<token>`
3. If neither found: Request fails with 401 Unauthorized

## Testing the Implementation

### Test 1: Authorization Header (Should Work)
```bash
# Get a valid JWT token first
TOKEN="your_jwt_token_here"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/parties/66fa4136-a97c-46a8-87fc-d9b71f50810c/assignments
```

### Test 2: Query Parameter (Should Work)
```bash
TOKEN="your_jwt_token_here"

curl "http://localhost:3000/api/v1/parties/66fa4136-a97c-46a8-87fc-d9b71f50810c/assignments?token=$TOKEN"
```

### Test 3: No Token (Should Fail)
```bash
curl http://localhost:3000/api/v1/parties/66fa4136-a97c-46a8-87fc-d9b71f50810c/assignments
# Expected: 401 Unauthorized
```

## Integration with Frontend

### Angular Example
```typescript
// Old way (manual header)
getAssignments(partyId: string, token: string) {
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.get(`/api/v1/parties/${partyId}/assignments`, { headers });
}

// New way (via query parameter)
getAssignments(partyId: string, token: string) {
  return this.http.get(
    `/api/v1/parties/${partyId}/assignments?token=${token}`
  );
}
```

## Backward Compatibility

✅ **Fully Backward Compatible**: Existing code using Authorization headers will continue to work without any changes.

## Environment Variables

No new environment variables required. The JWT secret remains the same:
- `JWT_SECRET`: Used for signing and verifying tokens

## Troubleshooting

### Issue: Token not recognized via query parameter
- **Check**: Ensure `?token=` (lowercase) is used in the URL
- **Check**: Verify token is valid and not expired
- **Check**: Token should be a valid JWT (not a party access token)

### Issue: Authorization header takes precedence
- This is expected behavior. If both methods provide a token, the header takes precedence
- This is intentional for security (headers are more secure than query params)

## Future Enhancements

1. **Optional Feature Toggle**: Add environment variable to disable query parameter extraction if needed
   ```javascript
   jwtFromRequest: process.env.JWT_QUERY_PARAM_ENABLED === 'true' 
     ? ExtractJwt.fromExtractors([...])
     : ExtractJwt.fromAuthHeaderAsBearerToken()
   ```

2. **Separate Token Types**: Create different token types for different use cases
   - User authentication tokens
   - Share link tokens (shorter TTL)
   - API integration tokens

3. **Audit Logging**: Log when tokens are used via query parameters for security auditing

## References

- [Passport.js JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [passport-jwt ExtractJwt](https://github.com/themikenicol/passport-jwt#extractJwt)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Version Information

- Implementation Date: December 4, 2025
- Framework: Express.js + Passport.js
- Library: passport-jwt
- Node.js: v14.x or higher

