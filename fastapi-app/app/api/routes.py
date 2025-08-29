from fastapi import APIRouter, HTTPException
from app.controllers import logic
from app.models.data_model import DataInput

router = APIRouter()

@router.get("/")
def root():
    return logic.hello()

@router.post("/analyze")
def analyze(data: DataInput):
    return logic.analyze(data)


@router.get("/patients")
async def list_patients():
    return await logic.get_all_patients()

@router.get("/patients/{patient_id}")
async def get_patient(patient_id: str):
    patient = await logic.get_patient_by_id(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/insights")
async def generate_insight():
    return await logic.get_ckd_insights()

