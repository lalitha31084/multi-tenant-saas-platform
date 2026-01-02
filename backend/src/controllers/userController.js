const bcrypt = require('bcrypt');
const pool = require('../config/db');
const logAudit = require('../utils/auditLogger');

// @desc    Add User to Tenant
// @route   POST /api/tenants/:tenantId/users
const addUser = async (req, res) => {
  const { email, password, fullName, role } = req.body;
  const { tenantId } = req.params;
  
  // FIX: Allow 'super_admin' to bypass the tenant check
  if (req.user.role !== 'super_admin' && req.user.tenant_id !== tenantId) {
    return res.status(403).json({ success: false, message: 'Cannot add users to other tenants' });
  }

  try {
    // 1. Check Limits
    const limitCheck = await pool.query('SELECT max_users FROM tenants WHERE id = $1', [tenantId]);
    const currentCount = await pool.query('SELECT COUNT(*) FROM users WHERE tenant_id = $1', [tenantId]);
    
    if (parseInt(currentCount.rows[0].count) >= limitCheck.rows[0].max_users) {
      return res.status(403).json({ success: false, message: 'Subscription user limit reached' });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User
    const newUser = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role, created_at`,
      [tenantId, email, hashedPassword, fullName, role || 'user']
    );

    // 4. Audit Log
    // (Optional: handle case where logAudit might not be defined or imported correctly in all contexts)
    try {
        await logAudit(tenantId, req.user.id, 'CREATE_USER', 'user', newUser.rows[0].id);
    } catch (auditErr) {
        console.log("Audit log failed silently");
    }

    res.status(201).json({ success: true, data: newUser.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
        return res.status(409).json({ success: false, message: 'Email already exists in this tenant' });
    }
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    List Tenant Users
// @route   GET /api/tenants/:tenantId/users
const getUsers = async (req, res) => {
  const { tenantId } = req.params;
  
  // FIX: Allow super_admin to view users too
  if (req.user.role !== 'super_admin' && req.user.tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  try {
    const users = await pool.query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    res.json({ success: true, data: { users: users.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update User
// @route   PUT /api/users/:userId
const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { fullName, role, isActive } = req.body;
    
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) return res.status(404).json({ success: false });

        // Isolation: Must belong to same tenant (unless super_admin)
        if (req.user.role !== 'super_admin' && userCheck.rows[0].tenant_id !== req.user.tenant_id) {
            return res.status(403).json({ success: false });
        }

        // Logic: Users can update own name. Only admins update role/active.
        if (req.user.role !== 'tenant_admin' && req.user.role !== 'super_admin' && req.user.id !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        
        const isAdmin = req.user.role === 'tenant_admin' || req.user.role === 'super_admin';

        if (!isAdmin && (role || isActive !== undefined)) {
            return res.status(403).json({ success: false, message: 'Only admins can change roles/status' });
        }

        const updates = [];
        const values = [];
        let idx = 1;

        if (fullName) { updates.push(`full_name = $${idx++}`); values.push(fullName); }
        if (role && isAdmin) { updates.push(`role = $${idx++}`); values.push(role); }
        if (isActive !== undefined && isAdmin) { updates.push(`is_active = $${idx++}`); values.push(isActive); }

        values.push(userId);
        const query = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, full_name, role, is_active`;
        
        const result = await pool.query(query, values);
        res.json({ success: true, data: result.rows[0] });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete User
// @route   DELETE /api/users/:userId
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    
    const isAdmin = req.user.role === 'tenant_admin' || req.user.role === 'super_admin';
    if (!isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });
    
    if (req.user.id === userId) return res.status(403).json({ success: false, message: 'Cannot delete yourself' });

    try {
        // If super_admin, we don't check tenant_id match in the DELETE clause roughly, but safer to check ownership first
        let query = 'DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING id';
        let params = [userId, req.user.tenant_id];

        if (req.user.role === 'super_admin') {
             query = 'DELETE FROM users WHERE id = $1 RETURNING id';
             params = [userId];
        }

        const result = await pool.query(query, params);
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { addUser, getUsers, updateUser, deleteUser };