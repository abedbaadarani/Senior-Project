import { supabase } from '../config/supabase.js';
import userRepository from '../data/userRepository.js';
import opportunityRepository from '../data/opportunityRepository.js';
import applicationRepository from '../data/applicationRepository.js';
import recommendationRepository from '../data/recommendationRepository.js';
import bookmarkRepository from '../data/bookmarkRepository.js';
import messageRepository from '../data/messageRepository.js';
import auditLogRepository from '../data/auditLogRepository.js';

// ── STUDENT STATS ───────────────────────────────────────────────────────────
export const getStudentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userRepository.getUserById(userId);

    const [applications, bookmarks, recommendations, unreadCount] = await Promise.all([
      applicationRepository.getByUserId(userId),
      bookmarkRepository.getBookmarksByUser(userId),
      recommendationRepository.getByStudentId(userId),
      messageRepository.getUnreadCount(userId),
    ]);

    // Application status breakdown
    const applicationsByStatus = applications.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    // Profile completion
    let profileCompletion = 25;
    if (user?.major) profileCompletion += 25;
    if (user?.cvUrl) profileCompletion += 25;
    if (user?.linkedinUrl) profileCompletion += 25;

    // Upcoming deadlines — bookmarked opps with deadline within 7 days
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = bookmarks
      .filter(b => b.deadline && new Date(b.deadline) > now && new Date(b.deadline) <= sevenDaysLater)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5)
      .map(b => ({ id: b.id, title: b.title, company: b.company, deadline: b.deadline }));

    // Recommended for you — match student's major against opportunity description/title
    let recommendedOpportunities = [];
    if (user?.major) {
      const allOpps = await opportunityRepository.getAll();
      const appliedIds = new Set(applications.map(a => a.opportunityId));
      const majorLower = user.major.toLowerCase();
      recommendedOpportunities = allOpps
        .filter(o => {
          if (appliedIds.has(o.id)) return false;
          if (o.deadline && new Date(o.deadline) < now) return false;
          const text = `${o.title} ${o.description} ${o.company}`.toLowerCase();
          return text.includes(majorLower);
        })
        .slice(0, 5)
        .map(o => ({ id: o.id, title: o.title, company: o.company, type: o.type, mode: o.mode, deadline: o.deadline }));
    }

    res.json({
      applicationCount: applications.length,
      bookmarkCount: bookmarks.length,
      recommendationCount: recommendations.length,
      profileCompletion,
      unreadMessages: unreadCount,
      applicationsByStatus,
      upcomingDeadlines,
      recommendedOpportunities,
      applications: applications.slice(0, 10).map(a => ({
        id: a.id,
        status: a.status,
        createdAt: a.createdAt,
        opportunity: a.opportunity ? { id: a.opportunity.id, title: a.opportunity.title, company: a.opportunity.company } : null,
      })),
      recommendations: recommendations.slice(0, 5).map(r => ({
        id: r.id,
        message: r.message,
        instructor: r.instructor,
        opportunity: r.opportunity,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error('Student stats error:', error);
    res.status(500).json({ error: 'Failed to fetch student stats' });
  }
};

// ── ALUMNI STATS ────────────────────────────────────────────────────────────
export const getAlumniStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [myOpps, bookmarks, recommendations, unreadCount] = await Promise.all([
      opportunityRepository.getByUserId(userId),
      bookmarkRepository.getBookmarksByUser(userId),
      recommendationRepository.getByStudentId(userId),
      messageRepository.getUnreadCount(userId),
    ]);

    // Get applications for all my opportunities
    const oppIds = myOpps.map(o => o.id);
    let allApplications = [];
    if (oppIds.length > 0) {
      const results = await Promise.all(oppIds.map(id => applicationRepository.getByOpportunityId(id)));
      allApplications = results.flat();
    }

    // Application status breakdown per opportunity
    const applicationsByStatus = allApplications.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    // Per-opportunity breakdown for charts
    const opportunitiesWithCounts = myOpps.map(opp => {
      const oppApps = allApplications.filter(a => a.opportunityId === opp.id);
      return {
        id: opp.id,
        title: opp.title,
        company: opp.company,
        type: opp.type,
        mode: opp.mode,
        applicationCount: oppApps.length,
        statusBreakdown: oppApps.reduce((acc, a) => {
          acc[a.status] = (acc[a.status] || 0) + 1;
          return acc;
        }, {}),
      };
    });

    // Recent applicants
    const recentApplicants = allApplications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(a => ({
        applicantName: a.user?.name || 'Unknown',
        applicantEmail: a.user?.email || '',
        opportunityTitle: myOpps.find(o => o.id === a.opportunityId)?.title || '',
        status: a.status,
        appliedAt: a.createdAt,
      }));

    res.json({
      myPostsCount: myOpps.length,
      totalApplicationsReceived: allApplications.length,
      bookmarkCount: bookmarks.length,
      recommendationsReceived: recommendations.length,
      unreadMessages: unreadCount,
      applicationsByStatus,
      opportunitiesWithCounts,
      recentApplicants,
    });
  } catch (error) {
    console.error('Alumni stats error:', error);
    res.status(500).json({ error: 'Failed to fetch alumni stats' });
  }
};

// ── INSTRUCTOR STATS ────────────────────────────────────────────────────────
export const getInstructorStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [myOpps, pendingAlumni, recommendations, unreadCount] = await Promise.all([
      opportunityRepository.getByUserId(userId),
      userRepository.getPendingAlumni(),
      recommendationRepository.getByInstructorId(userId),
      messageRepository.getUnreadCount(userId),
    ]);

    // Total applications across all posts
    const oppIds = myOpps.map(o => o.id);
    let allApplications = [];
    if (oppIds.length > 0) {
      const results = await Promise.all(oppIds.map(id => applicationRepository.getByOpportunityId(id)));
      allApplications = results.flat();
    }

    // Recommendation impact — how many recommended students got accepted
    let recommendationImpact = { total: recommendations.length, accepted: 0 };
    if (recommendations.length > 0) {
      for (const rec of recommendations) {
        if (rec.studentId && rec.opportunityId) {
          const app = await applicationRepository.checkApplication(rec.studentId, rec.opportunityId);
          if (app && app.status === 'ACCEPTED') {
            recommendationImpact.accepted++;
          }
        }
      }
    }

    // Expiring opportunities — deadline within 7 days
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const expiringOpportunities = myOpps
      .filter(o => o.deadline && new Date(o.deadline) > now && new Date(o.deadline) <= sevenDaysLater)
      .map(o => ({ id: o.id, title: o.title, company: o.company, deadline: o.deadline }));

    // Per-opportunity application counts
    const opportunitiesWithCounts = myOpps.map(opp => ({
      id: opp.id,
      title: opp.title,
      company: opp.company,
      type: opp.type,
      applicationCount: allApplications.filter(a => a.opportunityId === opp.id).length,
    }));

    // New this week counts
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newAppsThisWeek = allApplications.filter(a => new Date(a.createdAt) >= oneWeekAgo).length;
    const newRecsThisWeek = recommendations.filter(r => new Date(r.createdAt) >= oneWeekAgo).length;

    res.json({
      myPostsCount: myOpps.length,
      totalApplications: allApplications.length,
      pendingAlumniCount: pendingAlumni.length,
      recommendationCount: recommendations.length,
      recommendationImpact,
      unreadMessages: unreadCount,
      expiringOpportunities,
      opportunitiesWithCounts,
      pendingAlumni: pendingAlumni.slice(0, 5).map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        graduationYear: a.graduationYear,
        createdAt: a.createdAt,
      })),
      trends: {
        newAppsThisWeek,
        newRecsThisWeek,
      },
    });
  } catch (error) {
    console.error('Instructor stats error:', error);
    res.status(500).json({ error: 'Failed to fetch instructor stats' });
  }
};

