import { describe, it, expect } from 'vitest';

// ---- Pure logic extracted from dashboardController.js ----

/**
 * Profile completion: starts at 25, +25 per filled field (major, cvUrl, linkedinUrl).
 * Mirrors getStudentStats logic.
 */
function computeProfileCompletion(user) {
  let completion = 25;
  if (user?.major) completion += 25;
  if (user?.cvUrl) completion += 25;
  if (user?.linkedinUrl) completion += 25;
  return completion;
}

/**
 * Platform health score (0-100).
 * Mirrors getHeadAdminStats logic.
 */
function computePlatformHealthScore({
  activeOpportunities,
  pendingAlumniCount,
  recentActivityCount,
  userGrowthPositive,
  totalApplications,
}) {
  let score = 0;
  score += activeOpportunities > 0 ? 20 : 0;
  score += pendingAlumniCount < 5 ? 20 : 10;
  score += recentActivityCount > 0 ? 20 : 0;
  score += userGrowthPositive ? 20 : 10;
  score += totalApplications > 0 ? 20 : 10;
  return score;
}

/**
 * Status breakdown aggregation.
 * Mirrors the reduce pattern used in multiple dashboard endpoints.
 */
function aggregateByStatus(applications) {
  return applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
}

// ---- Tests ----

describe('Dashboard - Profile completion', () => {
  it('returns 25 when no optional fields are filled', () => {
    expect(computeProfileCompletion({})).toBe(25);
  });

  it('returns 50 when only major is set', () => {
    expect(computeProfileCompletion({ major: 'CS' })).toBe(50);
  });

  it('returns 75 when major and cvUrl are set', () => {
    expect(computeProfileCompletion({ major: 'CS', cvUrl: 'https://example.com/cv.pdf' })).toBe(75);
  });

  it('returns 100 when all three fields are set', () => {
    expect(computeProfileCompletion({ major: 'CS', cvUrl: 'https://cv.pdf', linkedinUrl: 'https://linkedin.com/in/x' })).toBe(100);
  });

  it('handles null user gracefully (returns 25)', () => {
    expect(computeProfileCompletion(null)).toBe(25);
  });
});

describe('Dashboard - Platform health score', () => {
  it('returns 100 when all conditions are positive', () => {
    const score = computePlatformHealthScore({
      activeOpportunities: 5,
      pendingAlumniCount: 2,
      recentActivityCount: 10,
      userGrowthPositive: true,
      totalApplications: 50,
    });
    expect(score).toBe(100);
  });

  it('returns the minimum score (30) when all conditions are negative', () => {
    const score = computePlatformHealthScore({
      activeOpportunities: 0,
      pendingAlumniCount: 10,
      recentActivityCount: 0,
      userGrowthPositive: false,
      totalApplications: 0,
    });
    // 0 + 10 + 0 + 10 + 10 = 30
    expect(score).toBe(30);
  });

  it('score is always between 0 and 100', () => {
    const inputs = [
      { activeOpportunities: 0, pendingAlumniCount: 100, recentActivityCount: 0, userGrowthPositive: false, totalApplications: 0 },
      { activeOpportunities: 99, pendingAlumniCount: 0, recentActivityCount: 99, userGrowthPositive: true, totalApplications: 99 },
    ];
    for (const input of inputs) {
      const score = computePlatformHealthScore(input);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });
});

describe('Dashboard - Status breakdown aggregation', () => {
  it('counts statuses correctly', () => {
    const apps = [
      { status: 'PENDING' },
      { status: 'ACCEPTED' },
      { status: 'PENDING' },
      { status: 'REJECTED' },
      { status: 'ACCEPTED' },
      { status: 'ACCEPTED' },
    ];
    const result = aggregateByStatus(apps);
    expect(result).toEqual({ PENDING: 2, ACCEPTED: 3, REJECTED: 1 });
  });

  it('returns empty object for empty array', () => {
    expect(aggregateByStatus([])).toEqual({});
  });

  it('handles a single status', () => {
    const result = aggregateByStatus([{ status: 'PENDING' }]);
    expect(result).toEqual({ PENDING: 1 });
  });
});
