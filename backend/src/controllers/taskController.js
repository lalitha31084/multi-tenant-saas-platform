const pool = require('../config/db');

// @desc    Create Task
// @route   POST /api/projects/:projectId/tasks
const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, priority, assignedTo, dueDate } = req.body;

  try {
    // Verify project belongs to tenant
    const projectCheck = await pool.query('SELECT tenant_id FROM projects WHERE id = $1', [projectId]);
    if (projectCheck.rows.length === 0 || projectCheck.rows[0].tenant_id !== req.user.tenant_id) {
        return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await pool.query(
      `INSERT INTO tasks (tenant_id, project_id, title, description, priority, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.tenant_id, projectId, title, description, priority || 'medium', assignedTo, dueDate]
    );

    res.status(201).json({ success: true, data: task.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List Tasks
// @route   GET /api/projects/:projectId/tasks
const getTasks = async (req, res) => {
  const { projectId } = req.params;
  try {
    const tasks = await pool.query(`
      SELECT t.*, u.full_name as assignee_name 
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.project_id = $1 AND t.tenant_id = $2
      ORDER BY t.created_at DESC
    `, [projectId, req.user.tenant_id]);

    res.json({ success: true, data: { tasks: tasks.rows } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update Task Status
// @route   PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING *',
            [status, id, req.user.tenant_id]
        );
        if (result.rowCount === 0) return res.status(404).json({ success: false, message: 'Task not found' });
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Task (Full Update)
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    try {
        // Isolation Check
        const check = await pool.query('SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2', [id, req.user.tenant_id]);
        if (check.rows.length === 0) return res.status(404).json({ success: false });

        // If assigning, check if user belongs to tenant
        if (assignedTo) {
             const userCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND tenant_id = $2', [assignedTo, req.user.tenant_id]);
             if (userCheck.rows.length === 0) return res.status(400).json({ success: false, message: 'Assigned user not in tenant' });
        }

        const updates = [];
        const values = [];
        let idx = 1;

        if (title) { updates.push(`title = $${idx++}`); values.push(title); }
        if (description) { updates.push(`description = $${idx++}`); values.push(description); }
        if (status) { updates.push(`status = $${idx++}`); values.push(status); }
        if (priority) { updates.push(`priority = $${idx++}`); values.push(priority); }
        if (assignedTo !== undefined) { updates.push(`assigned_to = $${idx++}`); values.push(assignedTo); } // Allow null
        if (dueDate !== undefined) { updates.push(`due_date = $${idx++}`); values.push(dueDate); }

        values.push(id);
        const query = `UPDATE tasks SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;

        const result = await pool.query(query, values);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { createTask, getTasks, updateTaskStatus, updateTask };