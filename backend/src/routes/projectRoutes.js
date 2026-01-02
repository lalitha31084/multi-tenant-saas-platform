const express = require('express');
const router = express.Router();
const { createProject, getProjects, deleteProject, updateProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .put(protect, updateProject)
  .delete(protect, deleteProject);

module.exports = router;