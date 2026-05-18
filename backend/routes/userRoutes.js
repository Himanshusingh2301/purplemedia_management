const express = require('express');
const { getUsers, updateUserAccess, deleteUser, getProfile } = require('../controllers/userController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/', protect, authorize('Admin'), getUsers);
router.put('/:id/access', protect, authorize('Admin'), updateUserAccess);
router.delete('/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
