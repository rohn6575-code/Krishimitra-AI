const express = require('express');
const router  = express.Router();

const GOV_API_KEY = '579b464db66ec23bdd000001b08f9cfb38a9424c78648c526ff1af3a';
const BASE_URL    = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// GET /api/mandi/prices
router.get('/prices', async (req, res) => {
  try {
    const { crop, state, market } = req.query;

    let url = `${BASE_URL}?api-key=${GOV_API_KEY}&format=json&limit=20`;

    if (crop)   url += `&filters[commodity]=${encodeURIComponent(crop)}`;
    if (state)  url += `&filters[state]=${encodeURIComponent(state)}`;
    if (market) url += `&filters[market]=${encodeURIComponent(market)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      return res.json({
        status: 'success',
        records: [],
        message: 'No data found'
      });
    }

    // clean data (same logic, thoda safe)
    const records = data.records.map(r => ({
      state: r.state || '-',
      district: r.district || '-',
      market: r.market || '-',
      commodity: r.commodity || '-',
      minPrice: r.min_price || '-',
      maxPrice: r.max_price || '-',
      modalPrice: r.modal_price || '-',
      date: r.arrival_date || '-'
    }));

    res.json({
      status: 'success',
      total: records.length,
      records
    });

  } catch (err) {
    console.error("Mandi error:", err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch mandi data'
    });
  }
});

// crops list (same)
router.get('/crops', (req, res) => {
  res.json({
    status: 'success',
    crops: [
      'Wheat','Rice','Cotton','Maize','Soyabean',
      'Onion','Potato','Tomato','Bajra','Jowar'
    ]
  });
});

module.exports = router;