# JWT Query Parameter Support - Quick Reference

## What Changed?
The API now accepts JWT tokens via URL query parameters: `?token=<jwt_token>`

## How to Use

### Option 1: Authorization Header (Recommended)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/v1/parties/PARTY_ID/assignments
```

### Option 2: Query Parameter (New!)
```bash
curl http://localhost:3000/api/v1/parties/PARTY_ID/assignments?token=YOUR_JWT_TOKEN
```

## Real Example

### Get Assignments with Header
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzAxNjUyODAwfQ.abc123" \
  http://localhost:3000/api/v1/parties/66fa4136-a97c-46a8-87fc-d9b71f50810c/assignments
```

### Get Assignments with Query Parameter
```bash
curl "http://localhost:3000/api/v1/parties/66fa4136-a97c-46a8-87fc-d9b71f50810c/assignments?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzAxNjUyODAwfQ.abc123"
```

## Which Endpoints Support This?

**All protected endpoints** that use the `protect` middleware:

✅ Assignment endpoints  
✅ Party endpoints  
✅ User endpoints  
✅ Wishlist endpoints  

**Except**: Public endpoints like `GET /parties/by-token` (these use different tokens)

## Frontend Integration

### JavaScript/Fetch
```javascript
const token = "YOUR_JWT_TOKEN";
const partyId = "66fa4136-a97c-46a8-87fc-d9b71f50810c";

// Method 1: Header
fetch(`/api/v1/parties/${partyId}/assignments`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Method 2: Query parameter
fetch(`/api/v1/parties/${partyId}/assignments?token=${token}`);
```

### Angular
```typescript
// Method 1: Header (recommended)
getAssignments(partyId: string, token: string) {
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  return this.http.get(`/api/v1/parties/${partyId}/assignments`, { headers });
}

// Method 2: Query parameter
getAssignments(partyId: string, token: string) {
  return this.http.get(`/api/v1/parties/${partyId}/assignments?token=${token}`);
}
```

## ⚠️ Security Notes

| Method | Visible In | Security | Use Case |
|--------|-----------|----------|----------|
| **Header** | Only client/server | Higher | API calls, sensitive operations |
| **Query Param** | Browser history, logs, referrer | Lower | Sharing links, public embedding |

**Best Practice**: Use headers for standard API calls, query parameters only when sharing links or embedding.

## Files Modified

- `src/config/passport.js` - Extended JWT extraction strategy

## Status

✅ **Implementation Complete**
- No breaking changes
- Backward compatible
- Ready to use immediately

## Questions?

See: `descriptions/JWT_QUERY_PARAMETER_SUPPORT.md` for detailed documentation

