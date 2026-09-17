const { describe, it } = require('node:test');
const assert = require('node:assert');
const { authorize } = require('../src/middleware/auth.middleware.js');

describe('Authorization Middleware', () => {
  it('should allow access for authorized roles', (t) => {
    const middleware = authorize('Super Admin', 'Admin');
    const req = { user: { role: 'Super Admin' } };
    const res = {};
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    
    middleware(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  it('should deny access for unauthorized roles with 403', (t) => {
    const middleware = authorize('Super Admin', 'Admin');
    const req = { user: { role: 'Student' } };
    let statusSet = 0;
    let jsonSent = null;
    const res = {
      status: (code) => { statusSet = code; return res; },
      json: (data) => { jsonSent = data; return res; }
    };
    const next = () => { assert.fail('Next should not be called'); };
    
    middleware(req, res, next);
    assert.strictEqual(statusSet, 403);
    assert.strictEqual(jsonSent.success, false);
  });
});
