# Security Hardening Guide

## Overview
This document outlines the security measures implemented in the OWLY CaaS platform to protect user data, prevent attacks, and ensure compliance with security standards.

## Security Layers

### 1. Transport Security (HTTPS/TLS)
- **Status**: Enabled in production
- **Implementation**: 
  - Use HTTPS with TLS 1.2+ in production
  - Configure SSL/TLS certificates from Let's Encrypt or AWS ACM
  - Enable HSTS (HTTP Strict Transport Security) headers
  - Certificate pinning for mobile apps

### 2. HTTP Headers Security
- **Helmet.js Implementation**:
  ```
  - Content-Security-Policy (CSP)
  - X-Frame-Options (Clickjacking prevention)
  - X-Content-Type-Options (MIME sniffing prevention)
  - X-XSS-Protection (XSS protection)
  - Strict-Transport-Security (HSTS)
  - Referrer-Policy (Information leakage prevention)
  ```

### 3. Authentication & Authorization

#### JWT Implementation
- **Token Structure**:
  - Access Token: 24 hours expiration
  - Refresh Token: 7 days expiration
  - Secure storage in httpOnly cookies (mobile: secure storage)
  
- **Token Validation**:
  ```
  - Verify signature on every request
  - Check token expiration
  - Validate token claims (userId, role)
  ```

#### Role-Based Access Control (RBAC)
- **Roles**:
  - `customer`: Regular user
  - `seller`: Seller with product management
  - `creator`: Creator with livestream access
  - `delivery`: Delivery personnel
  - `admin`: Full system access

- **Implementation**:
  ```typescript
  @authenticateToken
  @authorize(['seller', 'admin'])
  async createProduct(req, res) { ... }
  ```

### 4. Input Validation & Sanitization

#### Implemented Protections
- **SQL Injection Prevention**:
  - Use parameterized queries (PostgreSQL prepared statements)
  - Input validation for SQL keywords
  - Query builder (TypeORM/Sequelize) prevents direct SQL

- **XSS Prevention**:
  - HTML encoding on output
  - CSP headers restrict script sources
  - DOMPurify for user-generated content

- **NoSQL Injection Prevention**:
  - Validate input types
  - mongoose-mongo-sanitize removes $ and . from keys

- **Parameter Pollution**:
  - hpp middleware handles duplicate parameters
  - Takes last value by default

### 5. Rate Limiting

#### Configured Limits
```
General API:        100 requests / 15 minutes
Auth (login/signup): 5 attempts / 15 minutes
API Overall:       1000 requests / 1 hour
File Upload:        10 files / 1 hour (per user)
```

#### Implementation
```typescript
app.use('/api/auth/login', authLimiter);
app.use('/api/', generalLimiter);
```

### 6. CORS Configuration

#### Allowed Origins
```
Development: http://localhost:3000
Production:  https://owly.app, https://www.owly.app
```

#### Allowed Methods
```
GET, POST, PUT, DELETE, PATCH, OPTIONS
```

#### Allowed Headers
```
Content-Type, Authorization, X-Requested-With, X-Request-ID
```

### 7. Password Security

