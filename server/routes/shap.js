// routes/shap.js  –  Proxy to Python SHAP Explainer
// Satisfies project objective: "Integrate SHAP for model interpretability"
const express = require('express');
const fetch   = require('node-fetch');
const router  = express.Router();

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// POST /api/shap/explain
router.post('/explain', async (req, res) => {
  try {
    const { crop, areaHectares, rainfallMm, marketPrice,
            loanAmount, defaultHistory, irrigationType } = req.body;

    if (!crop || !areaHectares || !rainfallMm || !marketPrice) {
      return res.status(400).json({ error: 'crop, areaHectares, rainfallMm, marketPrice are required.' });
    }

    const mlRes = await fetch(`${ML_URL}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop, areaHectares, rainfallMm, marketPrice,
                             loanAmount: loanAmount || 0,
                             defaultHistory: defaultHistory || 0,
                             irrigationType: irrigationType || 'Rain-fed' }),
      signal: AbortSignal.timeout(15000)
    });

    if (!mlRes.ok) {
      const err = await mlRes.text();
      return res.status(mlRes.status).json({ error: 'ML service error: ' + err });
    }

    const data = await mlRes.json();
    res.json(data);

  } catch (err) {
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'ML service timeout. Is Python service running on port 5001?' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
