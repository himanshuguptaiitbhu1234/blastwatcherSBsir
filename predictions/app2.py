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
from bson import ObjectId

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Initialize Flask app
app = Flask(__name__)
# CORS(app, resources={
#     r"/*": {"origins": "*"}  # For development only, restrict in production
# })
CORS(app)

# Connect to MongoDB
try:
    client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client["blast_db"]
    measurements_collection = db["measurements"]
    predictions_collection = db["predictions"]
    training_data_collection = db["training_data"]
    print("✅ Connected to MongoDB successfully.")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")

# Global model variable
model = None
current_training_count = 0

def prepare_training_data():
    """Fetch training data from MongoDB and prepare it for model training"""
    try:
        training_data = list(training_data_collection.find({}))
        
        if not training_data:
            print("⚠️ No training data available in MongoDB")
            return None, None, None
        
        df = pd.DataFrame(training_data)
        
        # Apply logarithmic transformations
        df['Distance_log'] = np.log(df['Distance (m)'])
        df['Max_Charge_log'] = np.log(df['Maximum charge weight per delay (kg)'])
        df['PPV_log'] = np.log(df['PPV'])
        
        X = df[['Distance_log', 'Max_Charge_log']]
        y = df['PPV_log']
        
        return X, y, df
    
    except Exception as e:
        print(f"❌ Error preparing training data: {e}")
        return None, None, None

def train_model():
    """Train or retrain the model with current data"""
    global model, current_training_count
    
    X, y, df = prepare_training_data()
    if X is None or y is None:
        print("⚠️ Not enough data to train model")
        model = None
        current_training_count = 0
        return False
    
    if len(X) == current_training_count:
        return True
    
    try:
        test_size = 0.2 if len(X) > 10 else 0.0
        if test_size > 0.0:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=42)
        else:
            X_train, y_train = X, y
            X_test, y_test = None, None
        
        new_model = LinearRegression()
        new_model.fit(X_train, y_train)
        
        if X_test is not None and y_test is not None:
            # print("hi")
            y_pred = new_model.predict(X_test)
            y_pred_after_exp = np.exp(y_pred)
            y_test_after_exp = np.exp(y_test)
            r2 = r2_score(y_test_after_exp, y_pred_after_exp)
            print(f'📊 Model R² Score: {r2:.4f} (Trained on {len(X_train)} samples)')
        
        model = new_model
        current_training_count = len(X)
        return True
    
    except Exception as e:
        print(f"❌ Model training failed: {e}")
        model = None
        return False

# Initial model training
train_model()

def predict_ppv(distance, max_charge_weight):
    if model is None:
        print("⚠️ Model not trained - cannot make predictions")
        return None
    
    try:
        dist_log = np.log(float(distance))
        max_charge_weight_log = np.log(float(max_charge_weight))
        return float(np.exp(model.predict([[dist_log, max_charge_weight_log]])[0]))

    except Exception as e:
        print("❌ Prediction error:", e)
        return None

def predict_sd(distance, max_charge_weight):
    try:
        sd = float(distance) / (float(max_charge_weight) ** 0.5)
        return sd
    except Exception as e:
        print("Error in predicting sd", e)
        return None

