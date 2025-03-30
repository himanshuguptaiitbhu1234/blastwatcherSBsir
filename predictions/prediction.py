import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Load the data
data = pd.read_excel('data-analysis.xlsx', sheet_name='Sheet1')

# Select relevant columns
X = data[['Distance (m)', 'Maximum charge weight per delay (kg)']]
y = data['PPV']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Predict on the test set
y_pred = model.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse}')

coefficients = model.coef_
intercept = model.intercept_

print(f'PPV = {intercept} + {coefficients[0]} * Distance + {coefficients[1]} * Maximum charge weight per delay')

def predict_ppv(distance, max_charge_weight):
    return model.predict([[distance, max_charge_weight]])[0]