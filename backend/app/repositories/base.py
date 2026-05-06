from typing import Any, Dict, Generic, List, Optional, Type, TypeVar
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.base_class import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get_by_farm(self, farm_id: UUID, id: UUID) -> Optional[ModelType]:
        """
        Elite Tenant Isolation: Mandatory farm_id filtering on every fetch.
        """
        return self.db.query(self.model).filter(
            self.model.id == id,
            self.model.farm_id == farm_id
        ).first()

    def get_multi_by_farm(
        self, farm_id: UUID, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        return (
            self.db.query(self.model)
            .filter(self.model.farm_id == farm_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create_with_owner(self, obj_in: Dict[str, Any], farm_id: UUID) -> ModelType:
        obj_data = obj_in.copy()
        obj_data["farm_id"] = farm_id
        db_obj = self.model(**obj_data)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def soft_delete(self, farm_id: UUID, id: UUID) -> Optional[ModelType]:
        obj = self.get_by_farm(farm_id, id)
        if obj:
            obj.is_deleted = True # Assuming SoftDeleteMixin
            self.db.commit()
        return obj
