// routes/farmer.js  –  Farmer Profile CRUD
const express = require('express');
const Farmer  = require('../models/Farmer');
const { protect } = require('../middleware/auth');
const router  = express.Router();

// GET /api/farmer/profile  (protected)
router.get('/profile', protect, async (req, res) => {
  res.json({ status: 'success', data: req.farmer });
});

// PATCH /api/farmer/profile  (protected)
router.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'state', 'district', 'village', 'landHectares', 'primaryCrop', 'irrigationType'];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const updated = await Farmer.findByIdAndUpdate(req.farmer._id, updates, { new: true, runValidators: true });
    res.json({ status: 'success', data: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/farmer/all  (admin only - for bank dashboard)
router.get('/all', protect, async (req, res) => {
  try {
    if (req.farmer.role !== 'admin' && req.farmer.role !== 'bank') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const farmers = await Farmer.find({ role: 'farmer' }).select('-password').limit(50);
    res.json({ status: 'success', count: farmers.length, data: farmers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
