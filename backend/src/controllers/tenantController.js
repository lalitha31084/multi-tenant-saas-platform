const pool = require('../config/db');

// @desc    Get Tenant Details
// @route   GET /api/tenants/:tenantId
const getTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Authorization: User must belong to tenant OR be super_admin
    if (req.user.role !== 'super_admin' && req.user.tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const tenantRes = await pool.query('SELECT * FROM tenants WHERE id = $1', [tenantId]);
    if (tenantRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Tenant not found' });

    // Get stats
    const statsRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) as total_users,
        (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) as total_projects,
        (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) as total_tasks
    `, [tenantId]);

    res.json({
      success: true,
      data: {
        ...tenantRes.rows[0],
        stats: {
          totalUsers: parseInt(statsRes.rows[0].total_users),
          totalProjects: parseInt(statsRes.rows[0].total_projects),
          totalTasks: parseInt(statsRes.rows[0].total_tasks)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    List All Tenants (Super Admin Only)
// @route   GET /api/tenants
const getAllTenants = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
    res.json({ success: true, data: { tenants: result.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Tenant
// @route   PUT /api/tenants/:tenantId
const updateTenant = async (req, res) => {
    const { tenantId } = req.params;
    const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;
    
    // Authorization check
    if (req.user.role !== 'super_admin' && req.user.tenant_id !== tenantId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Role Logic: Tenant Admin can ONLY update name
    if (req.user.role !== 'super_admin') {
        if (status || subscriptionPlan || maxUsers || maxProjects) {
            return res.status(403).json({ success: false, message: 'Tenant admins can only update the name' });
        }
    }

    try {
        // Dynamic query building to only update provided fields
        const updates = [];
        const values = [];
        let idx = 1;

        if (name) { updates.push(`name = $${idx++}`); values.push(name); }
        
        // Only super admin fields
        if (req.user.role === 'super_admin') {
            if (status) { updates.push(`status = $${idx++}`); values.push(status); }
            if (subscriptionPlan) { updates.push(`subscription_plan = $${idx++}`); values.push(subscriptionPlan); }
            if (maxUsers) { updates.push(`max_users = $${idx++}`); values.push(maxUsers); }
            if (maxProjects) { updates.push(`max_projects = $${idx++}`); values.push(maxProjects); }
        }

        values.push(tenantId); // The ID is the last param
        const query = `UPDATE tenants SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;

        const result = await pool.query(query, values);
        res.json({ success: true, data: result.rows[0] });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { getTenant, getAllTenants, updateTenant };