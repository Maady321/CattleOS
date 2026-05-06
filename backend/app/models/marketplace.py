import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Float, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base, TimestampMixin

class PartnerType(str, enum.Enum):
    VET = "VET"
    FEED_VENDOR = "FEED_VENDOR"
    MEDICINE_VENDOR = "MEDICINE_VENDOR"
    BREEDING_SERVICE = "BREEDING_SERVICE"
    INSURER = "INSURER"

class MarketplacePartner(Base, TimestampMixin):
    __tablename__ = "marketplace_partners"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, index=True)
    partner_type = Column(SQLEnum(PartnerType), nullable=False)
    
    # Business Info
    gstin = Column(String)
    commission_pct = Column(Float, default=10.0) # Platform take
    
    # Reputation
    rating = Column(Float, default=5.0)
    total_orders = Column(Integer, default=0)
    
    is_active = Column(Boolean, default=True)

class MarketplaceProduct(Base, TimestampMixin):
    __tablename__ = "marketplace_products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("marketplace_partners.id"), index=True)
    
    name = Column(String, index=True)
    description = Column(Text)
    category = Column(String) # FEED, MEDICINE, EQUIPMENT
    
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)
    
    image_url = Column(String)

class MarketplaceOrder(Base, TimestampMixin):
    __tablename__ = "marketplace_orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farm_id = Column(UUID(as_uuid=True), ForeignKey("farms.id"), index=True)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("marketplace_partners.id"))
    
    product_details = Column(JSON) # Snapshot of products at order time
    
    total_amount = Column(Float)
    commission_amount = Column(Float) # The platform's revenue
    
    status = Column(String, default="PENDING") # PENDING, SHIPPED, DELIVERED
    payment_status = Column(String, default="PENDING")
