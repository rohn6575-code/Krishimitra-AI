# ─────────────────────────────────────────────────────────────
#  train_models.py  –  Train & Save KrishiMitra ML Models
#  Run once: python train_models.py
# ─────────────────────────────────────────────────────────────
import numpy as np
import pandas as pd
import pickle
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, mean_absolute_error

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(MODELS_DIR, exist_ok=True)

print("📊 Generating synthetic training data...")

np.random.seed(42)
N = 5000  # training samples

crops = ['wheat', 'rice', 'cotton', 'maize', 'soybean', 'sugarcane', 'tomato', 'onion']
le_crop = LabelEncoder()

# ── Generate synthetic dataset ───────────────────────────────
data = []
for _ in range(N):
    crop = np.random.choice(crops)
    area = np.random.uniform(0.5, 20)
    rainfall = np.random.uniform(20, 500)
    market_price = np.random.uniform(800, 6000)
    loan_amount = np.random.uniform(0, 200000)
    defaults = np.random.choice([0, 1, 2, 3], p=[0.6, 0.25, 0.1, 0.05])
    irrigation_score = np.random.uniform(0.7, 1.3)

    # Simulate crop yield
    base_yield = {'wheat':35,'rice':30,'cotton':18,'maize':28,'soybean':12,
                  'sugarcane':700,'tomato':250,'onion':200}[crop]
    yield_q = base_yield * area * np.random.uniform(0.7, 1.2)
    income = yield_q * market_price
    cost = np.random.uniform(15000, 50000) * area
    profit = income - cost

    # Risk label
    lti = loan_amount / max(income, 1)
    if profit < 0 or lti > 0.8 or defaults >= 2:
        risk = 'High'
    elif lti > 0.5 or defaults == 1 or rainfall < 50:
        risk = 'Medium'
    else:
        risk = 'Low'

    data.append({
        'crop': crop, 'area': area, 'rainfall': rainfall,
        'market_price': market_price, 'loan_amount': loan_amount,
        'defaults': defaults, 'irrigation_score': irrigation_score,
        'yield_q': yield_q, 'income': income, 'risk': risk
    })

df = pd.DataFrame(data)
df['crop_enc'] = le_crop.fit_transform(df['crop'])

# ── Risk Classification Model ────────────────────────────────
print("🤖 Training Risk Classification Model (Random Forest)...")
features_clf = ['crop_enc','area','rainfall','market_price','loan_amount','defaults','irrigation_score']
X = df[features_clf]
y = df['risk']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
risk_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
risk_model.fit(X_train, y_train)
acc = accuracy_score(y_test, risk_model.predict(X_test))
print(f"  ✅ Risk model accuracy: {acc:.2%}")

# ── Yield Regression Model ───────────────────────────────────
print("🌾 Training Yield Prediction Model (Gradient Boosting)...")
features_reg = ['crop_enc','area','rainfall','irrigation_score']
Xr = df[features_reg]
yr = df['yield_q']

Xr_train, Xr_test, yr_train, yr_test = train_test_split(Xr, yr, test_size=0.2, random_state=42)
yield_model = GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
yield_model.fit(Xr_train, yr_train)
mae = mean_absolute_error(yr_test, yield_model.predict(Xr_test))
print(f"  ✅ Yield model MAE: {mae:.2f} quintals")

# ── Save models ──────────────────────────────────────────────
with open(os.path.join(MODELS_DIR, 'risk_model.pkl'), 'wb') as f:
    pickle.dump(risk_model, f)
with open(os.path.join(MODELS_DIR, 'yield_model.pkl'), 'wb') as f:
    pickle.dump(yield_model, f)
with open(os.path.join(MODELS_DIR, 'label_encoder.pkl'), 'wb') as f:
    pickle.dump(le_crop, f)

print("\n🎉 Models saved to ml-service/models/")
print("   → risk_model.pkl")
print("   → yield_model.pkl")
print("   → label_encoder.pkl")
print("\nNow run: python app.py")
