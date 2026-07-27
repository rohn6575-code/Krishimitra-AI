// ─────────────────────────────────────────────
//  KrishiMitra AI  –  Express Server (server.js)
// ─────────────────────────────────────────────
require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const authRoutes     = require('./routes/auth');
const farmerRoutes   = require('./routes/farmer');
const incomeRoutes   = require('./routes/income');
const advisoryRoutes = require('./routes/advisory');
const diseaseRoutes  = require('./routes/disease');
const mandiRoutes    = require('./routes/mandi');
const chatRoutes     = require('./routes/chat');
const shapRoutes     = require('./routes/shap');


const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/api/mandi', mandiRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Rate Limiting ───────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,
  message: { error: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

// ── MongoDB Connection ──────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/krishimitra')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ── Routes ──────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/farmer',   farmerRoutes);
app.use('/api/income',   incomeRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/api/disease',  diseaseRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/shap',     shapRoutes);

// ── Health check ────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KrishiMitra AI Backend',
    timestamp: new Date().toISOString()
  });
});

// ── 404 handler ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 KrishiMitra AI server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
