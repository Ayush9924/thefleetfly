const express = require('express');
const router = express.Router();
const { 
  createAssignment, 
  getAssignments, 
  endAssignment 
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(authorize('admin', 'manager'), createAssignment)
  .get(getAssignments);

router.route('/:id/end')
  .put(authorize('admin', 'manager'), endAssignment);

module.exports = router;