import { describe, it, expect, beforeAll } from 'vitest';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-secret-key';

// Set env var BEFORE importing middleware (it throws if missing)
process.env.JWT_SECRET = TEST_SECRET;

// Dynamic import so env var is present at module-load time
const { requireAuth, requireRole } = await import('../src/middleware/authMiddleware.js');

// ---- Mock helpers ----

const mockReq = (overrides = {}) => ({ headers: {}, ...overrides });

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

const mockNext = () => {
  let called = false;
  const fn = () => { called = true; };
  fn.wasCalled = () => called;
  return fn;
};

// ---- Tests ----

describe('Middleware - requireAuth', () => {
  it('rejects requests without an Authorization header', () => {
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/no token/i);
    expect(next.wasCalled()).toBe(false);
  });

  it('rejects requests with a malformed Authorization header (no Bearer prefix)', () => {
    const req = mockReq({ headers: { authorization: 'Token abc123' } });
    const res = mockRes();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(next.wasCalled()).toBe(false);
  });

  it('rejects requests with an invalid/expired token', () => {
    const req = mockReq({ headers: { authorization: 'Bearer this.is.not.a.valid.jwt' } });
    const res = mockRes();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/invalid|expired/i);
    expect(next.wasCalled()).toBe(false);
  });

  it('allows requests with a valid token and sets req.user', () => {
    const payload = { id: 'u1', role: 'STUDENT', email: 's@students.liu.edu.lb' };
    const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    const next = mockNext();

    requireAuth(req, res, next);

    expect(next.wasCalled()).toBe(true);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('u1');
    expect(req.user.role).toBe('STUDENT');
  });
});

describe('Middleware - requireRole', () => {
  it('allows a user whose role is in the allowed list', () => {
    const middleware = requireRole('ADMIN', 'HEAD_ADMIN');
    const req = mockReq({ user: { id: 'u1', role: 'ADMIN' } });
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(next.wasCalled()).toBe(true);
  });

  it('rejects a user whose role is NOT in the allowed list', () => {
    const middleware = requireRole('ADMIN', 'HEAD_ADMIN');
    const req = mockReq({ user: { id: 'u2', role: 'STUDENT' } });
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toMatch(/forbidden/i);
    expect(next.wasCalled()).toBe(false);
  });

  it('rejects when req.user is missing entirely', () => {
    const middleware = requireRole('ADMIN');
    const req = mockReq();
    const res = mockRes();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(next.wasCalled()).toBe(false);
  });
});
