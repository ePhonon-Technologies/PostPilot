
import dotenv from 'dotenv'
import crypto from 'crypto';
dotenv.config();

// 32-byte (256-bit) key, base64 or hex encoded, stored in your env — never in code.
// Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.TOKEN_ENCRYPTION_KEY!, 'hex');

if (!process.env.TOKEN_ENCRYPTION_KEY) {
  throw new Error('TOKEN_ENCRYPTION_KEY is not set in the environment');
}

/**
 * Encrypts a plaintext string (e.g. an OAuth access token) for storage.
 * Output format: iv:authTag:ciphertext (all hex), so it's a single string
 * that fits cleanly into a @db.Text column.
 */
export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(12); // 12 bytes is the recommended IV size for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts a string produced by encrypt(). Throws if the value has been
 * tampered with (GCM auth tag mismatch) or the key is wrong.
 */
export function decrypt(payload: string): string {
  const [ivHex, authTagHex, encryptedHex] = payload.split(':');

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error('Malformed encrypted payload');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}