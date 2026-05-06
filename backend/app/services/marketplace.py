import logging
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.marketplace import MarketplacePartner, MarketplaceProduct, MarketplaceOrder

logger = logging.getLogger(__name__)

class MarketplaceService:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, farm_id: UUID, product_id: UUID, quantity: int) -> MarketplaceOrder:
        product = self.db.query(MarketplaceProduct).get(product_id)
        partner = self.db.query(MarketplacePartner).get(product.partner_id)
        
        total_amount = product.price * quantity
        commission = (total_amount * partner.commission_pct) / 100
        
        order = MarketplaceOrder(
            farm_id=farm_id,
            partner_id=partner.id,
            product_details={"product_name": product.name, "qty": quantity},
            total_amount=total_amount,
            commission_amount=commission,
            status="PENDING"
        )
        
        self.db.add(order)
        self.db.commit()
        return order

    def get_partner_payouts(self, partner_id: UUID) -> Dict[str, Any]:
        """
        Calculates total revenue and pending payouts for a partner.
        """
        orders = self.db.query(MarketplaceOrder).filter(
            MarketplaceOrder.partner_id == partner_id,
            MarketplaceOrder.payment_status == "PAID"
        ).all()
        
        total_gross = sum(o.total_amount for o in orders)
        total_commission = sum(o.commission_amount for o in orders)
        
        return {
            "gross_revenue": total_gross,
            "net_payout": total_gross - total_commission,
            "platform_fees": total_commission
        }

    def update_reputation(self, partner_id: UUID, rating: float):
        partner = self.db.query(MarketplacePartner).get(partner_id)
        if partner:
            # Simple moving average
            partner.rating = (partner.rating + rating) / 2
            self.db.commit()
