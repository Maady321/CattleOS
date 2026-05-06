import razorpay
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.billing import Subscription, SubscriptionPlan, Invoice, SubscriptionStatus
from app.core.config import settings

logger = logging.getLogger(__name__)

# Razorpay client initialization
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class BillingService:
    def __init__(self, db: Session):
        self.db = db

    def create_subscription(self, farm_id: UUID, plan_id: UUID, coupon_code: str = None) -> Subscription:
        """
        Creates a new subscription in Razorpay and locally.
        """
        plan = self.db.query(SubscriptionPlan).get(plan_id)
        if not plan:
            raise ValueError("Invalid Plan")

        # Razorpay Subscription options
        options = {
            "plan_id": plan.razorpay_plan_id,
            "customer_notify": 1,
            "total_count": 120, # 10 years for monthly
            "start_at": int((datetime.utcnow() + timedelta(days=plan.trial_days)).timestamp()),
        }
        
        # Handle trial
        try:
            rzp_sub = client.subscription.create(options)
            
            sub = Subscription(
                farm_id=farm_id,
                plan_id=plan.id,
                razorpay_subscription_id=rzp_sub['id'],
                status=SubscriptionStatus.TRIALING,
                trial_start=datetime.utcnow(),
                trial_end=datetime.utcnow() + timedelta(days=plan.trial_days),
                current_period_start=datetime.utcnow(),
                current_period_end=datetime.utcnow() + timedelta(days=plan.trial_days)
            )
            self.db.add(sub)
            self.db.commit()
            return sub
        except Exception as e:
            logger.error(f"Razorpay subscription creation failed: {e}")
            raise

    def upgrade_plan(self, subscription_id: UUID, new_plan_id: UUID):
        """
        Upgrades subscription with proration.
        Razorpay handles proration if configured, or we calculate credits.
        """
        sub = self.db.query(Subscription).get(subscription_id)
        new_plan = self.db.query(SubscriptionPlan).get(new_plan_id)
        
        # Razorpay update call
        client.subscription.update(sub.razorpay_subscription_id, {
            "plan_id": new_plan.razorpay_plan_id,
            "remaining_count": 120,
            "schedule_change_at": "now" # or "cycle_end" for downgrade
        })
        
        sub.plan_id = new_plan.id
        self.db.commit()

    def process_webhook_event(self, payload: Dict[str, Any]):
        """
        Handles Razorpay webhooks (payment.captured, subscription.activated, etc.)
        """
        event = payload.get("event")
        data = payload.get("payload", {})
        
        if event == "subscription.activated":
            rzp_sub_id = data['subscription']['entity']['id']
            sub = self.db.query(Subscription).filter(Subscription.razorpay_subscription_id == rzp_sub_id).first()
            if sub:
                sub.status = SubscriptionStatus.ACTIVE
                self.db.commit()
                
        elif event == "payment.captured":
            # Generate local invoice + GST
            self._generate_invoice_from_payment(data['payment']['entity'])
            
        elif event == "subscription.halted":
            # Failed payment recovery / Grace period logic
            rzp_sub_id = data['subscription']['entity']['id']
            sub = self.db.query(Subscription).filter(Subscription.razorpay_subscription_id == rzp_sub_id).first()
            if sub:
                sub.status = SubscriptionStatus.PAST_DUE
                # Trigger internal alert for grace period
                self.db.commit()

    def _generate_invoice_from_payment(self, payment_entity: Dict[str, Any]):
        """
        Internal logic to create a GST-compliant invoice record.
        """
        # Razorpay amounts are in paise
        amount_inr = payment_entity['amount'] / 100
        gst_rate = 0.18
        base_amount = amount_inr / (1 + gst_rate)
        tax_amount = amount_inr - base_amount
        
        invoice = Invoice(
            razorpay_payment_id=payment_entity['id'],
            amount=base_amount,
            tax_amount=tax_amount,
            total_amount=amount_inr,
            status="PAID",
            # ... link to sub and farm ...
        )
        self.db.add(invoice)
        self.db.commit()

    def sync_seat_billing(self, farm_id: UUID):
        """
        Usage metering for seat-based billing.
        """
        from app.models.user import User
        user_count = self.db.query(User).filter(User.farm_id == farm_id).count()
        
        # Log usage for the current month
        now = datetime.utcnow()
        usage = self.db.query(UsageRecord).filter(
            UsageRecord.farm_id == farm_id,
            UsageRecord.resource_type == "SEATS",
            UsageRecord.period_month == now.month,
            UsageRecord.period_year == now.year
        ).first()
        
        if not usage:
            usage = UsageRecord(farm_id=farm_id, resource_type="SEATS", period_month=now.month, period_year=now.year)
            self.db.add(usage)
            
        usage.quantity = user_count
        self.db.commit()
