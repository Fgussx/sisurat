# 🔐 Security Documentation - SiSurat

## Overview

SiSurat implements comprehensive security measures for production-grade email letter management system. This document outlines all security features, authentication mechanisms, and best practices.

---

## 🔐 Authentication

### JWT Token-Based Authentication

**Access Token:**
- Expiry: 15 minutes
- Stored in: httpOnly cookie (secure)
- Used for: API requests authentication

**Refresh Token:**
- Expiry: 7 days
- Stored in: httpOnly cookie (secure)
- Used for: Obtaining new access token

**Token Refresh Flow:**
```
1. User logs in with username/password
2. Server returns access token + refresh token
3. Access token stored in httpOnly cookie
4. When access token expires, client calls /api/refresh-token
5. Server validates refresh token and returns new access token
6. Process repeats automatically
```

### Password Security

**Hashing:**
- Algorithm: bcryptjs with salt rounds = 10
- Minimum Length: 8 characters
- Hashed: At save time (pre-save hook in Mongoose)

**Password Validation:**
- Enforced on: login, reset-password, change-password, create-user
- Minimum 8 characters required
- Special characters not required (per specification)

**OTP (One-Time Password):**
- Length: 6 digits
- Validity: 10 minutes
- Delivery: Gmail SMTP via Nodemailer
- Used for: Password reset verification

---

## 🛡️ Authorization

### Role-Based Access Control (RBAC)

**Available Roles:**
1. **Admin**: Full system access
   - Create/delete users
   - Manage all data
   - Approve outgoing letters

2. **Staff**: Limited access
   - Create/edit own letters
   - View shared letters
   - Cannot delete other users' data

### Admin-Only Endpoints

**User Management:**
- `POST /api/create-user` - Create new user
- `DELETE /api/delete-user` - Delete user account
- `GET /api/users` - List all users
- `POST /api/roles` - Create new role

**Data Management:**
- `DELETE /api/surat-masuk/:id` - Delete incoming letter
- `DELETE /api/surat-keluar/:id` - Delete outgoing letter
- `DELETE /api/reminders/:id` - Delete reminder
- `DELETE /api/custom-folders/:id` - Delete custom folder

**Protection Mechanism:**
```javascript
// Middleware applied to all admin endpoints
async function verifyAdminRole(req, res, next) {
  const user = await Pengguna.findById(req.userId).populate('id_role')
  if (!user || user.id_role.nama_role !== 'Admin') {
    return res.status(403).json({ error: 'Admin saja' })
  }
  next()
}
```

---

## 🔒 Input Security

### Input Validation

**Validation Library:** Joi v17.11.0

**Validated Endpoints:** 15+ critical endpoints

**Validation Rules:**
- Username: alphanumeric, 3-30 chars
- Password: minimum 8 characters
- Email: valid email format
- Dates: ISO 8601 format
- Enums: whitelist only valid values
- Object IDs: MongoDB ObjectId format

**Error Response Format:**
```json
{
  "success": false,
  "error": "Validasi gagal",
  "details": [
    { "field": "username", "message": "must be alphanumeric" },
    { "field": "password", "message": "must have minimum length of 8" }
  ]
}
```

### XSS Protection

**Helmet.js Configuration:**
- Content-Security-Policy enabled
- X-Frame-Options: DENY (prevents clickjacking)
- X-Content-Type-Options: nosniff
- Strict-Transport-Security: enabled

**Unknown Fields:**
- Automatically stripped from requests
- Prevents field injection attacks
- Configuration: `stripUnknown: true` in Joi validators

---

## 🚦 Rate Limiting

### Rate Limit Rules

**Login Endpoint:**
- Limit: 5 attempts per 15 minutes
- Purpose: Prevent brute force attacks

**OTP Endpoints:**
- Limit: 3 attempts per 10 minutes
- Purpose: Prevent OTP brute force

**Password Reset:**
- Limit: 3 attempts per 30 minutes
- Purpose: Prevent password reset abuse

**Global API:**
- Limit: 100 requests per minute
- Purpose: General API rate limiting

**Headers:**
- `RateLimit-Limit`: Total requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Time until limit resets

---

## 📋 Data Validation

### MongoDB Injection Prevention

**Protection:**
- Using Mongoose (built-in parameterized queries)
- No string concatenation in queries
- Automatic escaping of special characters

**Example (Secure):**
```javascript
const user = await Pengguna.findOne({ username: username })
// Not vulnerable: Mongoose parameterizes the query
```

