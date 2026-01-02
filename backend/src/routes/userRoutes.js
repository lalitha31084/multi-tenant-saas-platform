const express = require('express');
const router = express.Router({ mergeParams: true }); // Important for nested params
const { addUser, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Note: The base route will be mounted as /api/tenants/:tenantId/users
router.route('/')
  .post(protect, authorize('tenant_admin'), addUser)
  .get(protect, getUsers);

module.exports = router;