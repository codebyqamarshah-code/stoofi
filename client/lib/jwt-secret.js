import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Centralized Server-Only Secret Validation Utility
 *
 * Strict Production Security:
 * - Requires process.env.JWT_SECRET to be configured in server environment variables.
 * - Disallows hardcoded fallbacks or default credentials.
 * - Fails closed: If missing or empty, throws a descriptive error so authentication
 *   and cryptographic signing immediately fail securely rather than proceeding with weak keys.
 * - Server-only: Never export or expose to client-side code.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || !secret.trim()) {
    throw new Error('SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing or empty on server.');
  }
  return secret.trim();
}

/**
 * Sign a JWT token using the validated server secret
 */
export function signToken(payload, options = {}) {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, options);
}

/**
 * Verify a JWT token using the validated server secret
 */
export function verifyToken(token) {
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}

/**
 * Generate a time-limited HMAC-SHA256 signature
 */
export function createHmacSignature(prefix, targetId, exp) {
  const secret = getJwtSecret();
  const payload = `${prefix}:${String(targetId).trim()}:${exp}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Timing-safe, time-limited HMAC signature verification
 */
export function verifyHmacSignature(prefix, targetId, exp, sig) {
  if (!sig || !exp || !targetId) return false;
  const expNum = parseInt(exp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (isNaN(expNum) || expNum <= now) return false;

  const secret = getJwtSecret();
  const payload = `${prefix}:${String(targetId).trim()}:${expNum}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  if (sig.length !== expectedSig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig, 'utf8'), Buffer.from(expectedSig, 'utf8'));
}
