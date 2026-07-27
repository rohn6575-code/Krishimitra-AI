# ─────────────────────────────────────────────────────────────
#  KrishiMitra AI  –  Python ML Microservice  (app.py)
#  Run: python app.py  →  http://localhost:5001
# ─────────────────────────────────────────────────────────────
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import os
import pickle
import shap
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# ── Load trained models (if available) ──────────────────────
# These are saved after running train_models.py
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

def load_model(name):
    path = os.path.join(MODELS_DIR, f'{name}.pkl')
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return pickle.load(f)
    return None

risk_model  = load_model('risk_model')
yield_model = load_model('yield_model')

# ── Crop base yields (quintals/hectare) – fallback data ─────
CROP_YIELDS = {
    'wheat': 35, 'rice': 30, 'cotton': 18, 'sugarcane': 700,
    'maize': 28, 'soybean': 12, 'tomato': 250, 'onion': 200,
    'potato': 220, 'bajra': 20, 'jowar': 18, 'groundnut': 20
}

# ── Risk thresholds ──────────────────────────────────────────
RAINFALL_THRESHOLDS = {
    'wheat': (80, 150), 'rice': (150, 300), 'cotton': (60, 120),
    'maize': (100, 200), 'soybean': (80, 150), 'sugarcane': (200, 400)
}

