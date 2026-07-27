// routes/chat.js – 100% Free – Rule-based AI Chat, No Claude API
const express = require('express');
const router  = express.Router();

// Knowledge base for Indian agriculture
const KB = {
  fertilizer: {
    keywords: ['fertilizer','fertiliser','khad','urea','npk','dap','potash','nutrient'],
    responses: [
      `🌱 <b>Fertilizer Guide for Indian Crops:</b><br><br>
      <b>Wheat:</b> NPK 120:60:40 kg/ha. Apply full P&K as basal + split N in 3 doses.<br>
      <b>Rice:</b> NPK 100:50:50 kg/ha. Apply Zinc Sulphate 25 kg/ha if deficiency seen.<br>
      <b>Cotton:</b> NPK 180:90:60 kg/ha in 3 splits.<br>
      <b>Maize:</b> NPK 150:75:40 kg/ha.<br><br>
      💡 <b>Tip:</b> Always get soil test done before applying fertilizers. Contact nearest soil testing lab — it's usually free at KVK.`,

      `📊 <b>NPK — What Each Does:</b><br><br>
      <b>N (Nitrogen/Urea):</b> Leaf & stem growth, green color<br>
      <b>P (Phosphorus/DAP):</b> Root development, flowering<br>
      <b>K (Potash/MOP):</b> Fruit/grain quality, disease resistance<br><br>
      <b>Deficiency Signs:</b><br>
      • Yellow leaves = Nitrogen deficiency → Apply Urea<br>
      • Purple leaves = Phosphorus deficiency → Apply DAP<br>
      • Weak stems, poor grain = Potash deficiency → Apply MOP`
    ]
  },
  pest: {
    keywords: ['pest','insect','disease','aphid','bollworm','rust','blight','fungus','spray','kida','bimari'],
    responses: [
      `🐛 <b>Common Pest Control:</b><br><br>
      <b>Aphids:</b> Spray Imidacloprid 17.8SL @ 150ml/acre<br>
      <b>Bollworm (Cotton):</b> Spinosad 45SC @ 160ml/acre<br>
      <b>Stem Borer (Rice):</b> Chlorpyriphos 20EC @ 2.5L/ha<br>
      <b>Fall Armyworm (Maize):</b> Emamectin Benzoate 5SG @ 200g/acre<br><br>
      🌿 <b>Organic Options:</b><br>
      • Neem oil 5% spray for soft-bodied insects<br>
      • Trichogramma cards for bollworm control<br>
      • Yellow sticky traps for whitefly<br><br>
      📞 For emergency: Call Kisan Call Centre <b>1800-180-1551</b> (Free)`,

      `🍂 <b>Common Crop Diseases:</b><br><br>
      <b>Yellow Rust (Wheat):</b> Propiconazole 25EC @ 500ml/acre<br>
      <b>Blast (Rice):</b> Tricyclazole 75WP @ 300g/acre<br>
      <b>Downy Mildew:</b> Metalaxyl + Mancozeb @ 2.5g/litre<br>
      <b>Powdery Mildew:</b> Sulphur 80WP @ 3kg/acre<br><br>
      💡 Prevention is better than cure. Crop rotation and seed treatment reduce 60% disease incidence.`
    ]
  },
  irrigation: {
    keywords: ['irrigation','water','sinchayee','drip','sprinkler','paani','irrigate','moisture'],
    responses: [
      `💧 <b>Irrigation Schedule by Crop:</b><br><br>
      <b>Wheat:</b> 4-6 irrigations — CRI(21 days), Tillering(42), Jointing(60), Heading(80), Grain filling(95), Milking(110)<br>
      <b>Rice:</b> Maintain 5cm standing water. Alternate wet-dry in vegetative stage saves 20% water.<br>
      <b>Cotton:</b> Every 10-15 days in vegetative, every 7-10 days in boll development<br>
      <b>Maize:</b> Every 10-12 days. Critical at tasseling and silking.<br><br>
      💡 <b>Drip Irrigation</b> saves 40-50% water + 30% fertilizer through fertigation. Apply for PM Micro Irrigation Fund subsidy.`,

      `🚿 <b>Water Saving Tips:</b><br><br>
      • Use tensiometer to measure soil moisture — irrigate only when needed<br>
      • Mulching (covering soil with straw) reduces water evaporation by 30%<br>
      • Irrigate in evening/night to reduce evaporation<br>
      • Drip + mulching together can save 60% water<br><br>
      📋 <b>PM Micro Irrigation Fund:</b> Get 55% subsidy on drip/sprinkler installation. Apply at your district agriculture office.`
    ]
  },
  scheme: {
    keywords: ['scheme','yojana','government','subsidy','loan','insurance','pmkisan','pmfby','kcc','rkvy','enam','sarkar'],
    responses: [
      `🏛️ <b>Important Government Schemes for Farmers:</b><br><br>
      <b>1. PM-KISAN:</b> ₹6000/year direct to bank account (₹2000 every 4 months). Register at pmkisan.gov.in<br><br>
      <b>2. PMFBY (Crop Insurance):</b> Pay only 2% premium for Kharif, 1.5% for Rabi crops. Covers losses from drought, flood, pest. Apply at nearest bank.<br><br>
      <b>3. KCC (Kisan Credit Card):</b> Crop loan at only 4% interest rate (7% - 3% govt subsidy). Apply at any bank with land documents.<br><br>
      <b>4. eNAM:</b> Sell crops online at better prices. Register at enam.gov.in<br><br>
      <b>5. Soil Health Card:</b> Free soil testing + fertilizer recommendation. Contact nearest KVK.`,

      `💰 <b>Loan & Financial Help:</b><br><br>
      <b>KCC Loan Limit:</b> Up to ₹3 lakh at 4% interest<br>
      <b>RKVY:</b> Infrastructure development funding<br>
      <b>NABARD:</b> Long-term farm loans at 7-9%<br>
      <b>SHG Loans:</b> Women farmer groups get special low-interest loans<br><br>
      <b>MSP 2024-25 (Key Crops):</b><br>
      • Wheat: ₹2275/quintal<br>
      • Paddy (Common): ₹2183/quintal<br>
      • Cotton (Medium): ₹7121/quintal<br>
      • Maize: ₹2225/quintal<br>
      • Soybean: ₹4892/quintal`
    ]
  },
  soil: {
    keywords: ['soil','mitti','ph','organic','compost','vermi','sandy','clay','loam'],
    responses: [
      `🌍 <b>Soil Health Guide:</b><br><br>
      <b>Ideal pH for crops:</b><br>
      • Wheat, Rice, Maize: 6.0-7.5<br>
      • Cotton: 6.5-8.0<br>
      • Vegetables: 6.0-7.0<br><br>
      <b>If soil pH is too acidic (below 6):</b> Apply lime (Chuna) 2-4 tonnes/ha<br>
      <b>If soil pH is too alkaline (above 8.5):</b> Apply Gypsum 2-3 tonnes/ha<br><br>
      💡 <b>Increase organic matter</b> by adding FYM 10t/ha every year. Improves water retention, aeration and nutrient availability.`,

      `♻️ <b>Organic Farming Tips:</b><br><br>
      <b>Vermicompost:</b> Apply 2-3 tonnes/ha. Rich in nutrients + improves soil structure.<br>
      <b>Green Manure:</b> Grow Dhaincha or Senji and plow into soil before cropping.<br>
      <b>Crop Residue Management:</b> Do NOT burn stubble — it kills beneficial microbes and causes air pollution. Instead, use Happy Seeder or rotavator.<br><br>
      <b>Biofertilizers:</b><br>
      • Rhizobium for legumes (soybean, groundnut)<br>
      • PSB (Phosphate Solubilizing Bacteria) for all crops<br>
      • Azotobacter for non-legume crops`
    ]
  },
  market: {
    keywords: ['market','price','mandi','sell','rate','bhav','enam','msp','minimum support'],
    responses: [
      `📈 <b>How to Get Best Price for Your Crop:</b><br><br>
      <b>1. eNAM Portal</b> (enam.gov.in): Sell online to buyers across India. Better price than local trader.<br>
      <b>2. APMC Mandi:</b> Sell directly at regulated market. Avoid middlemen.<br>
      <b>3. FPO (Farmer Producer Organization):</b> Join or form FPO for collective bargaining power.<br>
      <b>4. MSP Procurement:</b> Government buys at Minimum Support Price. Check nearest procurement center.<br><br>
      📱 <b>Apps for Price Info:</b><br>
      • Agmarknet app — daily mandi prices<br>
      • Kisan Suvidha app — govt services<br>
      • eNAM app — online trading`,
    ]
  },
  weather: {
    keywords: ['weather','rain','drought','flood','temperature','monsoon','mausam','barish','wind'],
    responses: [
      `🌦️ <b>Weather Advisory for Farmers:</b><br><br>
      <b>Check daily forecast:</b> imd.gov.in or Meghdoot app (specially for farmers)<br><br>
      <b>If drought expected:</b><br>
      • Switch to drought-tolerant varieties<br>
      • Apply mulching to conserve soil moisture<br>
      • Use drip irrigation<br><br>
      <b>If excess rain expected:</b><br>
      • Make drainage channels in field<br>
      • Do NOT apply fertilizers before heavy rain<br>
      • Apply fungicide spray after rain to prevent disease<br><br>
      📱 <b>Meghdoot App:</b> Download for location-specific 5-day agro-weather advisory. Available in Hindi.`
    ]
  }
};

