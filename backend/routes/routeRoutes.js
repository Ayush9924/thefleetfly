const express = require('express');
const router = express.Router();
const { 
  getRoutes, 
  createRoute, 
  deleteRoute 
} = require('../controllers/routeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getRoutes)
  .post(authorize('admin', 'manager'), createRoute);

router.route('/:id')
  .delete(authorize('admin', 'manager'), deleteRoute);

module.exports = router;