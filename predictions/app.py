from flask import Flask, request, render_template, redirect, url_for
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import numpy as np
from sklearn.metrics import r2_score
app = Flask(__name__)

# Load the data and train the model
data = pd.read_excel('data-analysis.xlsx', sheet_name='Sheet1')
data['Distance_log']=np.log(data['Distance (m)'])
data['Maximum charge weight per delay (kg)_log']=np.log(data['Maximum charge weight per delay (kg)'])
data['PPV_log']=np.log(data['PPV'])
X = data[['Distance_log', 'Maximum charge weight per delay (kg)_log']]
y = data['PPV_log']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)
y_pred = model.predict(X_test)
y_pred_after_e=np.exp(y_pred)
y_test_after_e=np.exp(y_test)
r2 = r2_score(y_test_after_e, y_pred_after_e)
print(f'R2: {r2}')
# for i in 

def predict_ppv(distance, max_charge_weight):
    dist_log = np.log(distance)
    max_charge_weight_log = np.log(max_charge_weight)
    return np.exp(model.predict([[dist_log, max_charge_weight_log]])[0])

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        distance = float(request.form['distance'])
        max_charge_weight = float(request.form['max_charge_weight'])
        predicted_ppv = predict_ppv(distance, max_charge_weight)
        return redirect(url_for('result', predicted_ppv=predicted_ppv))
    return render_template('index.html')

@app.route('/result')
def result():
    predicted_ppv = request.args.get('predicted_ppv', type=float)
    return render_template('index.html', predicted_ppv=predicted_ppv)

if __name__ == '__main__':
    app.run(debug=True)
