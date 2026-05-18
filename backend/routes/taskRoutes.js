const express = require('express');
const { 
  createTask, 
  getTasks, 
  updateTask,
  deleteTask,
  updateTaskStatus,
  addDocumentLink,
  addComment
} = require('../controllers/taskController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');
const router = express.Router();

router.route('/')
  .post(protect, authorize('Admin'), createTask)
  .get(protect, getTasks);

router.route('/:id')
  .put(protect, authorize('Admin'), updateTask)
  .delete(protect, authorize('Admin'), deleteTask);

router.route('/:id/status')
  .put(protect, updateTaskStatus);

router.route('/:id/links')
  .post(protect, addDocumentLink);

router.route('/:id/comments')
  .post(protect, addComment);

module.exports = router;
