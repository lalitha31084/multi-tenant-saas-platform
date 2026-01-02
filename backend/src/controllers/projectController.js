const pool = require('../config/db');
const logAudit = require('../utils/auditLogger');

// @desc    Create Project
// @route   POST /api/projects
const createProject = async (req, res) => {
  const { name, description, status } = req.body;
  const tenantId = req.user.tenant_id;

  try {
    // 1. Check Limits
    const limitCheck = await pool.query('SELECT max_projects FROM tenants WHERE id = $1', [tenantId]);
    const currentCount = await pool.query('SELECT COUNT(*) FROM projects WHERE tenant_id = $1', [tenantId]);
    
    if (parseInt(currentCount.rows[0].count) >= limitCheck.rows[0].max_projects) {
      return res.status(403).json({ success: false, message: 'Subscription project limit reached' });
    }

    // 2. Create Project
    const project = await pool.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenantId, name, description, status || 'active', req.user.id]
    );

    await logAudit(tenantId, req.user.id, 'CREATE_PROJECT', 'project', project.rows[0].id);

    res.status(201).json({ success: true, data: project.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    List Projects
// @route   GET /api/projects
const getProjects = async (req, res) => {
  try {
    // Data Isolation: Filter by tenant_id automatically
    const projects = await pool.query(`
      SELECT p.*, u.full_name as creator_name,
      (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.tenant_id = $1
      ORDER BY p.created_at DESC
    `, [req.user.tenant_id]);

    res.json({ success: true, data: { projects: projects.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete Project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
        'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING id', 
        [id, req.user.tenant_id]
    );
    
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Project
// @route   PUT /api/projects/:id
const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description, status } = req.body;

    try {
        // Verify ownership (Tenant Admin OR Creator)
        const check = await pool.query('SELECT * FROM projects WHERE id = $1 AND tenant_id = $2', [id, req.user.tenant_id]);
        if (check.rows.length === 0) return res.status(404).json({ success: false });

        if (req.user.role !== 'tenant_admin' && check.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updates = [];
        const values = [];
        let idx = 1;
        if (name) { updates.push(`name = $${idx++}`); values.push(name); }
        if (description) { updates.push(`description = $${idx++}`); values.push(description); }
        if (status) { updates.push(`status = $${idx++}`); values.push(status); }
        
        values.push(id);
        const query = `UPDATE projects SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
        
        const result = await pool.query(query, values);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { createProject, getProjects, updateProject, deleteProject };