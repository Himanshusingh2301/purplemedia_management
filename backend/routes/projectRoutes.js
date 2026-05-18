const express = require('express');
const { createProject, getProjects, getProjectById } = require('../controllers/projectController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const router = express.Router();

router.route('/')
  .post(protect, authorize('Admin'), createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById);

module.exports = router;
