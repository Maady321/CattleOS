from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class WorkflowRuleBase(BaseModel):
    name: str
    trigger_event: str
    condition_json: Dict[str, Any] = {}
    template_name: str
    is_active: bool = True
    priority: int = 0
    delay_seconds: int = 0
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

class WorkflowRuleCreate(WorkflowRuleBase):
    farm_id: UUID

class WorkflowRuleResponse(WorkflowRuleBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserPreferenceBase(BaseModel):
    whatsapp_enabled: bool = True
    sms_fallback_enabled: bool = True
    language_preference: str = "en"
    vaccination_reminders: bool = True
    financial_alerts: bool = True
    emergency_alerts: bool = True

class MessageLogResponse(BaseModel):
    id: UUID
    provider: str
    to_number: str
    content: str
    status: str
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class CampaignAnalytics(BaseModel):
    total_sent: int
    delivered_rate: float
    read_rate: float
    failure_rate: float
    conversion_rate: float # e.g. task completed after reminder
