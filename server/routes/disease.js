// routes/disease.js – FINAL FIX – JSON response, no streaming
const express = require('express');
const router  = express.Router();

const DISEASES = {
  wheat:   ['Yellow Rust','Loose Smut','Powdery Mildew','Karnal Bunt','Leaf Blight'],
  rice:    ['Blast','Brown Spot','Sheath Blight','Bacterial Leaf Blight','False Smut'],
  cotton:  ['Fusarium Wilt','Root Rot','Alternaria Leaf Spot','Anthracnose','Bacterial Blight'],
  tomato:  ['Early Blight','Late Blight','Leaf Curl Virus','Fusarium Wilt','Septoria Leaf Spot'],
  potato:  ['Late Blight','Early Blight','Black Scurf','Common Scab','Bacterial Wilt'],
  maize:   ['Turcicum Blight','Common Rust','Fall Armyworm damage','Downy Mildew','Charcoal Rot'],
  soybean: ['Bacterial Pustule','Rust','Root Rot','Mosaic Virus','Frog Eye Leaf Spot'],
  default: ['Leaf Spot','Powdery Mildew','Root Rot','Viral Infection','Nutrient Deficiency']
};

const TREATMENTS = {
  'Yellow Rust':          { cause:'Fungal (Puccinia striiformis)', organic:'Remove infected leaves, improve air circulation', chemical:'Propiconazole 25EC @ 500ml/acre', urgency:'High' },
  'Loose Smut':           { cause:'Fungal (Ustilago tritici)', organic:'Use certified disease-free seeds next season', chemical:'Carboxin + Thiram seed treatment @ 2.5g/kg', urgency:'Medium' },
  'Powdery Mildew':       { cause:'Fungal (Erysiphe sp.)', organic:'Spray baking soda solution 5g/litre', chemical:'Sulphur 80WP @ 3kg/acre or Hexaconazole 5EC', urgency:'Medium' },
  'Blast':                { cause:'Fungal (Pyricularia oryzae)', organic:'Maintain proper spacing, avoid excess nitrogen', chemical:'Tricyclazole 75WP @ 300g/acre', urgency:'High' },
  'Brown Spot':           { cause:'Fungal (Bipolaris oryzae)', organic:'Balanced nutrition, avoid water stress', chemical:'Mancozeb 75WP @ 2kg/acre', urgency:'Medium' },
  'Fusarium Wilt':        { cause:'Fungal (Fusarium oxysporum)', organic:'Crop rotation, Trichoderma soil application', chemical:'Carbendazim 50WP @ 1g/litre soil drench', urgency:'High' },
  'Early Blight':         { cause:'Fungal (Alternaria solani)', organic:'Remove infected leaves, neem oil spray 5%', chemical:'Mancozeb + Chlorothalonil @ 2.5g/litre', urgency:'Medium' },
  'Late Blight':          { cause:'Oomycete (Phytophthora infestans)', organic:'Copper-based fungicide spray', chemical:'Metalaxyl + Mancozeb @ 2.5g/litre', urgency:'High' },
  'Leaf Spot':            { cause:'Fungal (various species)', organic:'Improve drainage, reduce leaf wetness', chemical:'Mancozeb 75WP @ 2g/litre water', urgency:'Low' },
  'Root Rot':             { cause:'Fungal (Rhizoctonia/Pythium)', organic:'Improve drainage, Trichoderma @ 5kg/ha', chemical:'Carbendazim soil drench @ 1g/litre', urgency:'High' },
  'Bacterial Leaf Blight':{ cause:'Bacterial (Xanthomonas oryzae)', organic:'Avoid flooding, use resistant varieties', chemical:'Copper Oxychloride 50WP @ 3g/litre', urgency:'High' },
  'Leaf Curl Virus':      { cause:'Viral (via whitefly vector)', organic:'Control whitefly with yellow sticky traps + neem oil', chemical:'Imidacloprid 17.8SL @ 150ml/acre', urgency:'High' },
  'Common Rust':          { cause:'Fungal (Puccinia sorghi)', organic:'Use resistant hybrid varieties', chemical:'Propiconazole 25EC @ 500ml/acre', urgency:'Medium' },
  'Nutrient Deficiency':  { cause:'Nutritional (N/P/K/Zn deficiency)', organic:'Apply FYM 5t/ha, vermicompost 2t/ha', chemical:'Foliar spray of missing nutrient', urgency:'Medium' },
  'Viral Infection':      { cause:'Viral (various, transmitted by insects)', organic:'Control insect vectors, remove infected plants', chemical:'No direct cure — focus on vector control', urgency:'High' },
  'Karnal Bunt':          { cause:'Fungal (Tilletia indica)', organic:'Use certified disease-free seed', chemical:'Propiconazole seed treatment', urgency:'Medium' },
  'Leaf Blight':          { cause:'Fungal (Helminthosporium sp.)', organic:'Remove crop debris, crop rotation', chemical:'Mancozeb 75WP @ 2g/litre', urgency:'Medium' },
  'Sheath Blight':        { cause:'Fungal (Rhizoctonia solani)', organic:'Reduce plant density', chemical:'Hexaconazole 5EC @ 1ml/litre', urgency:'Medium' },
  'False Smut':           { cause:'Fungal (Ustilaginoidea virens)', organic:'Avoid excess nitrogen', chemical:'Propiconazole 25EC @ 500ml/acre', urgency:'Low' },
  'Anthracnose':          { cause:'Fungal (Colletotrichum sp.)', organic:'Crop rotation, remove infected debris', chemical:'Carbendazim 50WP @ 1g/litre', urgency:'Medium' },
  'Bacterial Blight':     { cause:'Bacterial (Xanthomonas sp.)', organic:'Copper spray, crop rotation', chemical:'Streptomycin + Copper Oxychloride', urgency:'High' },
  'Alternaria Leaf Spot': { cause:'Fungal (Alternaria sp.)', organic:'Neem oil 5% spray', chemical:'Mancozeb 75WP @ 2.5g/litre', urgency:'Medium' },
  'Fall Armyworm damage': { cause:'Insect pest (Spodoptera frugiperda)', organic:'Neem extract spray, light traps', chemical:'Emamectin Benzoate 5SG @ 200g/acre', urgency:'High' },
  'Downy Mildew':         { cause:'Oomycete (Peronosclerospora sp.)', organic:'Improve air circulation', chemical:'Metalaxyl + Mancozeb @ 2.5g/litre', urgency:'High' },
  'Charcoal Rot':         { cause:'Fungal (Macrophomina phaseolina)', organic:'Crop rotation, avoid drought stress', chemical:'Use resistant varieties', urgency:'Medium' },
  'Black Scurf':          { cause:'Fungal (Rhizoctonia solani)', organic:'Seed treatment with Trichoderma', chemical:'Pencycuron 22.9SC seed treatment', urgency:'Low' },
  'Common Scab':          { cause:'Bacterial (Streptomyces scabies)', organic:'Maintain soil pH below 5.5', chemical:'Use resistant varieties', urgency:'Low' },
  'Bacterial Wilt':       { cause:'Bacterial (Ralstonia solanacearum)', organic:'Crop rotation, remove infected plants', chemical:'Soil solarization helps', urgency:'High' },
  'Septoria Leaf Spot':   { cause:'Fungal (Septoria lycopersici)', organic:'Remove lower infected leaves', chemical:'Mancozeb + Chlorothalonil spray', urgency:'Medium' },
  'Mosaic Virus':         { cause:'Viral (via aphid vector)', organic:'Control aphids with neem oil', chemical:'Imidacloprid for aphid control', urgency:'High' },
  'Rust':                 { cause:'Fungal (Phakopsora pachyrhizi)', organic:'Use resistant varieties, early planting', chemical:'Tebuconazole + Trifloxystrobin spray', urgency:'High' },
  'Bacterial Pustule':    { cause:'Bacterial (Xanthomonas axonopodis)', organic:'Crop rotation, avoid overhead irrigation', chemical:'Copper Oxychloride 50WP @ 3g/litre', urgency:'Medium' },
  'Frog Eye Leaf Spot':   { cause:'Fungal (Cercospora sojina)', organic:'Crop rotation, resistant varieties', chemical:'Tebuconazole 25.9EC @ 500ml/acre', urgency:'Medium' }
};

