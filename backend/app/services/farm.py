from sqlalchemy.orm import Session
from app.models.farm import Farm
from app.schemas.farm import FarmCreate

def create(db: Session, *, obj_in: FarmCreate, owner_id: str) -> Farm:
    db_obj = Farm(
        name=obj_in.name,
        location=obj_in.location,
        owner_id=owner_id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
