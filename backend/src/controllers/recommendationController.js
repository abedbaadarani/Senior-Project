import recommendationRepository from '../data/recommendationRepository.js';
import userRepository from '../data/userRepository.js';
import opportunityRepository from '../data/opportunityRepository.js';
import auditLogService from '../services/auditLogService.js';

export const createRecommendation = async (req, res) => {
  try {
    const { studentId, opportunityId, message } = req.body;

    if (!studentId || !opportunityId || !message) {
      return res.status(400).json({ error: 'studentId, opportunityId, and message are required' });
    }

    // Verify student exists and has role STUDENT or ALUMNI
    const student = await userRepository.getUserById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    if (student.role !== 'STUDENT' && student.role !== 'ALUMNI') {
      return res.status(400).json({ error: 'Candidate must be a STUDENT or ALUMNI' });
    }

    // Verify opportunity exists
    const opportunity = await opportunityRepository.getById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const recommendation = await recommendationRepository.create({
      instructorId: req.user.id,
      studentId: parseInt(studentId, 10),
      opportunityId: parseInt(opportunityId, 10),
      message,
    });

    auditLogService.logAction(req.user, 'create-recommendation', 'RECOMMENDATION', recommendation.id, {
      studentId,
      opportunityId
    });

    res.status(201).json({ message: 'Recommendation created successfully', recommendation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create recommendation' });
  }
};

export const getMyRecommendationsAsInstructor = async (req, res) => {
  try {
    const recommendations = await recommendationRepository.getByInstructorId(req.user.id);
    res.status(200).json(recommendations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

export const getMyRecommendationsAsStudent = async (req, res) => {
  try {
    const recommendations = await recommendationRepository.getByStudentId(req.user.id);
    res.status(200).json(recommendations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};

export const getAllRecommendations = async (req, res) => {
  try {
    const recommendations = await recommendationRepository.getAll();
    res.status(200).json(recommendations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};
