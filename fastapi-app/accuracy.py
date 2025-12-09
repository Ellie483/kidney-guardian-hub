# kidney_accuracy_test.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# 1. Load dataset
df = pd.read_csv("./4. Fourth part (9001 to 12095).csv")

# 2. Drop extra unnamed columns (if any)
df = df.drop(columns=[col for col in df.columns if "Unnamed" in col])

# 3. Split features (X) and target (y)
X = df.drop(columns=["target"])
y = df["target"]

# 4. Encode categorical variables (turn strings into numbers)
X_encoded = pd.get_dummies(X)

# 5. Train/test split (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(
    X_encoded, y, test_size=0.2, random_state=42
)

# 6. Train Decision Tree
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

# 7. Predict
y_pred = model.predict(X_test)

# 8. Evaluate
print("✅ Accuracy:", accuracy_score(y_test, y_pred))
print("\n📊 Classification Report:\n", classification_report(y_test, y_pred))
print("\n🔍 Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
