from typing import List, Optional, Any, Dict
from pydantic import BaseModel, UUID4
from enum import Enum
from datetime import datetime

class SyncOperation(str, Enum):
    INSERT = "INSERT"
    UPDATE = "UPDATE"
    DELETE = "DELETE"

class SyncChange(BaseModel):
    id: UUID4
    entity_type: str # 'cattle', 'health_log', etc.
    operation: SyncOperation
    data: Optional[Dict[str, Any]] = None
    client_mutation_id: Optional[UUID4] = None
    version: Optional[int] = None

class SyncPushRequest(BaseModel):
    changes: List[SyncChange]

class SyncPullRequest(BaseModel):
    last_version: int = 0
    farm_id: UUID4

class SyncResponse(BaseModel):
    changes: List[SyncChange]
    new_version: int
    timestamp: datetime
