const express = require('express');
const router = express.Router();
const { getTenant, getAllTenants, updateTenant } = require('../controllers/tenantController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('super_admin'), getAllTenants);
router.get('/:tenantId', protect, getTenant);
router.put('/:tenantId', protect, updateTenant);

module.exports = router;