import uuid
from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel
from app.models.cattle import CattleGender, CattleStatus

class CattleBase(BaseModel):
    tag_id: str
    name: Optional[str] = None
    breed: str
    gender: CattleGender
    date_of_birth: date
    weight: Optional[float] = None
    status: CattleStatus = CattleStatus.ACTIVE

class CattleCreate(CattleBase):
    farm_id: uuid.UUID
    parent_mother_id: Optional[uuid.UUID] = None
    parent_father_id: Optional[uuid.UUID] = None

class CattleUpdate(CattleBase):
    tag_id: Optional[str] = None
    breed: Optional[str] = None
    gender: Optional[CattleGender] = None
    date_of_birth: Optional[date] = None

class Cattle(CattleBase):
    id: uuid.UUID
    farm_id: uuid.UUID
    qr_code_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
