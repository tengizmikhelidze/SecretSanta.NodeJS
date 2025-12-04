const { query } = require('../config/database');
const logger = require('../utils/logger');

class AuditService {
  /**
   * Log audit trail
   */
  async log(auditData) {
    const { userId, entityType, entityId, action, changes } = auditData;

    try {
      const sql = `
        INSERT INTO audit_logs (user_id, entity_type, entity_id, action, changes)
        VALUES (?, ?, ?, ?, ?)
      `;

      await query(sql, [
        userId || null,
        entityType,
        entityId,
        action,
        JSON.stringify(changes || {})
      ]);

      logger.info('Audit log created', { userId, entityType, entityId, action });
    } catch (error) {
      logger.error('Failed to create audit log:', error);
      // Don't throw error, audit failure shouldn't break the main operation
    }
  }

  /**
   * Get audit logs for entity
   */
  async getEntityLogs(entityType, entityId) {
    const sql = `
      SELECT a.*, u.email as user_email, u.full_name as user_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.entity_type = ? AND a.entity_id = ?
      ORDER BY a.created_at DESC
    `;

    return await query(sql, [entityType, entityId]);
  }

  /**
   * Get user's audit logs
   */
  async getUserLogs(userId, limit = 50) {
    const sql = `
      SELECT * FROM audit_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    return await query(sql, [userId, limit]);
  }
}

module.exports = new AuditService();

