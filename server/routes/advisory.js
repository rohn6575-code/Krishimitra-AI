// routes/advisory.js – 100% Free – No Claude API, Pre-built advisory data
const express = require('express');
const router  = express.Router();

// Complete advisory data for all crops and stages - NO API NEEDED
const advisoryData = {
  Cotton: {
    'Sowing / Germination': {
      weather: 'Temperature 25-35°C ideal for cotton germination. Avoid sowing if rainfall expected above 50mm in next 3 days.',
      actions: ['Treat seeds with Imidacloprid 70WS @ 5g/kg seed', 'Sow at 90x60cm spacing for hybrid varieties', 'Apply Carbofuran 3G @ 20kg/ha in furrows', 'Ensure field is weed-free before sowing'],
      irrigation: 'Give light irrigation (4-5 cm) immediately after sowing if soil moisture is low. Avoid waterlogging.',
      fertilizer: 'Apply FYM 10 tonnes/ha + DAP 100 kg/ha + MOP 50 kg/ha as basal dose before sowing.',
      pest: 'Watch for thrips and aphids in early stage. Apply Thiamethoxam 25WG if infestation seen.',
      tip: 'Sow cotton only when soil temperature is above 18°C for good germination rate.'
    },
    'Flowering': {
      weather: 'Cotton flowering needs dry weather. Rain during flowering can cause boll shedding. Monitor IMD forecasts.',
      actions: ['Apply 2nd dose of nitrogen fertilizer now', 'Install pheromone traps for bollworm @ 5/acre', 'Spray micronutrients (Boron + Zinc) for better flowering', 'Remove and destroy fallen flowers to reduce disease'],
      irrigation: 'Critical stage — irrigate every 10-12 days. Do not stress the crop. Apply 6-8 cm water per irrigation.',
      fertilizer: 'Apply Urea 65 kg/ha as top dressing. Spray 2% DAP solution on leaves for better boll setting.',
      pest: '🚨 ALERT: Pink Bollworm season. Check regularly. Apply Spinosad 45SC @ 160ml/acre if larvae found.',
      tip: 'Flowering stage is most critical. Any water or nutrient stress now will directly reduce your final yield by 30-40%.'
    },
    'Maturity / Harvest': {
      weather: 'Dry weather needed for good quality cotton. Avoid harvesting wet cotton — it reduces price by 20-30%.',
      actions: ['Harvest only fully opened bolls (white fluffy cotton)', 'Avoid mixing trash and leaves during picking', 'Store in clean dry bags', 'Check mandi prices on eNAM portal before selling'],
      irrigation: 'Stop irrigation 20-25 days before harvest. This improves fiber quality and makes harvesting easier.',
      fertilizer: 'No fertilizer needed at harvest stage. Save cost.',
      pest: 'Watch for mealy bugs on cotton bolls. Apply Profenofos if found.',
      tip: 'Sell cotton at APMC mandi or eNAM online portal for better prices. Do not sell in hurry to local traders.'
    }
  },
  Wheat: {
    'Sowing / Germination': {
      weather: 'Ideal temperature for wheat sowing is 20-25°C. Sow timely variety HD-2967 or PBW-343 in November for best yield.',
      actions: ['Treat seed with Vitavax Power @ 2.5g/kg seed', 'Sow at 100-125 kg/ha seed rate', 'Maintain row spacing of 22-23 cm', 'Level field properly for uniform germination'],
      irrigation: 'Give crown root initiation irrigation (CRI) at 20-21 days after sowing. This is most critical irrigation.',
      fertilizer: 'Apply NPK 120:60:40 kg/ha. Full P and K as basal, split N into 3 doses.',
      pest: 'Apply Chlorpyriphos 20EC @ 2.5 litre/ha for termite control before sowing.',
      tip: 'Timely sowing (15 Oct - 15 Nov) gives 15-20% more yield than late sowing in wheat.'
    },
    'Vegetative': {
      weather: 'Cool weather (15-20°C) is ideal for wheat vegetative growth. Watch for foggy weather which favors disease.',
      actions: ['Apply 2nd dose nitrogen (Urea 65 kg/ha) at tillering stage', 'Do weeding — use Isoproturon 75WP @ 1kg/ha', 'Check for yellow rust disease on leaves', 'Apply irrigation if soil moisture low'],
      irrigation: 'Irrigate at tillering (21 days), jointing (45 days), and booting stages. Each irrigation 6-7 cm.',
      fertilizer: '2nd dose: Urea 65 kg/ha at 21 days after sowing for good tillering.',
      pest: '⚠️ Yellow Rust Alert in wheat — if yellow stripes appear on leaves, spray Propiconazole 25EC @ 500ml/acre immediately.',
      tip: 'Wheat needs 4-6 irrigations total. Never miss CRI and heading stage irrigations.'
    },
    'Maturity / Harvest': {
      weather: 'Harvest when grain moisture is 12-14%. Hot dry winds (loo) can cause shriveling — harvest quickly if forecast.',
      actions: ['Harvest when 90% grains are hard and golden', 'Use combine harvester if available to save labour cost', 'Dry grain properly before storage', 'Check MSP price — currently ₹2275/quintal'],
      irrigation: 'Stop all irrigation after grain filling is complete (about 2 weeks before harvest).',
      fertilizer: 'No fertilizer at harvest. Stop all sprays 2 weeks before harvest.',
      pest: 'Watch for storage pests after harvest. Treat godown with Malathion before storing wheat.',
      tip: 'Government MSP for wheat is ₹2275/quintal. Sell at government procurement centers for guaranteed price.'
    }
  },
  Rice: {
    'Sowing / Germination': {
      weather: 'Rice nursery needs temperature above 30°C. Avoid nursery if heavy rain forecast in next week.',
      actions: ['Prepare nursery bed 10x1 meter size per 40 kg seeds', 'Treat seeds with Bavistin 1g/litre water for 24 hours', 'Sow pre-germinated seeds in nursery', 'Apply Carbofuran 3G in nursery for stem borer control'],
      irrigation: 'Keep nursery moist — irrigate lightly every 2 days. Do not flood nursery.',
      fertilizer: 'Apply DAP 50 kg in nursery before sowing for healthy seedlings.',
      pest: 'Watch for leaf folder and stem borer in nursery. Apply Chlorpyriphos if damage seen.',
      tip: 'Healthy 25-30 day old seedlings give best results in transplanting. Older seedlings reduce yield.'
    },
    'Flowering': {
      weather: '🚨 Rice flowering needs NO rain for 2-3 hours around flowering time (morning). Check weather forecast daily.',
      actions: ['Maintain 5 cm water level in field', 'Apply potash (MOP 20 kg/ha) for grain filling', 'Install light traps for stem borer adults', 'Do not drain field during flowering'],
      irrigation: 'Maintain continuous 5 cm flooding during flowering. Water stress reduces grain setting by 50%.',
      fertilizer: 'Last fertilizer dose — MOP 20 kg/ha for grain weight. No more nitrogen after this stage.',
      pest: '⚠️ HIGH ALERT: Blast disease and Brown Plant Hopper (BPH) are major threats. Check daily and spray Tricyclazole for blast.',
      tip: 'Do not use excess nitrogen after flowering — it increases disease and lodging risk.'
    },
    'Maturity / Harvest': {
      weather: 'Harvest when 80% grains are golden yellow. Rainy weather during harvest causes grain sprouting — avoid delay.',
      actions: ['Drain field 10 days before harvest', 'Harvest at 20-22% moisture for best quality', 'Thresh immediately after cutting', 'Dry paddy to 14% moisture before storage'],
      irrigation: 'Drain field completely 10-14 days before harvest for easy harvesting.',
      fertilizer: 'No fertilizer needed at harvest.',
      pest: 'Check for storage weevils and grain borers. Store in sealed bags with Aluminium Phosphide tablets.',
      tip: 'Sell paddy at government procurement center for MSP price. Current MSP ₹2183/quintal for common grade.'
    }
  },
  Maize: {
    'Flowering': {
      weather: 'Maize tasseling and silking needs moderate temperature (25-30°C). Heat stress during this period reduces yield.',
      actions: ['Apply 3rd dose of Urea at tasseling', 'Ensure proper soil moisture', 'Remove barren plants from field', 'Control weeds immediately'],
      irrigation: 'Most critical stage — irrigate every 8-10 days. Water stress at tasseling reduces yield by 40-50%.',
      fertilizer: 'Apply Urea 65 kg/ha at tasseling for good cob development.',
      pest: 'Fall Armyworm (FAW) is major threat. Check whorls daily. Apply Emamectin Benzoate if larvae found.',
      tip: 'FAW can destroy entire maize crop in 7-10 days. Daily scouting is must during vegetative and flowering stages.'
    }
  },
  Soybean: {
    'Flowering': {
      weather: 'Soybean flowering needs 12-14 hours daylight. Check for excessive rain which can cause pod shedding.',
      actions: ['Apply Borax 0.2% spray for better pod setting', 'Install yellow sticky traps for whitefly', 'Do not disturb crop during flowering', 'Spray Mancozeb for bacterial pustule prevention'],
      irrigation: 'Irrigate at pod development stage. Avoid waterlogging which causes root rot.',
      fertilizer: 'Spray 2% DAP solution on leaves at flowering for better pod fill.',
      pest: 'Watch for Soybean Stem Fly and Girdle Beetle. Apply Thiamethoxam if infestation seen.',
      tip: 'Soybean is a legume — fixes its own nitrogen. Do not apply excess nitrogen as it reduces fixation.'
    }
  }
};

