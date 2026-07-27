// routes/income.js  – 100% Free – Uses Python ML, No Claude API
const express = require('express');
const fetch   = require('node-fetch');
const router  = express.Router();
const ML_URL  = process.env.ML_SERVICE_URL || 'http://localhost:5001';

function getAdvice(crop, riskLevel, rainfallMm, marketPrice) {
  const adviceMap = {
    Low:    `Conditions are favorable for ${crop}. Market price ₹${marketPrice}/quintal is good. Plan selling strategy early. Apply balanced NPK fertilizer for better yield.`,
    Medium: `Moderate risk for ${crop}. Rainfall ${rainfallMm}mm may affect yield. Monitor weather closely. Consider PMFBY crop insurance to protect against losses.`,
    High:   `High risk for ${crop}! Immediately apply for PMFBY crop insurance. Rainfall ${rainfallMm}mm is concerning. Contact local KVK (Krishi Vigyan Kendra) for emergency support.`
  };
  return adviceMap[riskLevel] || adviceMap['Medium'];
}

function getSchemes(riskLevel) {
  const base = ['PM-KISAN', 'KCC (Kisan Credit Card)'];
  if (riskLevel === 'High')   return [...base, 'PMFBY Crop Insurance', 'RKVY', 'National Food Security Mission'];
  if (riskLevel === 'Medium') return [...base, 'PMFBY Crop Insurance', 'eNAM Market Portal'];
  return [...base, 'eNAM Market Portal', 'Soil Health Card Scheme'];
}

router.post('/predict', async (req, res) => {
  try {
    const { crop, areaHectares, rainfallMm, marketPrice,
            irrigationType = 'Rain-fed', loanAmount = 0, defaultHistory = 0 } = req.body;

    if (!crop || !areaHectares || !rainfallMm || !marketPrice)
      return res.status(400).json({ error: 'crop, areaHectares, rainfallMm, marketPrice are required.' });

    let result = null;

    // Try Python ML service first
    try {
      const mlRes = await fetch(`${ML_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, areaHectares, rainfallMm, marketPrice, loanAmount, defaultHistory, irrigationType }),
        signal: AbortSignal.timeout(8000)
      });
      if (mlRes.ok) { const d = await mlRes.json(); result = d.data; }
    } catch(e) { console.log('ML service offline, using formula fallback'); }

    // Fallback: pure math formula (no API needed)
    if (!result) {
      const yields = { wheat:35, rice:30, cotton:18, sugarcane:700, maize:28, soybean:12, tomato:250, onion:200, potato:220 };
      const baseY  = yields[crop.toLowerCase()] || 25;
      const rainF  = rainfallMm < 50 ? 0.5 : rainfallMm < 100 ? 0.75 : rainfallMm < 300 ? 1.0 : 0.85;
      const irrF   = { Drip:1.2, Canal:1.1, Borewell:1.15, River:0.9, 'Rain-fed':1.0 }[irrigationType] || 1.0;
      const yieldQ = +(baseY * areaHectares * rainF * irrF).toFixed(1);
      const income = Math.round(yieldQ * marketPrice);
      const cost   = 25000 * areaHectares;
      const beven  = Math.round(cost / Math.max(yieldQ, 1));
      const wR = rainfallMm < 60 ? 80 : rainfallMm < 100 ? 55 : rainfallMm > 400 ? 65 : 20;
      const mR = marketPrice < beven ? 85 : marketPrice < beven * 1.3 ? 50 : 20;
      const lR = loanAmount > 0 ? (loanAmount/Math.max(income,1) > 0.7 ? 80 : loanAmount/Math.max(income,1) > 0.4 ? 50 : 15) : 10;
      const hR = Math.min(90, defaultHistory * 35);
      const sR = irrigationType === 'Rain-fed' ? 40 : 20;
      const cs = +(wR*0.3 + mR*0.25 + lR*0.2 + hR*0.15 + sR*0.1).toFixed(1);
      result = {
        predictedIncome: income, yieldQuintals: yieldQ, riskScore: cs,
        riskLevel: cs < 35 ? 'Low' : cs < 65 ? 'Medium' : 'High',
        confidencePct: 78, breakevenPrice: beven,
        weatherRisk: wR, marketRisk: mR, loanRisk: lR, historyRisk: hR, soilRisk: sR
      };
    }

    result.advice = getAdvice(crop, result.riskLevel, rainfallMm, marketPrice);
    result.governmentSchemes = getSchemes(result.riskLevel);
    res.json({ status: 'success', data: result });

  } catch(err) { res.status(500).json({ error: err.message }); }
});

router.get('/history/:farmerId', async (req, res) => {
  try {
    const RA = require('../models/RiskAssessment');
    const history = await RA.find({ farmer: req.params.farmerId }).sort({ createdAt: -1 }).limit(10);
    res.json({ status: 'success', data: history });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
