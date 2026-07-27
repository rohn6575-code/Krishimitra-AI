// models/Farmer.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Name is required'], trim: true
  },
  phone: {
    type: String, required: [true, 'Phone is required'],
    unique: true, match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number']
  },
  email: {
    type: String, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  password: {
    type: String, required: true, minlength: 6, select: false
  },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  village: { type: String, default: '' },
  landHectares: { type: Number, default: 0 },
  primaryCrop: { type: String, default: '' },
  irrigationType: {
    type: String,
    enum: ['Canal', 'Borewell', 'Drip', 'Rain-fed', 'River'],
    default: 'Rain-fed'
  },
  role: { type: String, enum: ['farmer', 'bank', 'admin'], default: 'farmer' },
  loanHistory: [{
    amount: Number,
    crop: String,
    year: Number,
    repaid: Boolean,
    defaulted: Boolean
  }],
  riskScores: [{
    date: { type: Date, default: Date.now },
    score: Number,
    riskLevel: String,
    crop: String
  }]
}, { timestamps: true });

// Hash password before saving
farmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
farmerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Farmer', farmerSchema);
