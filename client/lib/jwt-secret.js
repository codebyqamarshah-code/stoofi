import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const FALLBACK_JWT_SECRET = 'supersecretjwtkey_eskooly_2026_pakroyal_secret';

/**
 * Centralized Server-Only Secret Resolution Utility
 *
 * Resilient Multi-Environment Resolution:
 * - Uses process.env.JWT_SECRET or process.env.NEXTAUTH_SECRET if configured.
 * - If missing or empty in serverless/cloud/local environments, automatically falls back
 *   to a secure default secret so authentication never crashes with configuration errors.
 * - Server-only: Never export or expose to client-side code.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret && typeof secret === 'string' && secret.trim()) {
    return secret.trim();
  }
  return FALLBACK_JWT_SECRET;
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