### Field Sanitization

**Applied Fields:**
- username: trimmed, alphanumeric only
- email: converted to lowercase
- All text fields: trimmed

---

## 📊 Audit Logging

### Winston Logger

**Configuration:**
- Log Level: info (configurable via LOG_LEVEL env var)
- File Rotation: maxsize 5MB, keep 30 files (30-day retention)
- Format: JSON with timestamps
- Output: Console (dev) + Files (prod)

**Log Files:**
- `logs/combined.log`: All logs
- `logs/error.log`: Errors only

### Events Logged

**Authentication:**
- ✅ Login success: username, userId, role, IP
- ✅ Login failure: username, IP, reason
- ✅ Password reset: username, success/failure
- ✅ OTP generation: username, IP

**User Management:**
- ✅ User created: by admin, new username
- ✅ User deleted: by admin, deleted username
- ✅ Password changed: username
- ✅ User updated: fields changed

**System:**
- ✅ Server startup
- ✅ MongoDB connection
- ✅ Role initialization
- ✅ Errors with stack traces

**Log Entry Example:**
```json
{
  "level": "info",
  "message": "User login successful",
  "timestamp": "2026-09-10 04:30:28",
  "username": "admin",
  "userId": "66df...",
  "role": "Admin",
  "ip": "127.0.0.1",
  "service": "sisurat-api"
}
```

---

## 🌐 CORS Security

### CORS Configuration

**Allowed Origins:**
- Development: http://localhost:5000
- Production: https://sisurat.vercel.app (configured via ALLOWED_ORIGINS env var)

**Credentials:**
- httpOnly: true (prevents JavaScript access)
- secure: true (HTTPS only in production)
- sameSite: strict (prevents CSRF)

---

## 🔑 Environment Variables

**Required:**
```bash
# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# JWT Secrets (generate strong random values)
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Environment
NODE_ENV=production

# Optional
LOG_LEVEL=info
ALLOWED_ORIGINS=https://sisurat.vercel.app,https://example.com
```

**Security Notes:**
- Never commit `.env` to git
- Rotate secrets regularly
- Use strong random values (min 32 characters)
- Use environment variable management in hosting platform

---

## ✅ Security Checklist

### Before Deployment

- [ ] All environment variables configured
- [ ] JWT secrets rotated and strong
- [ ] MongoDB connection string secure
- [ ] CORS allowed origins configured correctly
- [ ] Email credentials working
- [ ] Rate limits appropriate for traffic
- [ ] Logs directory writable and monitored
- [ ] npm audit shows 0 vulnerabilities
- [ ] All endpoints tested for RBAC
- [ ] Input validation working on all endpoints
- [ ] Error messages don't leak sensitive data

### Post-Deployment

- [ ] Monitor `logs/error.log` for issues
- [ ] Check login attempts for brute force patterns
- [ ] Review admin actions in logs regularly
- [ ] Monitor rate limit effectiveness
- [ ] Test token refresh mechanism
- [ ] Verify CORS headers present
- [ ] Check password reset OTP delivery

---

## 🔐 Best Practices

### For Administrators

1. **User Management:**
   - Create users with strong unique passwords
   - Review user list regularly
   - Delete inactive accounts
   - Monitor login patterns for suspicious activity

2. **Data Management:**
   - Backup critical letters
   - Review audit logs monthly
   - Delete old archived letters
   - Monitor log file disk usage

3. **Security Maintenance:**
   - Rotate JWT secrets annually
   - Update dependencies monthly (`npm audit fix`)
   - Review and update rate limits based on traffic
   - Monitor rate limit effectiveness

### For Developers

1. **API Development:**
   - Always validate input with Joi schemas
   - Always add authentication middleware
   - Always add admin check for admin endpoints
   - Log important actions

2. **Security:**
   - Never log passwords or sensitive data
   - Use prepared statements (Mongoose does this)
   - Sanitize error messages
   - Keep dependencies updated

3. **Monitoring:**
   - Monitor error.log for issues
   - Set up alerts for spike in errors
   - Review logs for security patterns
   - Test rate limits under load

---

## 📞 Support

For security issues:
1. Document the issue with reproduction steps
2. Do NOT post security vulnerabilities publicly
3. Email security team with details
4. Allow 24 hours for response

---

**Last Updated:** 2026-09-10  
**Version:** 1.0  
**Status:** Production Ready
