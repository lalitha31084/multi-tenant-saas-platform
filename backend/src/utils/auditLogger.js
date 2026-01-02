const pool = require('../config/db');

const logAudit = async (tenantId, userId, action, entityType, entityId, ipAddress = null) => {
  try {
    const query = `
      INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(query, [tenantId, userId, action, entityType, entityId, ipAddress]);
  } catch (error) {
    console.error('Audit Log Error:', error);
    // Don't block main execution if logging fails
  }
};

module.exports = logAudit;