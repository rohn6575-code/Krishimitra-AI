// routes/auth.js
const express = require('express');
const jwt     = require('jsonwebtoken');
const Farmer  = require('../models/Farmer');
const router  = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, password, state, district, village, landHectares, primaryCrop } = req.body;

    if (!name || !phone || !password)
      return res.status(400).json({ error: 'Name, phone and password are required.' });

    const existing = await Farmer.findOne({ phone });
    if (existing)
      return res.status(409).json({ error: 'Phone number already registered.' });

    const farmer = await Farmer.create({
      name, phone, password,
      state: state || '',
      district: district || '',
      village: village || '',
      landHectares: landHectares || 0,
      primaryCrop: primaryCrop || ''
    });

    const token = signToken(farmer._id);
    res.status(201).json({
      status: 'success',
      token,
      farmer: {
        id: farmer._id, name: farmer.name,
        phone: farmer.phone, state: farmer.state
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ error: 'Phone and password required.' });

    const farmer = await Farmer.findOne({ phone }).select('+password');
    if (!farmer || !(await farmer.comparePassword(password)))
      return res.status(401).json({ error: 'Incorrect phone or password.' });

    const token = signToken(farmer._id);
    res.json({
      status: 'success',
      token,
      farmer: {
        id: farmer._id, name: farmer.name,
        phone: farmer.phone, state: farmer.state, role: farmer.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
