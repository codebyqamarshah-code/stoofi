const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const path = require('path');

describe('JWT Secret Centralized Security Validation', async () => {
  const jwtSecretModulePath = path.resolve(__dirname, '../lib/jwt-secret.js');
  let jwtLib;

  // Dynamically import ES module
  jwtLib = await import('file://' + jwtSecretModulePath.replace(/\\/g, '/'));

  const ORIGINAL_ENV = process.env.JWT_SECRET;

  afterEach(() => {
    if (ORIGINAL_ENV !== undefined) {
      process.env.JWT_SECRET = ORIGINAL_ENV;
    } else {
      delete process.env.JWT_SECRET;
    }
  });

  it('1. getJwtSecret() throws error when process.env.JWT_SECRET is missing or empty', () => {
    delete process.env.JWT_SECRET;
    assert.throws(
      () => jwtLib.getJwtSecret(),
      /SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing/
    );

    process.env.JWT_SECRET = '';
    assert.throws(
      () => jwtLib.getJwtSecret(),
      /SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing/
    );

    process.env.JWT_SECRET = '   ';
    assert.throws(
      () => jwtLib.getJwtSecret(),
      /SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing/
    );
  });

  it('2. getJwtSecret() returns trimmed valid secret when configured', () => {
    process.env.JWT_SECRET = '  my_secure_prod_secret_2026!  ';
    const secret = jwtLib.getJwtSecret();
    assert.strictEqual(secret, 'my_secure_prod_secret_2026!');
  });

  it('3. signToken and verifyToken fail closed when JWT_SECRET is unset', () => {
    delete process.env.JWT_SECRET;
    assert.throws(() => {
      jwtLib.signToken({ id: '123', role: 'Admin' });
    }, /SECURITY CONFIGURATION ERROR/);

    assert.throws(() => {
      jwtLib.verifyToken('some.fake.token');
    }, /SECURITY CONFIGURATION ERROR/);
  });

  it('4. signToken and verifyToken work correctly with valid secret', () => {
    process.env.JWT_SECRET = 'test_secret_for_jwt_unit_testing';
    const payload = { id: 'user_456', role: 'Super Admin' };
    const token = jwtLib.signToken(payload, { expiresIn: '1h' });
    assert.ok(typeof token === 'string' && token.length > 20);

    const decoded = jwtLib.verifyToken(token);
    assert.strictEqual(decoded.id, 'user_456');
    assert.strictEqual(decoded.role, 'Super Admin');
  });

  it('5. HMAC signing fails closed when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    const now = Math.floor(Date.now() / 1000) + 7200;
    assert.throws(() => {
      jwtLib.createHmacSignature('student_photo', 'stu_001', now);
    }, /SECURITY CONFIGURATION ERROR/);
  });

  it('6. verifyHmacSignature validates correct, unexpired signatures', () => {
    process.env.JWT_SECRET = 'test_secret_for_hmac_testing';
    const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
    const sig = jwtLib.createHmacSignature('student_photo', 'stu_001', exp);

    const isValid = jwtLib.verifyHmacSignature('student_photo', 'stu_001', exp, sig);
    assert.strictEqual(isValid, true);
  });

  it('7. verifyHmacSignature strictly rejects expired signatures', () => {
    process.env.JWT_SECRET = 'test_secret_for_hmac_testing';
    const pastExp = Math.floor(Date.now() / 1000) - 10; // 10 seconds ago
    // Force create a signature that has past expiration
    const secret = 'test_secret_for_hmac_testing';
    const crypto = require('crypto');
    const pastSig = crypto.createHmac('sha256', secret).update(`student_photo:stu_001:${pastExp}`).digest('hex');

    const isValid = jwtLib.verifyHmacSignature('student_photo', 'stu_001', pastExp, pastSig);
    assert.strictEqual(isValid, false);
  });

  it('8. verifyHmacSignature rejects forged or tampered signatures', () => {
    process.env.JWT_SECRET = 'test_secret_for_hmac_testing';
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const sig = jwtLib.createHmacSignature('student_photo', 'stu_001', exp);

    // Tampered targetId
    const isDifferentStudent = jwtLib.verifyHmacSignature('student_photo', 'stu_999', exp, sig);
    assert.strictEqual(isDifferentStudent, false);

    // Tampered signature hex
    const corruptedSig = sig.substring(0, sig.length - 2) + '00';
    const isCorrupted = jwtLib.verifyHmacSignature('student_photo', 'stu_001', exp, corruptedSig);
    assert.strictEqual(isCorrupted, false);
  });

  it('9. verifyHmacSignature handles invalid length signatures safely without throwing RangeError', () => {
    process.env.JWT_SECRET = 'test_secret_for_hmac_testing';
    const exp = Math.floor(Date.now() / 1000) + 3600;

    assert.doesNotThrow(() => {
      const result = jwtLib.verifyHmacSignature('student_photo', 'stu_001', exp, 'short_sig');
      assert.strictEqual(result, false);
    });

    assert.doesNotThrow(() => {
      const result = jwtLib.verifyHmacSignature('student_photo', 'stu_001', exp, '');
      assert.strictEqual(result, false);
    });
  });

  it('10. Namespace isolation: student signatures cannot authorize staff endpoints', () => {
    process.env.JWT_SECRET = 'test_secret_for_hmac_testing';
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const targetId = 'entity_123';

    // Generated for student
    const studentSig = jwtLib.createHmacSignature('student_photo', targetId, exp);

    // Attempting to use on staff endpoint
    const canAccessStaff = jwtLib.verifyHmacSignature('staff_photo', targetId, exp, studentSig);
    assert.strictEqual(canAccessStaff, false);
  });
});
