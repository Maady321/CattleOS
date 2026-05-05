import uuid
from typing import Optional, List
from pydantic import BaseModel

class FarmBase(BaseModel):
    name: str
    location: Optional[str] = None

class FarmCreate(FarmBase):
    pass

class FarmUpdate(FarmBase):
    name: Optional[str] = None

class Farm(FarmBase):
    id: uuid.UUID
    owner_id: uuid.UUID

    class Config:
        from_attributes = True
