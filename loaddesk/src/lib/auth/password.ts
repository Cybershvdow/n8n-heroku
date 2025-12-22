import argon2 from 'argon2';

// Argon2id configuration (OWASP recommended)
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
};

/**
 * Hash a password using Argon2id.
 * NEVER log the password or the hash during normal operation.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * Verify a password against its hash.
 * Returns true if the password matches, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    // If verification fails (e.g., invalid hash format), return false
    return false;
  }
}

/**
 * Check if a password hash needs to be upgraded.
 * Call this after successful login to detect outdated hash configurations.
 */
export function needsRehash(hash: string): boolean {
  return argon2.needsRehash(hash, ARGON2_OPTIONS);
}

/**
 * Validate password strength.
 * Returns an array of validation errors, empty if valid.
 */
export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for common passwords
  const commonPasswords = [
    'password', 'password123', '123456789', 'qwerty123',
    'letmein', 'welcome', 'admin123', 'iloveyou',
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common');
  }

  return errors;
}