function getResponse(userMsg) {
  const msg = userMsg.toLowerCase();

  // Check each topic
  for (const [topic, data] of Object.entries(KB)) {
    if (data.keywords.some(kw => msg.includes(kw))) {
      const responses = data.responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Greeting
  if (msg.match(/^(hi|hello|hey|namaste|namaskar|helo)/)) {
    return `🌾 <b>Namaste! KrishiMitra AI mein aapka swagat hai!</b><br><br>
    Main aapki in topics mein madad kar sakta hoon:<br>
    🌱 Fertilizer & Nutrition advice<br>
    🐛 Pest & Disease control<br>
    💧 Irrigation scheduling<br>
    🏛️ Government schemes (PM-KISAN, PMFBY, KCC)<br>
    📈 Market prices & selling tips<br>
    🌍 Soil health improvement<br>
    🌦️ Weather-based decisions<br><br>
    Koi bhi sawaal poochiye — Hindi ya English mein! 😊`;
  }

  // Hindi responses
  if (msg.match(/\b(kheti|fasal|beej|pani|khet|kisan)\b/)) {
    return `🌾 <b>Aapka sawaal samajh aa gaya!</b><br><br>
    KrishiMitra AI in topics par guide kar sakta hai:<br>
    • <b>Beej (Seeds):</b> Certified seeds lene ke liye nearest seed store ya KVK se contact karein<br>
    • <b>Keet niyantran:</b> Neem oil 5% spray sabse safe organic option hai<br>
    • <b>Sarkar ki yojanaein:</b> PM-KISAN (₹6000/saal), PMFBY crop insurance, KCC loan<br><br>
    📞 <b>Kisan Call Centre:</b> 1800-180-1551 (Free, 24x7, Hindi mein)`;
  }

  // Default response
  return `🤖 <b>KrishiMitra AI — Your Farming Assistant</b><br><br>
  I can help you with:<br>
  • <b>"fertilizer for wheat"</b> — get fertilizer recommendations<br>
  • <b>"pest control for cotton"</b> — pest management guide<br>
  • <b>"irrigation schedule"</b> — watering advice<br>
  • <b>"government schemes"</b> — PM-KISAN, PMFBY, KCC info<br>
  • <b>"soil health"</b> — improve your soil<br>
  • <b>"market price"</b> — where to sell at best price<br>
  • <b>"weather advisory"</b> — weather-based farming tips<br><br>
  📞 <b>Kisan Call Centre:</b> 1800-180-1551 (Free 24x7)<br>
  🌐 <b>Kisan Suvidha App:</b> Download for complete farm guide`;
}

// POST /api/chat/message
router.post('/message', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages array required.' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const lastMsg  = messages[messages.length - 1].content || '';
    const response = getResponse(lastMsg);

    // Stream response in chunks
    const chunks = response.match(/.{1,40}/g) || [response];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= chunks.length) {
        clearInterval(interval);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
      res.write(`data: ${JSON.stringify({ type: 'content_block_delta', delta: { text: chunks[i] } })}\n\n`);
      i++;
    }, 25);

  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
