// models/RiskAssessment.js
const mongoose = require('mongoose');

const riskAssessmentSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  // Input data
  crop:          { type: String, required: true },
  areaHectares:  { type: Number, required: true },
  rainfallMm:    { type: Number, required: true },
  marketPrice:   { type: Number, required: true },
  state:         { type: String },
  irrigationType:{ type: String },
  // ML / AI output
  predictedIncome:   { type: Number },
  yieldQuintals:     { type: Number },
  riskLevel:         { type: String, enum: ['Low', 'Medium', 'High'] },
  riskScore:         { type: Number, min: 0, max: 100 },
  confidencePct:     { type: Number },
  breakevenPrice:    { type: Number },
  aiAdvice:          { type: String },
  // Sub-scores
  weatherRisk:    { type: Number },
  marketRisk:     { type: Number },
  soilRisk:       { type: Number },
  loanRisk:       { type: Number },
  historyRisk:    { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);
