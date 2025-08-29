import pandas as pd
from app.db import db
from bson import ObjectId
import numpy as np


def hello():
    return {"message": "Hello from FastAPI controller"}

def analyze(data):
    df = pd.DataFrame(data.values)
    summary = df.describe().to_dict()
    return {"summary": summary}



def serialize_patient(patient):
    patient["_id"] = str(patient["_id"])
    return patient

# Get all patients (limited to first 100 for performance)
async def get_all_patients(limit: int = 10):
    patients = []
    cursor = db["Patients"].find().limit(limit);
    # return cursor
    async for patient in cursor:
        patients.append(serialize_patient(patient))
    return patients

# Get a single patient by ID
async def get_patient_by_id(patient_id: str):
    patient = await db["Patients"].find_one({"_id": ObjectId(patient_id)})
    if patient:
        return serialize_patient(patient)
    return None

async def get_ckd_insights():
    patients = await get_all_patients()
    if not patients:
        return {"message": "No data"}

    df = pd.DataFrame(patients)
    df["_id"] = df["_id"].astype(str)

    # Sanitize invalid values
    df = df.replace([np.inf, -np.inf], np.nan)
    df = df.fillna(0)

    # Optional: Drop _id or convert ObjectId to string
    df["_id"] = df["_id"].astype(str)

    # Create an age group
    bins = [0, 30, 45, 60, 75, 100]
    labels = ['<30', '31-45', '46-60', '61-75', '75+']
    df['age_group'] = pd.cut(df['age_of_the_patient'], bins=bins, labels=labels, right=False)

    # Filter CKD patients
    ckd_df = df[df['target'] == 'ckd']

    # Analysis 1: Most common age group among CKD
    age_group_counts = ckd_df['age_group'].value_counts().sort_index()
    most_common_age_group = age_group_counts.idxmax()

    # Analysis 2: Average serum creatinine among CKD patients
    avg_creatinine = round(ckd_df['serum_creatinine_mgdl'].mean(), 2)

    # Analysis 3: Top contributing factor
    diabetes_count = ckd_df['diabetes_mellitus_yesno'].sum()
    hypertension_count = ckd_df['hypertension_yesno'].sum()

    top_risk = 'diabetes' if diabetes_count > hypertension_count else 'hypertension'

    return {
        "insight": f"CKD peaks in the {most_common_age_group} age group, likely due to {top_risk} complications.",
        "average_creatinine": avg_creatinine,
        "most_common_age_group": str(most_common_age_group),
        "top_risk_factor": top_risk
    }