@app.route('/save-measurement', methods=['POST'])
def save_measurement():
    try:
        data = request.get_json()
        
        # Required fields validation
        required_fields = ['mine', 'measuredPPV', 'distancefromblast', 'chargeWeight']
        for field in required_fields:
            if field not in data or data[field] is None:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Prepare measurement data
        measurement_data = {
            "mine": data["mine"],
            "date": data.get("date", ""),
            "time": data.get("time", ""),
            "location": data.get("location", ""),
            "measuredPPV": float(data["measuredPPV"]),
            "notes": data.get("notes", ""),
            "timestamp": datetime.now().isoformat(),
            "distancefromblast": float(data["distancefromblast"]),
            "chargeWeight": float(data["chargeWeight"]),
            "drilldia": float(data.get("drilldia", 0)) if data.get("drilldia") else None,
            "bench": float(data.get("bench", 0)) if data.get("bench") else None,
            "burden": float(data.get("burden", 0)) if data.get("burden") else None,
            "spacing": float(data.get("spacing", 0)) if data.get("spacing") else None,
            "stemming": float(data.get("stemming", 0)) if data.get("stemming") else None,
            "subgrade": float(data.get("subgrade", 0)) if data.get("subgrade") else None,
            "holesperrow": float(data.get("holesperrow", 0)) if data.get("holesperrow") else None,
            "noofrows": float(data.get("noofrows", 0)) if data.get("noofrows") else None,
            "explosivecharge": float(data.get("explosivecharge", 0)) if data.get("explosivecharge") else None,
            "Explosivetype": data.get("Explosivetype", ""),
            "Delaybetweenholes": float(data.get("Delaybetweenholes", 0)) if data.get("Delaybetweenholes") else None,
            "Delaybetweenrows": float(data.get("Delaybetweenrows", 0)) if data.get("Delaybetweenrows") else None,
            "frequency": float(data.get("frequency", 0)) if data.get("frequency") else None,
            "isSubmitting": False
        }
        
        # Insert into measurements collection
        result = measurements_collection.insert_one(measurement_data)

        # Add to training data
        training_doc = {
            'Distance (m)': float(data["distancefromblast"]),
            'Maximum charge weight per delay (kg)': float(data["chargeWeight"]),
            'PPV': float(data["measuredPPV"]),
            'timestamp': datetime.now(),
            'source_measurement_id': result.inserted_id
        }
        training_data_collection.insert_one(training_doc)
        
        # Retrain model
        train_model()

        return jsonify({
            'success': True,
            'message': 'Measurement saved successfully',
            'inserted_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not trained - please add training data first'}), 400
            
        data = request.get_json()
        distance = data.get('distance', 0)
        max_charge_weight = data.get('maxChargeWeight', 0)

        if float(distance) <= 0 or float(max_charge_weight) <= 0:
            return jsonify({'error': 'Invalid input values'}), 400

        predicted_ppv = predict_ppv(distance, max_charge_weight)
        predicted_sd = predict_sd(distance, max_charge_weight)

        if predicted_ppv is None or predicted_sd is None:
            return jsonify({'error': 'Prediction failed'}), 500

        prediction_data = {
            "selected_mine": data.get("selectedMine", ""),
            "Distance from Blast Site (m)": float(distance),
            "Maximum Charge Weight per Delay (kg)": float(max_charge_weight),
            "predicted_ppv": predicted_ppv,
            "SD": predicted_sd,
            "timestamp": datetime.now().isoformat()
        }

        try:
            predictions_collection.insert_one(prediction_data)
        except Exception as e:
            print(f"❌ MongoDB Insert Error: {e}")

        return jsonify({
            'success': True,
            'predicted_ppv': predicted_ppv, 
            'predicted_sd': predicted_sd,
            'training_data_count': current_training_count
        })

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/get-blast-history', methods=['GET'])
def get_blast_history():
    try:
        mine_name = request.args.get('mine')
        if not mine_name:
            return jsonify({'error': 'Mine name is required'}), 400
        
        measurements = list(measurements_collection.find(
            {"mine": mine_name},
            {"_id": 0, "mine": 1, "date": 1, "time": 1, "location": 1, "measuredPPV": 1, "notes": 1, "distancefromblast": 1, "drilldia": 1, "bench": 1, "burden": 1, "spacing": 1, "stemming": 1, "holesPerRow": 1, "noOfRows": 1, "explosiveCharge": 1, "explosiveType": 1, "delayBetweenHoles": 1, "delayBetweenRows": 1, "frequency": 1, "chargeWeight": 1}
        ).sort("date", -1))
        
        return jsonify({
            'success': True,
            'data': measurements
        })
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
    
@app.route('/delete-blast-record', methods=['DELETE'])
def delete_blast_record():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        mine = data.get('mine')
        date = data.get('date')
        time = data.get('time', '')
        location = data.get('location')
        
        if not all([mine, date, location]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
            
        query = {
            "mine": mine,
            "date": date,
            "location": location
        }
        
        if time:
            query["time"] = time
            
        result = measurements_collection.delete_one(query)
        
        if result.deleted_count == 0:
            return jsonify({
                'success': False,
                'error': 'Record not found',
                'deleted_count': 0
            }), 404
            
        return jsonify({
            'success': True,
            'message': 'Record deleted successfully',
            'deleted_count': result.deleted_count
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500


@app.route('/get-training-data', methods=['GET'])
def get_training_data():
    try:
        data = list(training_data_collection.find({}, {'_id': 0, 'timestamp': 0}))
        return jsonify({
            'success': True,
            'data': data,
            'count': len(data)
        })
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)