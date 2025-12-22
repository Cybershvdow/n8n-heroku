# LoadDesk Security Documentation

## Security Overview

LoadDesk implements defense-in-depth security with multiple layers of protection.

## Security Checklist

### Authentication
- [x] Argon2id password hashing (OWASP recommended)
- [x] Minimum 12 character passwords
- [x] Common password blocking
- [x] Rate limiting on login (5 attempts/minute)
- [x] Account lockout after 5 failed attempts
- [x] Secure session cookies (httpOnly, secure, sameSite)
- [x] Session invalidation on password reset
- [x] One-time password reset tokens (hashed in DB)

### Authorization
- [x] Role-based access control (RBAC)
- [x] Tenant isolation on all queries
- [x] Centralized authorization checks
- [x] API route protection middleware

### Data Protection
- [x] OAuth tokens encrypted at rest (AES-256-GCM)
- [x] Envelope encryption with scrypt key derivation
- [x] Parameterized queries (Prisma)
- [x] Input validation (Zod schemas)
- [x] XSS prevention (React auto-escaping)
- [x] CSRF protection via SameSite cookies

### Infrastructure
- [x] TLS everywhere (enforced in production)
- [x] Security headers (X-Frame-Options, CSP, etc.)
- [x] Secrets in environment variables only
- [x] No credentials in code or logs

### Monitoring
- [x] Audit logging for security events
- [x] PII redaction in logs
- [x] Rate limit headers in responses

## Threat Model (STRIDE)

### Spoofing
| Threat | Mitigation |
|--------|------------|
| Password guessing | Rate limiting, account lockout, strong password policy |
| Session hijacking | Secure cookies, session rotation |
| OAuth token theft | Encryption at rest, short-lived tokens |

### Tampering
| Threat | Mitigation |
|--------|------------|
| Request modification | Input validation, CSRF protection |
| Database manipulation | Parameterized queries, tenant isolation |
| Token tampering | HMAC signatures, encrypted storage |

### Repudiation
| Threat | Mitigation |
|--------|------------|
| Denying actions | Immutable audit logs |
| Claiming unauthorized access | Action attribution in logs |

### Information Disclosure
| Threat | Mitigation |
|--------|------------|
| Password exposure | Argon2id hashing, never logged |
| Token leakage | Encrypted storage, no client exposure |
| User enumeration | Generic error messages |
| Email content exposure | Minimal storage, redacted previews |

### Denial of Service
| Threat | Mitigation |
|--------|------------|
| Brute force attacks | Rate limiting, lockout |
| Resource exhaustion | Query limits, pagination |

### Elevation of Privilege
| Threat | Mitigation |
|--------|------------|
| Role bypass | Server-side RBAC enforcement |
| Tenant crossing | Query-level isolation |
| Admin impersonation | No shared accounts, audit trail |

## Incident Response Outline

### Detection
1. Monitor failed login attempts (audit logs)
2. Alert on rate limit hits
3. Monitor token expiration errors
4. Review audit logs regularly

### Response
1. **Identify** - Determine scope and affected users
2. **Contain** - Disable compromised accounts/integrations
3. **Eradicate** - Rotate affected secrets/tokens
4. **Recover** - Restore access with new credentials
5. **Review** - Document and improve

### Escalation
- Security incidents: Notify security team immediately
- Data breach: Legal and compliance notification
- User notification: Within 72 hours if required

## SOC2 Evidence Notes

### Access Controls (CC6.1, CC6.2, CC6.3)
- RBAC implementation in `src/lib/auth/session.ts`
- Role definitions in Prisma schema
- Tenant isolation in `src/lib/db/client.ts`

### Logical Access (CC6.6, CC6.7)
- Session management in `src/lib/auth/session.ts`
- Rate limiting in `src/lib/auth/rate-limit.ts`
- Password policies in `src/lib/validation/schemas.ts`

### Data Protection (CC6.7)
- Encryption utilities in `src/lib/crypto/encryption.ts`
- Token storage in `EmailIntegrationAccount` model

### Audit Logging (CC7.2)
- Audit service in `src/services/audit.ts`
- AuditLog model with comprehensive actions
- PII redaction function

### Key Rotation Plan
1. **Session secrets**: Rotate quarterly
   - Update `SESSION_SECRET`
   - All users will be logged out

2. **Encryption keys**: Rotate annually
   - Create new key
   - Re-encrypt all OAuth tokens
   - Update `ENCRYPTION_KEY`

3. **OAuth tokens**: Automatic via refresh
   - Tokens expire and refresh automatically
   - Revocation on disconnect

## API Security

### Headers
All responses include:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-XSS-Protection: 1; mode=block
```

### Rate Limits
| Endpoint | Limit |
|----------|-------|
| `/api/auth/*` | 5/minute |
| `/api/auth/request-password-reset` | 3/hour |
| Other API routes | 100/minute |

### Error Handling
- Generic error messages to prevent information leakage
- Detailed errors only in development mode
- No stack traces in production responses

## AI Security

### Prompt Injection Prevention
- Email content treated as untrusted
- Explicit instruction to ignore embedded commands
- Structured JSON output validation
- No dynamic prompt construction from user input

### Data Minimization
- Only necessary fields extracted
- Body content not stored long-term
- Summaries instead of full content

## Contact

For security issues, please contact: security@loaddesk.app