// Default advisory for any crop/stage combination not in our data
function getDefaultAdvisory(crop, location, stage) {
  return {
    weather: `Monitor local weather in ${location} regularly. Check IMD (imd.gov.in) for 5-day forecast before any major farm operations for ${crop}.`,
    actions: [
      `Scout your ${crop} field every 3-4 days for pest and disease symptoms`,
      'Maintain proper field sanitation — remove crop debris and weeds',
      `Check current ${crop} prices on eNAM portal (enam.gov.in)`,
      'Keep records of all inputs applied for better planning next season',
      'Consult nearest KVK (Krishi Vigyan Kendra) for location-specific advice'
    ],
    irrigation: `Irrigate ${crop} based on soil moisture and crop demand. Avoid waterlogging. Drip irrigation saves 40-50% water.`,
    fertilizer: `Apply fertilizers based on soil test report. Contact nearest soil testing lab for accurate recommendations for ${crop} in ${location}.`,
    pest: `Regularly monitor for common ${crop} pests. Use IPM (Integrated Pest Management) approach — prefer biological control over chemicals.`,
    tip: `Register on PM-KISAN portal for ₹6000/year direct benefit. Also apply for KCC (Kisan Credit Card) for low-interest crop loans.`
  };
}

// POST /api/advisory/get
router.post('/get', async (req, res) => {
  const { location, crop, growthStage } = req.body;

  if (!location || !crop || !growthStage)
    return res.status(400).json({ error: 'location, crop, growthStage required.' });

  // Set SSE headers (keep same format as before)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // Get advisory from local data
    const cropData    = advisoryData[crop] || {};
    const stageData   = cropData[growthStage] || getDefaultAdvisory(crop, location, growthStage);

    // Build HTML response
    const html = `
<h3>🌦️ Weather Situation</h3>
<p>${stageData.weather}</p>

<h3>✅ Immediate Actions (Next 7 Days)</h3>
<ul>
${(Array.isArray(stageData.actions) ? stageData.actions : [stageData.actions]).map(a => `<li>${a}</li>`).join('\n')}
</ul>

<h3>💧 Irrigation Schedule</h3>
<p>${stageData.irrigation}</p>

<h3>🌱 Fertilizer / Nutrition</h3>
<p>${stageData.fertilizer}</p>

<h3>🐛 Pest & Disease Alert</h3>
<p>${stageData.pest}</p>

<h3>💡 Pro Tip</h3>
<p>${stageData.tip}</p>

<hr style="border:none;border-top:1px solid #D8EDE0;margin:12px 0"/>
<p style="font-size:12px;color:#6B8F71;">📍 Advisory for: <strong>${crop}</strong> | Stage: <strong>${growthStage}</strong> | Location: <strong>${location}</strong></p>
<p style="font-size:12px;color:#6B8F71;">📞 For more help: Call Kisan Call Centre <strong>1800-180-1551</strong> (Free, 24x7)</p>
`;

    // Stream it character by character to simulate streaming effect
    const chunks = html.match(/.{1,50}/g) || [html];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= chunks.length) {
        clearInterval(interval);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      const fakeEvent = JSON.stringify({
        type: 'content_block_delta',
        delta: { text: chunks[i] }
      });
      res.write(`data: ${fakeEvent}\n\n`);
      i++;
    }, 30);

  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
