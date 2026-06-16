import applicationRepository from '../data/applicationRepository.js';
import opportunityRepository from '../data/opportunityRepository.js';
import notificationRepository from '../data/notificationRepository.js';

export const applyForOpportunity = async (req, res) => {
    try {
        const opportunityId = req.body.opportunityId;
        const userId = req.user.id;

        if (!opportunityId) {
            return res.status(400).json({ error: 'Opportunity ID is required' });
        }

        const opportunity = await opportunityRepository.getById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ error: 'Opportunity not found' });
        }

        const application = await applicationRepository.apply(userId, opportunityId);

        // Notify opportunity owner
        if (opportunity.createdByUserId !== userId) {
            await notificationRepository.createNotification({
                userId: opportunity.createdByUserId,
                title: 'New Application',
                message: `${req.user.name || 'Someone'} applied to your opportunity: ${opportunity.title}`,
                link: `/opportunities/${opportunityId}`
            });
        }

        res.status(201).json({ message: 'Applied successfully', application });
    } catch (err) {
        if (err.message === 'Already applied') {
            return res.status(400).json({ error: 'You have already applied for this opportunity' });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to apply' });
    }
};

export const checkApplicationStatus = async (req, res) => {
    try {
        const opportunityId = req.params.opportunityId;
        const userId = req.user.id;
        const application = await applicationRepository.checkApplication(userId, opportunityId);

        res.status(200).json({ applied: !!application, application });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to check application status' });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const applications = await applicationRepository.getByUserId(req.user.id);
        res.status(200).json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
};

export const getApplicationsForOpportunity = async (req, res) => {
    try {
        const opportunityId = req.params.opportunityId;
        const opportunity = await opportunityRepository.getById(opportunityId);

        if (!opportunity) {
            return res.status(404).json({ error: 'Opportunity not found' });
        }

        // Only owner or admin can view applicants
        if (opportunity.createdByUserId !== req.user.id && !['ADMIN', 'HEAD_ADMIN'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Cannot view applicants for this post' });
        }

        const applications = await applicationRepository.getByOpportunityId(opportunityId);
        res.status(200).json(applications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch applicants' });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const applicationId = req.params.applicationId;
        const { status } = req.body;

        if (!['PENDING', 'REVIEWED', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const application = await applicationRepository.getApplicationById(applicationId);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Must be owner or admin
        if (application.opportunity?.createdByUserId !== req.user.id && !['ADMIN', 'HEAD_ADMIN'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Cannot review this application' });
        }

        const updatedApp = await applicationRepository.updateStatus(applicationId, status);

        // Notify the applicant
        if (updatedApp.userId !== req.user.id) {
            await notificationRepository.createNotification({
                userId: updatedApp.userId,
                title: 'Application Update',
                message: `Your application status for ${application.opportunity?.title || 'an opportunity'} is now: ${status}`,
                link: `/opportunities/${application.opportunityId}`
            });
        }

        res.status(200).json({ message: 'Status updated', application: updatedApp });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update application status' });
    }
};