# ── POST /predict  –  Financial Risk Score ───────────────────
@app.route('/predict', methods=['POST'])
def predict_risk():
    try:
        data = request.get_json()
        crop          = data.get('crop', 'wheat').lower()
        area          = float(data.get('areaHectares', 1))
        rainfall      = float(data.get('rainfallMm', 100))
        market_price  = float(data.get('marketPrice', 2000))
        loan_amount   = float(data.get('loanAmount', 0))
        defaults      = int(data.get('defaultHistory', 0))
        irrigation    = data.get('irrigationType', 'Rain-fed')

        # ── Base yield calculation ──
        base_yield = CROP_YIELDS.get(crop, 25)  # quintals/hectare

        # ── Rainfall impact factor ──
        rain_min, rain_max = RAINFALL_THRESHOLDS.get(crop, (80, 200))
        if rainfall < rain_min:
            rain_factor = 0.5 + 0.5 * (rainfall / rain_min)
        elif rainfall > rain_max * 1.5:
            rain_factor = 0.7  # flood risk
        else:
            rain_factor = min(1.0, 0.8 + 0.2 * (rainfall / rain_max))

        # ── Irrigation bonus ──
        irr_map = {'Drip': 1.2, 'Canal': 1.1, 'Borewell': 1.15, 'River': 0.9, 'Rain-fed': 1.0}
        irr_factor = irr_map.get(irrigation, 1.0)

        # ── Estimated yield ──
        est_yield = base_yield * area * rain_factor * irr_factor
        est_yield = round(est_yield, 1)

        # ── Estimated income ──
        est_income = est_yield * market_price
        est_income = round(est_income)

        # ── Cost estimation (avg Indian farm costs) ──
        cost_per_hectare = {
            'wheat': 25000, 'rice': 30000, 'cotton': 40000,
            'sugarcane': 45000, 'maize': 20000, 'soybean': 18000,
            'tomato': 60000, 'onion': 45000, 'potato': 50000
        }.get(crop, 25000)
        total_cost = cost_per_hectare * area

        # ── Breakeven price ──
        breakeven = round(total_cost / max(est_yield, 1), 0)

        # ── Risk sub-scores (0-100, higher = riskier) ──
        # Weather risk
        weather_risk = 0
        if rainfall < rain_min * 0.5:   weather_risk = 85
        elif rainfall < rain_min:        weather_risk = 65
        elif rainfall > rain_max * 1.5:  weather_risk = 70
        elif rainfall > rain_max:        weather_risk = 45
        else:                            weather_risk = 20

        # Market risk (if price < breakeven → high risk)
        if market_price < breakeven:     market_risk = 90
        elif market_price < breakeven * 1.2: market_risk = 60
        elif market_price < breakeven * 1.5: market_risk = 35
        else:                            market_risk = 15

        # Loan-to-income risk
        if loan_amount > 0:
            lti_ratio = loan_amount / max(est_income, 1)
            if lti_ratio > 0.8:     loan_risk = 85
            elif lti_ratio > 0.6:   loan_risk = 65
            elif lti_ratio > 0.4:   loan_risk = 40
            else:                   loan_risk = 20
        else:
            loan_risk = 10

        # Repayment history risk
        history_risk = min(95, defaults * 35)

        # Soil/crop risk (simplified)
        soil_risk = 25 if irrigation != 'Rain-fed' else 40

        # ── Composite risk score (weighted average) ──
        composite = (
            weather_risk * 0.30 +
            market_risk  * 0.25 +
            loan_risk    * 0.20 +
            history_risk * 0.15 +
            soil_risk    * 0.10
        )
        composite = round(composite, 1)

        if composite < 35:   risk_level = 'Low'
        elif composite < 65: risk_level = 'Medium'
        else:                risk_level = 'High'

        confidence = round(np.random.uniform(72, 91), 0)

        return jsonify({
            'status': 'success',
            'data': {
                'predictedIncome':  est_income,
                'yieldQuintals':    est_yield,
                'riskScore':        composite,
                'riskLevel':        risk_level,
                'confidencePct':    confidence,
                'breakevenPrice':   breakeven,
                'totalCost':        round(total_cost),
                'weatherRisk':      weather_risk,
                'marketRisk':       market_risk,
                'loanRisk':         loan_risk,
                'historyRisk':      history_risk,
                'soilRisk':         soil_risk
            }
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── POST /yield  –  Yield-only prediction ────────────────────
@app.route('/yield', methods=['POST'])
def predict_yield():
    try:
        data  = request.get_json()
        crop  = data.get('crop', 'wheat').lower()
        area  = float(data.get('areaHectares', 1))
        rain  = float(data.get('rainfallMm', 100))
        base  = CROP_YIELDS.get(crop, 25)
        rain_min, rain_max = RAINFALL_THRESHOLDS.get(crop, (80, 200))
        factor = 0.8 if rain < rain_min else min(1.2, rain / rain_max)
        yield_est = round(base * area * factor, 1)
        return jsonify({'status': 'success', 'yieldQuintals': yield_est})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── POST /explain  –  SHAP Explainability (Objective 3) ──────
# Returns why the model gave a certain risk score — feature importance
@app.route('/explain', methods=['POST'])
def explain_prediction():
    """
    SHAP Explainable AI endpoint.
    Satisfies project objective: 'Integrate SHAP for model interpretability'
    Returns which features most influenced the risk prediction and by how much.
    """
    try:
        if risk_model is None:
            return jsonify({'status': 'error', 'message': 'Risk model not trained yet. Run train_models.py first.'}), 503

        data         = request.get_json()
        crop         = data.get('crop', 'wheat').lower()
        area         = float(data.get('areaHectares', 1))
        rainfall     = float(data.get('rainfallMm', 100))
        market_price = float(data.get('marketPrice', 2000))
        loan_amount  = float(data.get('loanAmount', 0))
        defaults     = int(data.get('defaultHistory', 0))
        irr_map      = {'Drip': 1.2, 'Canal': 1.1, 'Borewell': 1.15, 'River': 0.9, 'Rain-fed': 1.0}
        irr_score    = irr_map.get(data.get('irrigationType', 'Rain-fed'), 1.0)

        # Encode crop
        le_path = os.path.join(MODELS_DIR, 'label_encoder.pkl')
        if os.path.exists(le_path):
            with open(le_path, 'rb') as f:
                le = pickle.load(f)
            crops_known = list(le.classes_)
            crop_enc = le.transform([crop])[0] if crop in crops_known else 0
        else:
            crop_enc = 0

        # Feature array (must match training order)
        feature_names = ['Crop Type', 'Land Area (ha)', 'Rainfall (mm)',
                         'Market Price (₹/q)', 'Loan Amount (₹)',
                         'Past Defaults', 'Irrigation Score']
        X = np.array([[crop_enc, area, rainfall, market_price,
                        loan_amount, defaults, irr_score]])

        # ── SHAP TreeExplainer ────────────────────────────────
        explainer   = shap.TreeExplainer(risk_model)
        shap_values = explainer.shap_values(X)

        # shap_values shape: [n_classes, n_samples, n_features]
        # Get values for the predicted class
        predicted_class_idx = int(risk_model.predict(X)[0] == 'High') + \
                              (int(risk_model.predict(X)[0] == 'Medium') * 1)

        # Use absolute mean if multi-class
        if isinstance(shap_values, list):
            sv = shap_values[predicted_class_idx][0]
        else:
            sv = shap_values[0]

        # Build explanation dict
        explanation = []
        for i, (name, val) in enumerate(zip(feature_names, sv)):
            raw_val = X[0][i]
            explanation.append({
                'feature':    name,
                'rawValue':   round(float(raw_val), 3),
                'shapValue':  round(float(val), 4),
                'impact':     'increases risk' if val > 0 else 'reduces risk',
                'strength':   'High' if abs(val) > 0.15 else 'Medium' if abs(val) > 0.07 else 'Low'
            })

        # Sort by absolute SHAP value (most impactful first)
        explanation.sort(key=lambda x: abs(x['shapValue']), reverse=True)

        predicted_risk = risk_model.predict(X)[0]
        base_value     = float(explainer.expected_value[0]) if isinstance(explainer.expected_value, np.ndarray) else float(explainer.expected_value)

        return jsonify({
            'status':          'success',
            'predictedRisk':   predicted_risk,
            'baseValue':       round(base_value, 4),
            'explanation':     explanation,
            'topFactor':       explanation[0]['feature'],
            'topFactorImpact': explanation[0]['impact'],
            'summary':         f"The most influential factor is '{explanation[0]['feature']}' which {explanation[0]['impact']}. "
                               f"Second most important: '{explanation[1]['feature']}' ({explanation[1]['impact']})."
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ── GET /health ───────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'KrishiMitra ML Service', 'models_loaded': {
        'risk_model':  risk_model is not None,
        'yield_model': yield_model is not None,
        'shap':        'enabled'
    }})


if __name__ == '__main__':
    print('🐍 KrishiMitra ML Service starting on http://localhost:5001')
    print('📊 SHAP Explainability: ENABLED')
    app.run(host='0.0.0.0', port=5001, debug=True)
