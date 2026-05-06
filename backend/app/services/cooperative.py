import logging
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.cooperative import Cooperative, CooperativeCollection, Settlement, SyncStatus
from app.models.logs import MilkLog

logger = logging.getLogger(__name__)

class CooperativeSyncService:
    def __init__(self, db: Session):
        self.db = db

    def sync_milk_to_cooperative(self, farm_id: UUID, cooperative_id: UUID):
        """
        Sends local milk logs to the cooperative's API.
        """
        coop = self.db.query(Cooperative).get(cooperative_id)
        logs = self.db.query(MilkLog).filter(
            MilkLog.farm_id == farm_id,
            # In a real app, track if already synced
        ).limit(100).all()
        
        for log in logs:
            try:
                # Mock API Call
                payload = {
                    "farm_id": str(farm_id),
                    "qty": log.quantity_liters,
                    "fat": log.fat_content,
                    "date": log.created_at.isoformat()
                }
                # response = requests.post(coop.api_endpoint, json=payload, headers={"X-API-KEY": coop.api_key})
                logger.info(f"Synced log {log.id} to cooperative {coop.name}")
            except Exception as e:
                logger.error(f"Failed to sync log {log.id}: {e}")

    def reconcile_collections(self, farm_id: UUID):
        """
        Compares local MilkLog totals with CooperativeCollection records.
        Highlights discrepancies (Quantity or Fat differences).
        """
        # Logic: Iterate through local logs and match with external records via date/time
        local_logs = self.db.query(MilkLog).filter(MilkLog.farm_id == farm_id).all()
        ext_records = self.db.query(CooperativeCollection).filter(CooperativeCollection.farm_id == farm_id).all()
        
        discrepancies = []
        for l in local_logs:
            # Find matching external record within 1 hour
            match = next((e for e in ext_records if abs(e.collection_date - l.created_at) < timedelta(hours=1)), None)
            if match:
                diff = abs(match.quantity_liters - l.quantity_liters)
                if diff > 0.5: # 0.5L tolerance
                    discrepancies.append({
                        "local_id": str(l.id),
                        "ext_id": str(match.id),
                        "diff": diff,
                        "type": "QUANTITY_MISMATCH"
                    })
        return discrepancies

    def process_incoming_collection(self, payload: Dict[str, Any]):
        """
        Webhook handler for new collections from the cooperative.
        """
        # 1. Store the collection
        collection = CooperativeCollection(
            external_collection_id=payload.get("id"),
            quantity_liters=payload.get("qty"),
            fat_pct=payload.get("fat"),
            collection_date=datetime.fromisoformat(payload.get("date")),
            # ... link farm ...
        )
        self.db.add(collection)
        self.db.commit()
        
        # 2. Trigger auto-reconciliation
        # ...
        return collection
