// middleware/auth.js
const jwt    = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.farmer = await Farmer.findById(decoded.id);
    if (!req.farmer) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.farmer.role)) {
    return res.status(403).json({ error: 'You do not have permission for this action.' });
  }
  next();
};

module.exports = { protect, restrictTo };
