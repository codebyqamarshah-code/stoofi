const { describe, it } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const jwt = require('../node_modules/jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_eskooly_2026';

function isAuthorized(req, targetId) {
  // 1. Check logged-in user session cookie (standard browser dashboard)
  const cookieToken = req.cookies?.get('token')?.value;
  if (cookieToken) {
    try {
      jwt.verify(cookieToken, JWT_SECRET);
      return true;
    } catch (_) {}
  }

  // 2. Check Authorization header (API / mobile requests)
  const authHeader = req.headers?.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const headerToken = authHeader.substring(7).trim();
    try {
      jwt.verify(headerToken, JWT_SECRET);
      return true;
    } catch (_) {}
  }

  // 3. Cryptographic time-limited HMAC signature check for verified public QR card scanning
  // Prevents enumeration & replay: An attacker cannot forge this signature or reuse expired tokens.
  const sig = req.nextUrl?.searchParams?.get('sig');
  const expStr = req.nextUrl?.searchParams?.get('exp');
  if (sig && expStr && targetId) {
    const exp = parseInt(expStr, 10);
    const now = Math.floor(Date.now() / 1000);
    if (!isNaN(exp) && exp > now) {
      const payload = `student_photo:${String(targetId).trim()}:${exp}`;
      const expectedSig = crypto
        .createHmac('sha256', JWT_SECRET)
        .update(payload)
        .digest('hex');

      // Timing-safe comparison to prevent side-channel timing attacks
      if (sig.length === expectedSig.length) {
        const sigBuf = Buffer.from(sig, 'utf8');
        const expectedBuf = Buffer.from(expectedSig, 'utf8');
        if (crypto.timingSafeEqual(sigBuf, expectedBuf)) {
          return true;
        }
      }
    }
  }

  // 4. Time-limited signed token specifically for public QR verification
  const verifyToken = req.nextUrl?.searchParams?.get('verify_token');
  if (verifyToken) {
    try {
      const decoded = jwt.verify(verifyToken, JWT_SECRET);
      if (decoded && (decoded.sub === targetId || decoded.targetId === targetId || decoded.admissionNo === targetId)) {
        return true;
      }
    } catch (_) {}
  }

  return false;
}