// ── ADMIN STATS ─────────────────────────────────────────────────────────────
export const getAdminStats = async (req, res) => {
  try {
    const [users, opportunities, pendingAlumni, unreadCount] = await Promise.all([
      userRepository.getAllUsers(),
      opportunityRepository.getAll(),
      userRepository.getPendingAlumni(),
      messageRepository.getUnreadCount(req.user.id),
    ]);

    // Users by role
    const usersByRole = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    // Opportunity health
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const active = opportunities.filter(o => !o.deadline || new Date(o.deadline) >= now).length;
    const expired = opportunities.filter(o => o.deadline && new Date(o.deadline) < now).length;
    const closingSoon = opportunities.filter(o => o.deadline && new Date(o.deadline) >= now && new Date(o.deadline) <= sevenDaysLater).length;

    // Application funnel
    const { data: allApps, error: appError } = await supabase
      .from('applications')
      .select('status');
    const appFunnel = { total: 0, reviewed: 0, accepted: 0 };
    if (!appError && allApps) {
      appFunnel.total = allApps.length;
      appFunnel.reviewed = allApps.filter(a => a.status !== 'PENDING').length;
      appFunnel.accepted = allApps.filter(a => a.status === 'ACCEPTED').length;
    }

    // Top opportunity
    const { data: topOppData } = await supabase
      .from('applications')
      .select('opportunity_id')
      .order('created_at', { ascending: false });
    let topOpportunity = null;
    if (topOppData && topOppData.length > 0) {
      const counts = topOppData.reduce((acc, a) => {
        acc[a.opportunity_id] = (acc[a.opportunity_id] || 0) + 1;
        return acc;
      }, {});
      const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (topId) {
        const opp = opportunities.find(o => o.id === topId[0]);
        if (opp) {
          topOpportunity = { id: opp.id, title: opp.title, company: opp.company, applicationCount: topId[1] };
        }
      }
    }

    // Recent audit logs
    const auditResult = await auditLogRepository.getPaginated(1, 5);

    // User growth by month
    const userGrowthByMonth = users.reduce((acc, u) => {
      if (u.createdAt) {
        const d = new Date(u.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});
    const growthData = Object.entries(userGrowthByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([month, count]) => ({ month, count }));

    // Recently joined users
    const recentUsers = [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));

    res.json({
      totalUsers: users.length,
      usersByRole,
      pendingAlumniCount: pendingAlumni.length,
      opportunityHealth: { active, expired, closingSoon, total: opportunities.length },
      applicationFunnel: appFunnel,
      topOpportunity,
      recentAuditLogs: auditResult.data || [],
      userGrowthByMonth: growthData,
      recentUsers,
      unreadMessages: unreadCount,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

// ── HEAD ADMIN STATS ────────────────────────────────────────────────────────
export const getHeadAdminStats = async (req, res) => {
  try {
    const [users, opportunities, pendingAlumni, unreadCount] = await Promise.all([
      userRepository.getAllUsers(),
      opportunityRepository.getAll(),
      userRepository.getPendingAlumni(),
      messageRepository.getUnreadCount(req.user.id),
    ]);

    // Users by role
    const usersByRole = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    // Opportunity health
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const active = opportunities.filter(o => !o.deadline || new Date(o.deadline) >= now).length;
    const expired = opportunities.filter(o => o.deadline && new Date(o.deadline) < now).length;
    const closingSoon = opportunities.filter(o => o.deadline && new Date(o.deadline) >= now && new Date(o.deadline) <= sevenDaysLater).length;

    // Application funnel
    const { data: allApps, error: appError } = await supabase
      .from('applications')
      .select('status, created_at');
    const appFunnel = { total: 0, reviewed: 0, accepted: 0 };
    if (!appError && allApps) {
      appFunnel.total = allApps.length;
      appFunnel.reviewed = allApps.filter(a => a.status !== 'PENDING').length;
      appFunnel.accepted = allApps.filter(a => a.status === 'ACCEPTED').length;
    }

    // Top opportunity
    const { data: topOppData } = await supabase
      .from('applications')
      .select('opportunity_id');
    let topOpportunity = null;
    if (topOppData && topOppData.length > 0) {
      const counts = topOppData.reduce((acc, a) => {
        acc[a.opportunity_id] = (acc[a.opportunity_id] || 0) + 1;
        return acc;
      }, {});
      const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (topId) {
        const opp = opportunities.find(o => o.id === topId[0]);
        if (opp) {
          topOpportunity = { id: opp.id, title: opp.title, company: opp.company, applicationCount: topId[1] };
        }
      }
    }

    // Recent audit logs
    const auditResult = await auditLogRepository.getPaginated(1, 5);

    // User growth by month
    const userGrowthByMonth = users.reduce((acc, u) => {
      if (u.createdAt) {
        const d = new Date(u.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});
    const growthData = Object.entries(userGrowthByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([month, count]) => ({ month, count }));

    // Recently joined users
    const recentUsers = [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
      .map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));

    // Top contributors — instructors/alumni who posted the most opportunities
    const creatorCounts = opportunities.reduce((acc, o) => {
      acc[o.createdByUserId] = (acc[o.createdByUserId] || 0) + 1;
      return acc;
    }, {});
    const topContributors = Object.entries(creatorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, postsCount]) => {
        const u = users.find(u => u.id === userId);
        return { userId, name: u?.name || 'Unknown', role: u?.role || '', postsCount };
      });

    // Platform health score (0-100)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = allApps ? allApps.filter(a => new Date(a.created_at) >= oneWeekAgo).length : 0;
    const userGrowthPositive = growthData.length >= 2 && growthData[growthData.length - 1].count >= growthData[growthData.length - 2].count;
    let platformHealthScore = 0;
    platformHealthScore += active > 0 ? 20 : 0;
    platformHealthScore += pendingAlumni.length < 5 ? 20 : 10;
    platformHealthScore += recentActivity > 0 ? 20 : 0;
    platformHealthScore += userGrowthPositive ? 20 : 10;
    platformHealthScore += appFunnel.total > 0 ? 20 : 10;

    // System alerts
    const systemAlerts = [];
    if (pendingAlumni.length > 0) {
      systemAlerts.push({ type: 'warning', message: `${pendingAlumni.length} alumni pending approval`, link: '/alumni-approval' });
    }
    if (closingSoon > 0) {
      systemAlerts.push({ type: 'info', message: `${closingSoon} opportunities expiring within 7 days`, link: '/opportunities' });
    }
    const needsPasswordChange = users.filter(u => u.needsPasswordChange).length;
    if (needsPasswordChange > 0) {
      systemAlerts.push({ type: 'warning', message: `${needsPasswordChange} users need to change their password`, link: null });
    }

    res.json({
      totalUsers: users.length,
      usersByRole,
      pendingAlumniCount: pendingAlumni.length,
      opportunityHealth: { active, expired, closingSoon, total: opportunities.length },
      opportunityPipeline: { active, expiring: closingSoon, expired },
      applicationFunnel: appFunnel,
      topOpportunity,
      recentAuditLogs: auditResult.data || [],
      userGrowthByMonth: growthData,
      recentUsers,
      topContributors,
      platformHealthScore,
      systemAlerts,
      unreadMessages: unreadCount,
    });
  } catch (error) {
    console.error('Head admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch head admin stats' });
  }
};
