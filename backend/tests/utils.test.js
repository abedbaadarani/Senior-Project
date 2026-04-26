import { describe, it, expect } from 'vitest';

// ---- Pure logic extracted from dashboard / opportunity controllers ----

/**
 * Classify an opportunity's deadline status.
 * Mirrors the opportunityHealth logic in getAdminStats / getHeadAdminStats.
 */
function classifyDeadline(deadline, now = new Date()) {
  if (!deadline) return 'active'; // no deadline means always active
  const d = new Date(deadline);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  if (d < now) return 'expired';
  if (d <= sevenDaysLater) return 'closing_soon';
  return 'active';
}

/**
 * Aggregate users by role.
 * Mirrors the usersByRole reduce in getAdminStats / getHeadAdminStats.
 */
function aggregateRoleCounts(users) {
  return users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Compute the application funnel (total / reviewed / accepted).
 * Mirrors the appFunnel logic in getAdminStats / getHeadAdminStats.
 */
function computeApplicationFunnel(applications) {
  const funnel = { total: 0, reviewed: 0, accepted: 0 };
  funnel.total = applications.length;
  funnel.reviewed = applications.filter(a => a.status !== 'PENDING').length;
  funnel.accepted = applications.filter(a => a.status === 'ACCEPTED').length;
  return funnel;
}

// ---- Tests ----

describe('Utils - Opportunity deadline classification', () => {
  const now = new Date('2026-04-26T12:00:00Z');

  it('marks a past deadline as expired', () => {
    expect(classifyDeadline('2026-04-20T00:00:00Z', now)).toBe('expired');
  });

  it('marks a deadline within 7 days as closing_soon', () => {
    expect(classifyDeadline('2026-04-30T00:00:00Z', now)).toBe('closing_soon');
  });

  it('marks a deadline more than 7 days out as active', () => {
    expect(classifyDeadline('2026-06-01T00:00:00Z', now)).toBe('active');
  });

  it('marks an opportunity with no deadline as active', () => {
    expect(classifyDeadline(null, now)).toBe('active');
    expect(classifyDeadline(undefined, now)).toBe('active');
  });
});

describe('Utils - Role count aggregation', () => {
  it('counts each role correctly', () => {
    const users = [
      { role: 'STUDENT' },
      { role: 'STUDENT' },
      { role: 'ALUMNI' },
      { role: 'INSTRUCTOR' },
      { role: 'ADMIN' },
      { role: 'HEAD_ADMIN' },
      { role: 'STUDENT' },
    ];
    const counts = aggregateRoleCounts(users);
    expect(counts).toEqual({
      STUDENT: 3,
      ALUMNI: 1,
      INSTRUCTOR: 1,
      ADMIN: 1,
      HEAD_ADMIN: 1,
    });
  });

  it('returns empty object for no users', () => {
    expect(aggregateRoleCounts([])).toEqual({});
  });
});

describe('Utils - Application funnel computation', () => {
  it('computes total, reviewed, and accepted counts', () => {
    const apps = [
      { status: 'PENDING' },
      { status: 'ACCEPTED' },
      { status: 'REJECTED' },
      { status: 'PENDING' },
      { status: 'ACCEPTED' },
    ];
    const funnel = computeApplicationFunnel(apps);
    expect(funnel.total).toBe(5);
    expect(funnel.reviewed).toBe(3); // ACCEPTED + REJECTED (everything not PENDING)
    expect(funnel.accepted).toBe(2);
  });

  it('returns all zeros for empty applications', () => {
    const funnel = computeApplicationFunnel([]);
    expect(funnel).toEqual({ total: 0, reviewed: 0, accepted: 0 });
  });

  it('reviewed is 0 when all applications are PENDING', () => {
    const apps = [{ status: 'PENDING' }, { status: 'PENDING' }];
    const funnel = computeApplicationFunnel(apps);
    expect(funnel.total).toBe(2);
    expect(funnel.reviewed).toBe(0);
    expect(funnel.accepted).toBe(0);
  });
});
