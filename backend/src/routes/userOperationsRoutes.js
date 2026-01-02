const express = require('express');
const router = express.Router();
const { updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.put('/:userId', protect, updateUser);
router.delete('/:userId', protect, deleteUser);

module.exports = router;