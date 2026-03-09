import userRepository from '../data/userRepository.js';
import auditLogService from '../services/auditLogService.js';

export const getPendingAlumni = async (req, res) => {
  try {
    const pendingAlumni = await userRepository.getPendingAlumni();
    res.status(200).json(pendingAlumni);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending alumni' });
  }
};

export const approveAlumni = async (req, res) => {
  try {
    const alumniId = req.params.id;
    const user = await userRepository.getUserById(alumniId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'ALUMNI') {
      return res.status(400).json({ error: 'Can only approve ALUMNI accounts' });
    }

    const updatedUser = await userRepository.approveUser(alumniId);

    // Provide logging
    auditLogService.logAction(req.user, 'approve-alumni', 'USER', alumniId);

    res.status(200).json({ message: 'Alumni approved successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve alumni' });
  }
};
