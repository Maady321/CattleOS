import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class SubscriptionStatus(str, enum.Enum):
    TRIALING = "TRIALING"
    ACTIVE = "ACTIVE"
    PAST_DUE = "PAST_DUE"
    CANCELED = "CANCELED"
    UNPAID = "UNPAID"

class PlanInterval(str, enum.Enum):
    MONTHLY = "MONTHLY"
    YEARLY = "YEARLY"

class SubscriptionPlan(Base, TimestampMixin):
    __tablename__ = "subscription_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False) # BASIC, PREMIUM, ENTERPRISE
    razorpay_plan_id = Column(String, unique=True, index=True)
    
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    interval = Column(SQLEnum(PlanInterval), default=PlanInterval.MONTHLY)
    
    trial_days = Column(Integer, default=14)
    max_cattle = Column(Integer, default=50) # For tier limits
    max_users = Column(Integer, default=3)
    
    features_json = Column(JSON, default={})

class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id", ondelete="CASCADE"), unique=True, index=True)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("subscription_plans.id"))
    
    razorpay_subscription_id = Column(String, unique=True, index=True)
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.TRIALING, index=True)
    
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    trial_start = Column(DateTime(timezone=True))
    trial_end = Column(DateTime(timezone=True))
    
    cancel_at_period_end = Column(Boolean, default=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    
    plan = relationship("SubscriptionPlan")

class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id"))
    
    razorpay_payment_id = Column(String, index=True)
    razorpay_invoice_id = Column(String, unique=True, index=True)
    
    amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0) # GST
    total_amount = Column(Float, nullable=False)
    
    status = Column(String, index=True) # PAID, PENDING, FAILED
    invoice_pdf_url = Column(String, nullable=True)
    
    billing_reason = Column(String) # SUBSCRIPTION_CYCLE, UPGRADE, ADD_ON

class Coupon(Base, TimestampMixin):
    __tablename__ = "coupons"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String, unique=True, index=True)
    discount_type = Column(String) # PERCENTAGE, FLAT
    discount_value = Column(Float)
    
    is_active = Column(Boolean, default=True)
    valid_until = Column(DateTime(timezone=True))

class UsageRecord(Base, TimestampMixin):
    __tablename__ = "billing_usage_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    resource_type = Column(String) # SEATS, SMS_ALERTS
    quantity = Column(Integer)
    period_month = Column(Integer)
    period_year = Column(Integer)