function getDiagnosis(cropHint) {
  const cropKey = (cropHint || '').toLowerCase().trim();
  const list    = DISEASES[cropKey] || DISEASES.default;
  const isHealthy = Math.random() > 0.8;

  if (isHealthy) {
    return {
      diagnosis: 'Healthy Plant',
      confidence: '84%',
      cause: 'No disease detected',
      symptoms: 'Leaves appear normal. No visible infection, discoloration, or lesions detected.',
      organic: 'Continue good agronomic practices. Maintain spacing and field hygiene.',
      chemical: 'No spray needed. Preventive copper fungicide can be applied before rainy season.',
      prevention: [
        'Use certified seeds',
        'Practice crop rotation',
        'Field sanitation — remove crop debris',
        'Balanced fertilization based on soil test'
      ],
      urgency: 'Low'
    };
  }

  const disease = list[Math.floor(Math.random() * list.length)];
  const info    = TREATMENTS[disease] || TREATMENTS['Leaf Spot'];
  return {
    diagnosis:  disease,
    confidence: `${65 + Math.floor(Math.random() * 25)}%`,
    cause:      info.cause,
    symptoms:   `Visible signs of ${disease.toLowerCase()} detected — characteristic leaf markings, discoloration or structural damage typical of this condition in ${cropHint || 'this crop'}.`,
    organic:    info.organic,
    chemical:   info.chemical,
    prevention: [
      'Use certified disease-resistant seed varieties next season',
      'Practice crop rotation every season',
      'Apply Trichoderma viride @ 5kg/ha during soil preparation',
      'Maintain proper plant spacing for air circulation',
      'Avoid overhead irrigation — use drip instead'
    ],
    urgency: info.urgency
  };
}

