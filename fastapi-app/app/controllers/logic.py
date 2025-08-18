import pandas as pd

def hello():
    return {"message": "Hello from FastAPI controller"}

def analyze(data):
    df = pd.DataFrame(data.values)
    summary = df.describe().to_dict()
    return {"summary": summary}
