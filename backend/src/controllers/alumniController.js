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

export const getVerifiedAlumni = async (req, res) => {
  try {
    const alumni = await userRepository.getVerifiedAlumni();
    // In memory filter based on query params to make it easier to search
    let filteredAlumni = alumni;

    if (req.query.major) {
      filteredAlumni = filteredAlumni.filter(a => a.major && a.major.toLowerCase().includes(req.query.major.toLowerCase()));
    }
    if (req.query.graduationYear) {
      filteredAlumni = filteredAlumni.filter(a => a.graduationYear && a.graduationYear.toString() === req.query.graduationYear);
    }
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      filteredAlumni = filteredAlumni.filter(a => a.name.toLowerCase().includes(search));
    }

    res.status(200).json(filteredAlumni);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch verified alumni' });
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
export const rejectAlumni = async (req, res) => {
  try {
    const alumniId = req.params.id;
    const user = await userRepository.getUserById(alumniId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'ALUMNI') {
      return res.status(400).json({ error: 'Can only reject ALUMNI accounts' });
    }

    // Delete the pending user since they are rejected
    await userRepository.deleteUser(alumniId);

    // Provide logging
    auditLogService.logAction(req.user, 'reject-alumni', 'USER', alumniId);

    res.status(200).json({ message: 'Alumni request rejected successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject alumni' });
  }
};