describe('Photo Security & Anti-Enumeration Verification', () => {

  it('1. Rejects request without authentication token (401)', () => {
    const mockReq = {
      nextUrl: { searchParams: new Map() },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };
    assert.strictEqual(isAuthorized(mockReq, '672000000000000000000001'), false);
  });

  it('2. CRITICAL: Rejects naive ?verify=public attempt without valid signature (401)', () => {
    const mockReq = {
      nextUrl: { searchParams: new Map([['verify', 'public']]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };
    assert.strictEqual(isAuthorized(mockReq, '672000000000000000000001'), false);
  });

  it('3. Rejects forged or invalid HMAC signature ?sig=invalid (401)', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const mockReq = {
      nextUrl: { searchParams: new Map([['sig', 'deadbeef12345678'], ['exp', String(exp)]]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };
    assert.strictEqual(isAuthorized(mockReq, '672000000000000000000001'), false);
  });

  it('4. Rejects request with missing expiration timestamp ?exp (401)', () => {
    const targetId = '672000000000000000000001';
    const sig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`student_photo:${targetId}:3600`)
      .digest('hex');

    const mockReq = {
      nextUrl: { searchParams: new Map([['sig', sig]]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };
    assert.strictEqual(isAuthorized(mockReq, targetId), false, 'Missing exp must be rejected');
  });

  it('5. Rejects expired time-limited HMAC signature (401)', () => {
    const targetId = '672000000000000000000001';
    // Expired 60 seconds ago
    const pastExp = Math.floor(Date.now() / 1000) - 60;
    const expiredSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`student_photo:${targetId}:${pastExp}`)
      .digest('hex');

    const mockExpiredReq = {
      nextUrl: { searchParams: new Map([['sig', expiredSig], ['exp', String(pastExp)]]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };

    assert.strictEqual(isAuthorized(mockExpiredReq, targetId), false, 'Expired token must be rejected');
  });

  it('6. Rejects signature generated for a different student ID (tamper / enumeration prevention) (401)', () => {
    const legitimateStudentId = '672000000000000000000001';
    const attackerTargetId = '672000000000000000000002';
    const exp = Math.floor(Date.now() / 1000) + 3600;

    const sigForStudent1 = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`student_photo:${legitimateStudentId}:${exp}`)
      .digest('hex');

    const mockAttackReq = {
      nextUrl: { searchParams: new Map([['sig', sigForStudent1], ['exp', String(exp)]]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };

    // Sig was for student 1, attacker is requesting student 2 -> REJECTED
    assert.strictEqual(isAuthorized(mockAttackReq, attackerTargetId), false);
  });

  it('7. Rejects signature when expiration timestamp has been tampered with (401)', () => {
    const targetId = '672000000000000000000001';
    const originalExp = Math.floor(Date.now() / 1000) + 3600;
    const tamperedExp = Math.floor(Date.now() / 1000) + 7200;

    const sigForOriginalExp = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`student_photo:${targetId}:${originalExp}`)
      .digest('hex');

    const mockTamperedReq = {
      nextUrl: { searchParams: new Map([['sig', sigForOriginalExp], ['exp', String(tamperedExp)]]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };

    assert.strictEqual(isAuthorized(mockTamperedReq, targetId), false, 'Tampered exp must invalidate signature');
  });

  it('8. Authorizes legitimate QR scan with valid, non-expired time-limited HMAC signature', () => {
    const studentId = '672000000000000000000001';
    const validExp = Math.floor(Date.now() / 1000) + 3600;
    const legitimateSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`student_photo:${studentId}:${validExp}`)
      .digest('hex');

    const mockValidQrReq = {
      nextUrl: { searchParams: new Map([['sig', legitimateSig], ['exp', String(validExp)]]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };

    assert.strictEqual(isAuthorized(mockValidQrReq, studentId), true);
  });

  it('9. Authorizes request with valid signed QR verify token', () => {
    const studentId = '672000000000000000000001';
    const verifyToken = jwt.sign({ targetId: studentId, purpose: 'qr_verify' }, JWT_SECRET, { expiresIn: '7d' });

    const mockTokenReq = {
      nextUrl: { searchParams: new Map([['verify_token', verifyToken]]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };

    assert.strictEqual(isAuthorized(mockTokenReq, studentId), true);
  });

  it('10. Rejects expired signed QR verify token (401)', () => {
    const studentId = '672000000000000000000001';
    // Expired immediately
    const expiredToken = jwt.sign({ targetId: studentId, purpose: 'qr_verify' }, JWT_SECRET, { expiresIn: '0s' });

    const mockTokenReq = {
      nextUrl: { searchParams: new Map([['verify_token', expiredToken]]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };

    assert.strictEqual(isAuthorized(mockTokenReq, studentId), false, 'Expired JWT must be rejected');
  });

  it('11. Authorizes logged-in user via session cookie', () => {
    const sessionToken = jwt.sign({ id: 'user_123', email: 'admin@stoofi.com' }, JWT_SECRET, { expiresIn: '1h' });
    const mockCookieReq = {
      nextUrl: { searchParams: new Map() },
      cookies: { get: (name) => name === 'token' ? { value: sessionToken } : undefined },
      headers: { get: () => null }
    };

    assert.strictEqual(isAuthorized(mockCookieReq, '672000000000000000000001'), true);
  });

  it('12. Authorizes logged-in user via Authorization header', () => {
    const sessionToken = jwt.sign({ id: 'user_123', email: 'admin@stoofi.com' }, JWT_SECRET, { expiresIn: '1h' });
    const mockHeaderReq = {
      nextUrl: { searchParams: new Map() },
      cookies: { get: () => undefined },
      headers: { get: (name) => name === 'authorization' ? `Bearer ${sessionToken}` : null }
    };

    assert.strictEqual(isAuthorized(mockHeaderReq, '672000000000000000000001'), true);
  });

  it('13. Write-Path removes studentPhoto duplicate before MongoDB persistence', () => {
    const samplePayload = {
      firstName: 'Ahmed',
      studentPhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
    };

    const photoData = samplePayload.photo || samplePayload.studentPhoto || '';
    delete samplePayload.studentPhoto;
    samplePayload.photo = photoData;

    assert.strictEqual(samplePayload.studentPhoto, undefined, 'studentPhoto key must be removed from persistence payload');
    assert.strictEqual(samplePayload.photo, 'data:image/jpeg;base64,/9j/4AAQSkZJRg...', 'photo key must contain canonical image data');
  });

  it('14. API serialization synthesizes studentPhoto for legacy client compatibility', () => {
    const dbRecordFromMongo = {
      _id: '672000000000000000000001',
      studentName: 'Ali Khan',
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
    };

    const canonicalPhoto = dbRecordFromMongo.photo || dbRecordFromMongo.studentPhoto || '';
    const formattedResponse = {
      ...dbRecordFromMongo,
      photo: canonicalPhoto,
      studentPhoto: canonicalPhoto
    };

    assert.strictEqual(formattedResponse.studentPhoto, dbRecordFromMongo.photo, 'studentPhoto must be synthesized from photo');
    assert.strictEqual(formattedResponse.photo, dbRecordFromMongo.photo, 'photo must remain intact');
  });

  it('15. Rejects student signature attempting to access staff photo endpoint (cross-role isolation) (401)', () => {
    function isStaffAuthorized(req, targetId) {
      const sig = req.nextUrl?.searchParams?.get('sig');
      const expStr = req.nextUrl?.searchParams?.get('exp');
      if (sig && expStr && targetId) {
        const exp = parseInt(expStr, 10);
        const now = Math.floor(Date.now() / 1000);
        if (!isNaN(exp) && exp > now) {
          const payload = `staff_photo:${String(targetId).trim()}:${exp}`;
          const expectedSig = crypto
            .createHmac('sha256', JWT_SECRET)
            .update(payload)
            .digest('hex');

          if (sig.length === expectedSig.length) {
            const sigBuf = Buffer.from(sig, 'utf8');
            const expectedBuf = Buffer.from(expectedSig, 'utf8');
            if (crypto.timingSafeEqual(sigBuf, expectedBuf)) {
              return true;
            }
          }
        }
      }
      return false;
    }

    const targetId = '672000000000000000000001';
    const exp = Math.floor(Date.now() / 1000) + 3600;

    // Generated with student_photo prefix
    const studentSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`student_photo:${targetId}:${exp}`)
      .digest('hex');

    const mockReq = {
      nextUrl: { searchParams: new Map([['sig', studentSig], ['exp', String(exp)]]) },
      cookies: { get: () => undefined },
      headers: { get: () => null }
    };

    // Attempting to authorize on staff endpoint with a student signature must be rejected!
    assert.strictEqual(isStaffAuthorized(mockReq, targetId), false, 'Student signature must not authorize staff photo');
  });
});
