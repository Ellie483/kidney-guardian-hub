from pydantic import BaseModel
from typing import List, Dict

class DataInput(BaseModel):
    values: List[Dict[str, float]]
