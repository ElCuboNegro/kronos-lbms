from fastapi import APIRouter
from app.services.science_service import ScienceService
from pydantic import BaseModel

router = APIRouter(prefix="/science", tags=["science"])

class MolarityInput(BaseModel):
    molarity: float
    volume_l: float
    molecular_weight: float

class DilutionInput(BaseModel):
    c1: float
    c2: float
    v2: float

class ViabilityInput(BaseModel):
    total: int
    dead: int

@router.post("/calculate/molarity")
def calculate_molarity(data: MolarityInput):
    return {"mass_g": ScienceService.calculate_molarity(data.molarity, data.volume_l, data.molecular_weight)}

@router.post("/calculate/dilution")
def calculate_dilution(data: DilutionInput):
    return {"v1_l": ScienceService.calculate_dilution_c1v1(data.c1, data.c2, data.v2)}

@router.post("/calculate/viability")
def calculate_viability(data: ViabilityInput):
    return {"viability_pct": ScienceService.calculate_cell_viability(data.total, data.dead)}
