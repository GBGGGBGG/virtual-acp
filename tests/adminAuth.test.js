const test = require('node:test');
const assert = require('node:assert/strict');
const { adminAuth, getProvidedToken, timingSafeEqualString } = require('../src/middleware/adminAuth');

function mkRes() {
  return {
    code: 200,
    body: null,
    status(c) { this.code = c; return this; },
    json(v) { this.body = v; return this; },
  };
}

test('getProvidedToken prefers x-gatex-admin-token header', () => {
  const req = { headers: { 'x-gatex-admin-token': 'abc', authorization: 'Bearer xyz' } };
  assert.equal(getProvidedToken(req), 'abc');
});

test('getProvidedToken supports Authorization Bearer', () => {
  const req = { headers: { authorization: 'Bearer xyz' } };
  assert.equal(getProvidedToken(req), 'xyz');
});

test('timingSafeEqualString returns true only for exact match', () => {
  assert.equal(timingSafeEqualString('token', 'token'), true);
  assert.equal(timingSafeEqualString('token', 'token2'), false);
  assert.equal(timingSafeEqualString('token', 'tok'), false);
});

test('adminAuth denies when token mismatched', () => {
  process.env.GATEX_ADMIN_TOKEN = 'secret';
  const req = { headers: { authorization: 'Bearer wrong' } };
  const res = mkRes();
  let called = false;

  adminAuth(req, res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.code, 401);
  assert.deepEqual(res.body, { error: 'unauthorized' });
});

test('adminAuth allows when token matched via bearer', () => {
  process.env.GATEX_ADMIN_TOKEN = 'secret';
  const req = { headers: { authorization: 'Bearer secret' } };
  const res = mkRes();
  let called = false;

  adminAuth(req, res, () => { called = true; });
  assert.equal(called, true);
  assert.equal(res.code, 200);
});
