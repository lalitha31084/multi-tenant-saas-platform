const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTaskStatus, updateTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Task routes often need to sit under projects or stand alone.
// We will handle routing structure in index.js to support /projects/:id/tasks

router.post('/projects/:projectId/tasks', protect, createTask);
router.get('/projects/:projectId/tasks', protect, getTasks);
router.patch('/tasks/:id/status', protect, updateTaskStatus);
router.put('/tasks/:id', protect, updateTask);

module.exports = router;