#### Requirements
- **Length**: Minimum 8 characters
- **Complexity**: 
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (!@#$%^&*)

#### Implementation
```typescript
const validatePassword = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};
```

#### Hashing
- **Algorithm**: bcrypt
- **Salt Rounds**: 12
- **Implementation**: 
  ```typescript
  const hashedPassword = await bcrypt.hash(password, 12);
  ```

### 8. Data Encryption

#### At Rest
- **Database**: 
  - Sensitive fields encrypted with AES-256
  - Encrypted: passwords, SSN, bank details
  - Field-level encryption for PII

- **Cloud Storage**:
  - S3 server-side encryption (SSE-S3)
  - KMS key rotation enabled

#### In Transit
- **TLS 1.2+** for all API communications
- **Certificate Pinning** for mobile apps

#### Implementation
```typescript
// Encrypt sensitive data before storing
const encryptSensitiveData = (data: string, key: string): string => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};
```

### 9. Secrets Management

#### Environment Variables
- **Never commit secrets** to version control
- **Use .env.example** for template
- **.env file**: Added to .gitignore

#### Production Secrets
- **AWS Secrets Manager** or **HashiCorp Vault**
- **Secrets**:
  - JWT_SECRET
  - DB credentials
  - API keys (Razorpay, Stripe, OpenAI)
  - Cloudinary credentials

#### Rotation Policy
- **Monthly rotation** for critical secrets
- **Immediate rotation** if compromise suspected

### 10. API Security

#### Request Validation
```typescript
// Validate all inputs
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const { error, value } = schema.validate(req.body);
```

#### Response Filtering
- **Remove sensitive fields** from responses
- **No passwords** in responses
- **No tokens** in user lists
- **No internal errors** to clients

#### Audit Logging
```
POST /api/orders          -> log with userId, timestamp
PUT /api/users/:id/role   -> log role change
DELETE /api/products/:id  -> log deletion
```

### 11. File Upload Security

#### Restrictions
- **Allowed Types**: jpg, jpeg, png, pdf, mp4, webm
- **Max Size**: 50MB per file
- **Scanning**: ClamAV antivirus scanning

#### Implementation
```typescript
const multer = require('multer');
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

### 12. CSRF Protection

#### Implementation
```typescript
// Token generation
app.use(csrf());

// Include in forms
<input type="hidden" name="_csrf" value="<%= csrfToken %>" />
```

#### SameSite Cookies
```
Strict: Only same-site requests
Lax: Same-site + top-level navigation
```

### 13. Account Security

#### Account Lockout
- **Failed Attempts**: 5 consecutive failures
- **Lockout Duration**: 30 minutes
- **Notification**: Email alert on lockout

#### Session Management
- **Session Timeout**: 24 hours
- **Concurrent Sessions**: 1 per user (logout other sessions)
- **Device Tracking**: List active sessions with device info

#### 2FA Implementation
```typescript
// TOTP-based 2FA
import speakeasy from 'speakeasy';

const secret = speakeasy.generateSecret();
const verified = speakeasy.totp.verify({
  secret: secret.base32,
  encoding: 'base32',
  token: userToken,
});
```

### 14. Monitoring & Alerts

#### Monitoring
- **Real-time Dashboard**: Security events, attack attempts
- **Metrics**: 
  - Failed login attempts
  - Rate limit violations
  - Error rates
  - Response times

#### Alert Triggers
```
- 10+ failed logins from same IP
- Unusual API usage patterns
- Multiple 401/403 errors
- Database connection failures
```

#### Logging
```
- All API requests (method, endpoint, status, duration)
- User actions (login, logout, role changes)
- Admin actions (deletions, updates)
- Security events (rate limits, CSP violations)
```

### 15. Compliance

#### Standards
- **OWASP Top 10**: All protections implemented
- **PCI DSS**: For payment processing
- **GDPR**: Data privacy & right to deletion
- **SOC 2**: Internal security controls

#### Data Privacy
- **User Consent**: Required before data collection
- **Data Retention**: Delete after 90 days of inactivity
- **Right to Deletion**: Full data wipe within 30 days
- **Encryption**: PII encrypted at rest and in transit

### 16. Testing & Validation

#### Security Testing
```bash
# OWASP ZAP scanning
owasp-zap --quick-scan https://api.owly.app

# Dependency vulnerability scanning
npm audit
npm audit fix

# Penetration testing
# Scheduled quarterly with external security firm
```

#### Code Review
- **Security review** on all PRs
- **SAST tools**: SonarQube, Snyk
- **Dependency checks**: Dependabot enabled

## Deployment Checklist

```
[ ] All environment variables set (no defaults in prod)
[ ] HTTPS/TLS configured (TLS 1.2+)
[ ] Database encrypted and backed up
[ ] Secrets rotated and secured
[ ] Rate limits configured
[ ] CORS origins restricted
[ ] Security headers enabled
[ ] Logging and monitoring active
[ ] Backup and disaster recovery tested
[ ] Security audit completed
```

## Incident Response

### Security Breach Protocol
1. **Identify**: Determine scope and impact
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat
4. **Recover**: Restore systems
5. **Notify**: Inform affected users (within 72 hours)
6. **Review**: Post-incident analysis

### Contact
- **Security Email**: security@owly.app
- **Emergency**: +1-XXX-XXX-XXXX
- **Bug Bounty**: https://owly.app/security/bounty

## References
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- CWE Top 25: https://cwe.mitre.org/top25/
