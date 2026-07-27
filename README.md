# 🌾 KrishiMitra AI – Complete Setup Guide

## Project Structure
```
krishimitra/
├── client/           ← Frontend HTML (open in VS Code Live Server)
│   └── index.html    ← UPDATED frontend that calls your backend
├── server/           ← Node.js + Express Backend
│   ├── server.js
│   ├── .env          ← ADD YOUR API KEYS HERE
│   ├── routes/
│   │   ├── auth.js
│   │   ├── income.js
│   │   ├── advisory.js
│   │   ├── chat.js
│   │   ├── disease.js
│   │   └── farmer.js
│   ├── models/
│   │   ├── Farmer.js
│   │   └── RiskAssessment.js
│   └── middleware/
│       └── auth.js
└── ml-service/       ← Python Flask ML Service
    ├── app.py
    ├── train_models.py
    └── requirements.txt
```

---

## ⚡ STEP 1 – Install Node.js Backend

```bash
# Go to server folder
cd server

# Install dependencies
npm install

# Edit .env file and add your keys:
# ANTHROPIC_API_KEY=sk-ant-your-key-here
# MONGO_URI=mongodb://localhost:27017/krishimitra
```

---

## ⚡ STEP 2 – Install & Start MongoDB

Download from: https://www.mongodb.com/try/download/community

```bash
# Or use MongoDB Atlas (free cloud) at https://cloud.mongodb.com
# Then set MONGO_URI in .env to your Atlas connection string
```

---

## ⚡ STEP 3 – Start Node Server

```bash
cd server
npm run dev       # development (auto-restart)
# OR
npm start         # production
```

Server starts at → http://localhost:5000
Test it: http://localhost:5000/api/health

---

## ⚡ STEP 4 – Setup Python ML Service (Optional)

```bash
cd ml-service

# Install Python packages
pip install -r requirements.txt

# Train the ML models first (run once)
python train_models.py

# Start Flask service
python app.py
```

ML Service starts at → http://localhost:5001

---

## ⚡ STEP 5 – Run Frontend

Open `client/index.html` in VS Code with Live Server
→ It connects to Node backend at http://localhost:5000

---

## 🔑 API Keys You Need

| Key | Where to Get |
|-----|-------------|
| ANTHROPIC_API_KEY | https://console.anthropic.com |
| WEATHER_API_KEY | https://openweathermap.org/api (free) |
| MONGO_URI | Local MongoDB or MongoDB Atlas (free) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register farmer |
| POST | /api/auth/login | Login |
| POST | /api/income/predict | Income + risk prediction |
| POST | /api/advisory/get | Streaming crop advisory |
| POST | /api/chat/message | Streaming AI chat |
| POST | /api/disease/diagnose | Leaf disease diagnosis |
| GET  | /api/health | Server health check |

---

## 🚀 Quick Test (using curl)

```bash
# Test income prediction
curl -X POST http://localhost:5000/api/income/predict \
  -H "Content-Type: application/json" \
  -d '{"crop":"Wheat","areaHectares":2,"rainfallMm":120,"marketPrice":2000}'
```
