import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a base64 encoded string containing: salt + iv + authTag + ciphertext
 *
 * Uses scrypt for key derivation from the master key + random salt
 * for additional security (envelope encryption ready).
 */
export function encrypt(plaintext: string): string {
  const masterKey = getMasterKey();

  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Derive encryption key from master key + salt
  const key = scryptSync(masterKey, salt, KEY_LENGTH);

  // Encrypt
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine: salt + iv + authTag + ciphertext
  const combined = Buffer.concat([salt, iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypts a base64 encoded ciphertext that was encrypted with encrypt().
 */
export function decrypt(ciphertext: string): string {
  const masterKey = getMasterKey();

  // Decode from base64
  const combined = Buffer.from(ciphertext, 'base64');

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  // Derive key from master key + salt
  const key = scryptSync(masterKey, salt, KEY_LENGTH);

  // Decrypt
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

/**
 * Generates a cryptographically secure random token.
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hashes a token for storage (one-way hash for comparison).
 * Uses scrypt for secure hashing.
 */
export function hashToken(token: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(token, salt, 32);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verifies a token against its stored hash.
 */
export function verifyTokenHash(token: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const hash = scryptSync(token, salt, 32);

  // Timing-safe comparison
  const storedHashBuffer = Buffer.from(hashHex, 'hex');
  if (hash.length !== storedHashBuffer.length) return false;

  let result = 0;
  for (let i = 0; i < hash.length; i++) {
    result |= hash[i] ^ storedHashBuffer[i];
  }
  return result === 0;
}

function getMasterKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Expect a 64-character hex string (32 bytes)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}
