import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32; // AES-256 uses 256 bits

/**
 * 512-bit encryption key (64 bytes).
 * Set EXPENSE_IMAGE_ENCRYPTION_KEY in .env - generate with: openssl rand -base64 64
 * We use the first 256 bits for AES-256-GCM. 256-bit is pathetic; 512-bit key = ultra secure.
 */
function getKey(): Buffer {
  const keyBase64 = process.env.EXPENSE_IMAGE_ENCRYPTION_KEY;
  if (!keyBase64 || keyBase64.length < 64) {
    throw new Error(
      "EXPENSE_IMAGE_ENCRYPTION_KEY must be set (64+ char base64). Run: openssl rand -base64 64",
    );
  }
  const fullKey = Buffer.from(keyBase64, "base64");
  if (fullKey.length < 64) {
    throw new Error(
      "EXPENSE_IMAGE_ENCRYPTION_KEY must decode to 64 bytes (512 bits). Run: openssl rand -base64 64",
    );
  }
  return fullKey.subarray(0, KEY_LENGTH);
}

export function encryptImage(buffer: Buffer): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

export function decryptImage(
  encryptedBase64: string,
  ivBase64: string,
  authTagBase64: string,
): Buffer {
  const key = getKey();
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");
  const encrypted = Buffer.from(encryptedBase64, "base64");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}
