import opportunityRepository from '../data/opportunityRepository.js';
import bookmarkRepository from '../data/bookmarkRepository.js';
import auditLogService from '../services/auditLogService.js';

export const createOpportunity = async (req, res) => {
  try {
    const { title, company, type, location, mode, description, requirements, deadline } = req.body;

    if (!title || !company || !type || !location || !mode || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['JOB', 'INTERNSHIP'].includes(type)) {
      return res.status(400).json({ error: 'Type must be JOB or INTERNSHIP' });
    }

    if (!['ONSITE', 'REMOTE', 'HYBRID'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be ONSITE, REMOTE, or HYBRID' });
    }

    const opportunity = await opportunityRepository.create({
      title,
      company,
      type,
      location,
      mode,
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      deadline: deadline || null,
      createdByUserId: req.user.id,
      createdByRole: req.user.role,
    });

    auditLogService.logAction(req.user, 'create-opportunity', 'OPPORTUNITY', opportunity.id, { title });

    res.status(201).json({ message: 'Opportunity created successfully', opportunity });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
};

export const getOpportunities = async (req, res) => {
  try {
    let opportunities = await opportunityRepository.getAll();
    const { search, type, location, mode } = req.query;

    if (search) {
      const lowerSearch = search.toLowerCase();
      opportunities = opportunities.filter((op) =>
        op.title.toLowerCase().includes(lowerSearch) ||
        op.company.toLowerCase().includes(lowerSearch) ||
        op.description.toLowerCase().includes(lowerSearch)
      );
    }

    if (type) {
      opportunities = opportunities.filter((op) => op.type === type.toUpperCase());
    }

    if (location) {
      const lowerLoc = location.toLowerCase();
      opportunities = opportunities.filter((op) => op.location.toLowerCase().includes(lowerLoc));
    }

    if (mode) {
      opportunities = opportunities.filter((op) => op.mode === mode.toUpperCase());
    }

    res.status(200).json(opportunities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
};

export const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await opportunityRepository.getById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.status(200).json(opportunity);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
};

export const getMyOpportunities = async (req, res) => {
  try {
    const opportunities = await opportunityRepository.getByUserId(req.user.id);
    res.status(200).json(opportunities);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your opportunities' });
  }
};

export const updateOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const opportunity = await opportunityRepository.getById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (opportunity.createdByUserId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own posts' });
    }

    const updates = req.body;
    // Prevent editing internal fields
    delete updates.id;
    delete updates.createdByUserId;
    delete updates.createdByRole;
    delete updates.createdAt;

    if (updates.type && !['JOB', 'INTERNSHIP'].includes(updates.type)) {
      return res.status(400).json({ error: 'Type must be JOB or INTERNSHIP' });
    }
    if (updates.mode && !['ONSITE', 'REMOTE', 'HYBRID'].includes(updates.mode)) {
      return res.status(400).json({ error: 'Mode must be ONSITE, REMOTE, or HYBRID' });
    }

    const updated = await opportunityRepository.update(opportunityId, updates);
    res.status(200).json({ message: 'Opportunity updated successfully', opportunity: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
};

export const deleteOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const opportunity = await opportunityRepository.getById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const isOwner = opportunity.createdByUserId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'HEAD_ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete this post' });
    }

    await opportunityRepository.delete(opportunityId);

    auditLogService.logAction(req.user, 'delete-opportunity', 'OPPORTUNITY', opportunityId);

    res.status(200).json({ message: 'Opportunity deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const userId = req.user.id;

    const isBookmarked = await bookmarkRepository.checkBookmark(userId, opportunityId);

    if (isBookmarked) {
      await bookmarkRepository.removeBookmark(userId, opportunityId);
      res.status(200).json({ message: 'Bookmark removed', bookmarked: false });
    } else {
      await bookmarkRepository.addBookmark(userId, opportunityId);
      res.status(200).json({ message: 'Opportunity bookmarked', bookmarked: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await bookmarkRepository.getBookmarksByUser(req.user.id);
    res.status(200).json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};
