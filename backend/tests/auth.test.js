import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ---- helpers that mirror authController validation logic ----

const STUDENT_EMAIL_REGEX = /^(\d+)@students\.liu\.edu\.lb$/;

function validateStudentEmail(email) {
  const match = email.match(STUDENT_EMAIL_REGEX);
  return match ? { valid: true, universityId: match[1] } : { valid: false };
}

function validateAlumniFields({ name, fatherName, email, password, graduationYear, universityId }) {
  if (!name || !fatherName || !email || !password || !graduationYear || !universityId) {
    return { valid: false, error: 'Name, Father Name, University ID, email, password, and graduationYear are required' };
  }
  return { valid: true };
}

// ---- tests ----

describe('Auth - Student email validation', () => {
  it('accepts a valid @students.liu.edu.lb email', () => {
    const result = validateStudentEmail('12345678@students.liu.edu.lb');
    expect(result.valid).toBe(true);
    expect(result.universityId).toBe('12345678');
  });

  it('accepts a short numeric ID email', () => {
    const result = validateStudentEmail('1@students.liu.edu.lb');
    expect(result.valid).toBe(true);
    expect(result.universityId).toBe('1');
  });

  it('rejects an email with wrong domain', () => {
    const result = validateStudentEmail('12345678@gmail.com');
    expect(result.valid).toBe(false);
  });

  it('rejects an email with letters before @', () => {
    const result = validateStudentEmail('john@students.liu.edu.lb');
    expect(result.valid).toBe(false);
  });

  it('rejects an email missing the students subdomain', () => {
    const result = validateStudentEmail('12345678@liu.edu.lb');
    expect(result.valid).toBe(false);
  });

  it('rejects an empty string', () => {
    const result = validateStudentEmail('');
    expect(result.valid).toBe(false);
  });
});

describe('Auth - Alumni registration validation', () => {
  it('requires graduation year', () => {
    const result = validateAlumniFields({
      name: 'Ali',
      fatherName: 'Ahmad',
      email: 'ali@example.com',
      password: 'secret123',
      graduationYear: undefined,
      universityId: '99999',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('graduationYear');
  });

  it('passes when all required fields are present', () => {
    const result = validateAlumniFields({
      name: 'Ali',
      fatherName: 'Ahmad',
      email: 'ali@example.com',
      password: 'secret123',
      graduationYear: 2023,
      universityId: '99999',
    });
    expect(result.valid).toBe(true);
  });
});

describe('Auth - Password hashing', () => {
  it('produces a hash different from the raw password', async () => {
    const raw = 'mySecretPassword123';
    const hash = await bcrypt.hash(raw, 10);
    expect(hash).not.toBe(raw);
    expect(hash.length).toBeGreaterThan(0);
  });

  it('bcrypt.compare verifies the correct password', async () => {
    const raw = 'testPass!';
    const hash = await bcrypt.hash(raw, 10);
    const isMatch = await bcrypt.compare(raw, hash);
    expect(isMatch).toBe(true);
  });
});

describe('Auth - JWT token payload', () => {
  const secret = 'unit-test-secret';

  it('contains id, role, and email fields', () => {
    const payload = { id: 'user-1', role: 'STUDENT', email: 'stu@students.liu.edu.lb', needsPasswordChange: false };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
    const decoded = jwt.verify(token, secret);

    expect(decoded).toHaveProperty('id', 'user-1');
    expect(decoded).toHaveProperty('role', 'STUDENT');
    expect(decoded).toHaveProperty('email', 'stu@students.liu.edu.lb');
  });

  it('includes needsPasswordChange flag', () => {
    const payload = { id: 'user-2', role: 'ALUMNI', email: 'a@b.com', needsPasswordChange: true };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
    const decoded = jwt.verify(token, secret);

    expect(decoded.needsPasswordChange).toBe(true);
  });

  it('includes iat and exp claims', () => {
    const payload = { id: 'user-3', role: 'ADMIN', email: 'admin@liu.edu' };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });
    const decoded = jwt.verify(token, secret);

    expect(decoded).toHaveProperty('iat');
    expect(decoded).toHaveProperty('exp');
    expect(decoded.exp - decoded.iat).toBe(86400); // 1 day in seconds
  });
});
