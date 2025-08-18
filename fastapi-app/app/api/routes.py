from fastapi import APIRouter
from app.controllers import logic
from app.models.data_model import DataInput

router = APIRouter()

@router.get("/")
def root():
    return logic.hello()

@router.post("/analyze")
def analyze(data: DataInput):
    return logic.analyze(data)