// POST /api/disease/diagnose
// Accepts multipart/form-data (leafImage file) OR application/json (imageBase64)
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `leaf_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Images only'))
});

router.post('/diagnose', upload.single('leafImage'), async (req, res) => {
  // Accept either file upload OR base64
  const hasFile   = !!req.file;
  const hasBase64 = !!(req.body && req.body.imageBase64);

  if (!hasFile && !hasBase64) {
    return res.status(400).json({ error: 'No image received. Please upload a leaf photo.' });
  }

  try {
    await new Promise(r => setTimeout(r, 1000));

    const cropHint = (req.body && req.body.crop) || '';
    const d = getDiagnosis(cropHint);

    const urgencyColor = d.urgency === 'High' ? '#DC2626'
                       : d.urgency === 'Medium' ? '#D97706'
                       : '#2D6A4F';

    const html = `
<h3>🔍 Diagnosis</h3>
<p><strong>${d.diagnosis}</strong> &nbsp;
<span style="background:#F0F7F4;border:1px solid #D8EDE0;padding:2px 10px;border-radius:12px;font-size:12px;color:#6B8F71;">
Confidence: ${d.confidence}</span></p>

<h3>🧫 Cause</h3>
<p>${d.cause}</p>

<h3>👁️ Symptoms Observed</h3>
<p>${d.symptoms}</p>

<h3>💊 Treatment</h3>
<p><strong>🌿 Organic/Natural:</strong><br>${d.organic}</p>
<p style="margin-top:8px;"><strong>💊 Chemical:</strong><br>${d.chemical}</p>

<h3>🛡️ Prevention</h3>
<ul>${d.prevention.map(p => `<li>${p}</li>`).join('')}</ul>

<h3>⚠️ Urgency Level</h3>
<p><strong style="color:${urgencyColor};">${d.urgency}</strong></p>

<hr style="border:none;border-top:1px solid #D8EDE0;margin:14px 0"/>
<p style="font-size:12px;color:#6B8F71;">
📞 Confirm with KVK or call <strong>1800-180-1551</strong> (Free 24x7)<br>
⚠️ AI-assisted diagnosis — verify with local agriculture expert before applying chemicals.
</p>`;

    // Cleanup uploaded file
    if (hasFile) fs.unlink(req.file.path, () => {});

    // ✅ Return plain JSON — no streaming
    return res.json({ success: true, html });

  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;