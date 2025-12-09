const Route = require('../models/Route');

// @desc    Get all routes
// @route   GET /api/routes
const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create route
// @route   POST /api/routes
const createRoute = async (req, res) => {
  try {
    const { name, waypoints, distance, duration, geometry } = req.body;
    
    if (!waypoints || waypoints.length < 2) {
      return res.status(400).json({ message: 'At least 2 waypoints are required' });
    }

    const route = new Route({
      name,
      waypoints,
      distance: parseFloat(distance),
      duration: parseInt(duration),
      geometry: geometry || ''
    });

    await route.save();
    res.status(201).json(route);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
const deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json({ message: 'Route removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRoutes,
  createRoute,
  deleteRoute
};