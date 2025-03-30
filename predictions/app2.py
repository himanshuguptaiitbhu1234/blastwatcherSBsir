from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import numpy as np
import pymongo
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# Connect to MongoDB
try:
    client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["blast_db"]
    measurements_collection = db["measurements"]
    predictions_collection = db["predictions"]
    print("✅ Connected to MongoDB successfully.")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")

# Load data and train model
data = pd.read_excel('data-analysis.xlsx', sheet_name='Sheet1')
data['Distance_log'] = np.log(data['Distance (m)'])
data['Max_Charge_log'] = np.log(data['Maximum charge weight per delay (kg)'])
data['PPV_log'] = np.log(data['PPV'])

X = data[['Distance_log', 'Max_Charge_log']]
y = data['PPV_log']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

# Model evaluation
y_pred = model.predict(X_test)
y_pred_after_exp = np.exp(y_pred)
y_test_after_exp = np.exp(y_test)
r2 = r2_score(y_test_after_exp, y_pred_after_exp)
print(f'📊 Model R² Score: {r2:.4f}')

# Helper functions
def predict_ppv(distance, max_charge_weight):
    try:
        dist_log = np.log(distance)
        max_charge_weight_log = np.log(max_charge_weight)
        return float(np.exp(model.predict([[dist_log, max_charge_weight_log]])[0]))
    except Exception as e:
        print("❌ Prediction error:", e)
        return None

def predict_sd(distance, max_charge_weight):
    try:
        sd = distance / (max_charge_weight ** 0.5)
        return sd
    except Exception as e:
        print("Error in predicting sd", e)
        return None

# API Routes
@app.route('/get-blast-history', methods=['GET'])
def get_blast_history():
    try:
        mine_name = request.args.get('mine')
        if not mine_name:
            return jsonify({'error': 'Mine name is required'}), 400
        
        measurements = list(measurements_collection.find(
            {"mine": mine_name},
            {"_id": 0, "mine": 1, "date": 1, "time": 1, "location": 1, "measuredPPV": 1, "notes": 1}
        ))
        
        return jsonify({
            'success': True,
            'data': measurements
        })
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/save-measurement', methods=['POST'])
def save_measurement():
    try:
        data = request.get_json()
        
        required_fields = ['mine', 'date', 'time', 'location', 'measuredPPV']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        measurement_data = {
            "mine": data["mine"],
            "date": data["date"],
            "time": data["time"],
            "location": data["location"],
            "measuredPPV": float(data["measuredPPV"]),
            "notes": data.get("notes", ""),
            "timestamp": datetime.now().isoformat()
        }
        
        result = measurements_collection.insert_one(measurement_data)
        
        return jsonify({
            'message': 'Measurement saved successfully',
            'inserted_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        distance = float(data.get('distance', 0))
        max_charge_weight = float(data.get('maxChargeWeight', 0))

        if distance <= 0 or max_charge_weight <= 0:
            return jsonify({'error': 'Invalid input values'}), 400

        predicted_ppv = predict_ppv(distance, max_charge_weight)
        predicted_sd = predict_sd(distance, max_charge_weight)

        if predicted_ppv is None or predicted_sd is None:
            return jsonify({'error': 'Prediction failed'}), 500

        prediction_data = {
            "selected_mine": data.get("selectedMine", ""),
            "Distance from Blast Site (m)": distance,
            "Maximum Charge Weight per Delay (kg)": max_charge_weight,
            "Burden (m)": float(data.get("burden", 0)),
            "Spacing (m)": float(data.get("spacing", 0)),
            "Depth (m)": float(data.get("depth", 0)),
            "Stemming (m)": float(data.get("stemming", 0)),
            "Total Charge Length (m)": float(data.get("totalChargeLength", 0)),
            "Explosive per Hole (kg)": float(data.get("explosivePerHole", 0)),
            "Total Amount of Explosive (kg)": float(data.get("totalExplosive", 0)),
            "Total Rock Blasted (tonnes)": float(data.get("totalRockBlasted", 0)),
            "Powder Factor (ton/kg)": float(data.get("powderFactor", 0)),
            "Frequency (Hz)": float(data.get("frequency", 0)),
            "predicted_ppv": predicted_ppv,
            "SD": predicted_sd,
            "timestamp": datetime.now().isoformat()
        }

        try:
            result = predictions_collection.insert_one(prediction_data)
            print(f"✅ Prediction data saved with ID: {result.inserted_id}")
        except Exception as e:
            print(f"❌ MongoDB Insert Error: {e}")

        return jsonify({
            'predicted_ppv': predicted_ppv, 
            'predicted_sd': predicted_sd
        })

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    


if __name__ == '__main__':
    app.run(debug=True, port=5000)