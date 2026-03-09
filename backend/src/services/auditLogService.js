import auditLogRepository from '../data/auditLogRepository.js';

class AuditLogService {
  /**
   * Logs a user action into the audit system.
   * 
   * @param {Object} actor - The user performing the action (should have id and role)
   * @param {String} action - The action performed (e.g., 'create-admin', 'delete-opportunity')
   * @param {String} targetType - The type of object being acted on (e.g., 'USER', 'OPPORTUNITY')
   * @param {String|Number} targetId - The ID of the object being acted on
   * @param {Object} [metadata] - Optional additional details
   */
  async logAction(actor, action, targetType, targetId, metadata = {}) {
    try {
      if (!actor || !actor.id || !actor.role) {
        console.warn('AuditLogService: missing actor information. Log skipped.');
        return;
      }

      await auditLogRepository.create({
        actorUserId: actor.id,
        actorRole: actor.role,
        action,
        targetType,
        targetId,
        metadata
      });
    } catch (error) {
      console.error('AuditLogService: Error logging action', error);
      // Suppress throwing to avoid breaking the main business flow
    }
  }
}

export default new AuditLogService();
