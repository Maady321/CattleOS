import logging
import hashlib
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.observability import AlertRule, AlertIncident, AlertStatus, AlertSeverity, AlertRouting
from app.core.config import settings

logger = logging.getLogger(__name__)

class AlertManagerService:
    def __init__(self, db: Session):
        self.db = db

    def evaluate_rules(self, current_metrics: Dict[str, float]):
        """
        Main evaluation loop for alerting rules.
        """
        rules = self.db.query(AlertRule).filter(AlertRule.is_enabled == True).all()
        
        for rule in rules:
            value = current_metrics.get(rule.metric_name)
            if value is None:
                continue
                
            is_firing = False
            if rule.operator == ">":
                is_firing = value > rule.threshold
            elif rule.operator == "<":
                is_firing = value < rule.threshold
            # ... other operators ...

            if is_firing:
                self._trigger_alert(rule, value)
            else:
                self._resolve_alert(rule)

    def _trigger_alert(self, rule: AlertRule, current_value: float):
        """
        Triggers or updates an active alert incident with deduplication.
        """
        fingerprint = self._calculate_fingerprint(rule)
        
        incident = self.db.query(AlertIncident).filter(
            AlertIncident.fingerprint == fingerprint,
            AlertIncident.status != AlertStatus.RESOLVED
        ).first()
        
        if incident:
            incident.last_seen_at = datetime.utcnow()
            incident.summary = f"Rule {rule.name} is firing. Value: {current_value}"
        else:
            incident = AlertIncident(
                rule_id=rule.id,
                status=AlertStatus.FIRING,
                summary=f"Rule {rule.name} started firing. Value: {current_value}",
                details={"firing_value": current_value, "threshold": rule.threshold},
                starts_at=datetime.utcnow(),
                last_seen_at=datetime.utcnow(),
                fingerprint=fingerprint
            )
            self.db.add(incident)
            self._notify_alert(rule, incident)
            
        self.db.commit()

    def _resolve_alert(self, rule: AlertRule):
        fingerprint = self._calculate_fingerprint(rule)
        incident = self.db.query(AlertIncident).filter(
            AlertIncident.fingerprint == fingerprint,
            AlertIncident.status == AlertStatus.FIRING
        ).first()
        
        if incident:
            incident.status = AlertStatus.RESOLVED
            incident.ends_at = datetime.utcnow()
            self.db.commit()
            logger.info(f"Alert resolved: {rule.name}")

    def _calculate_fingerprint(self, rule: AlertRule) -> str:
        payload = f"{rule.id}|{rule.metric_name}"
        return hashlib.sha256(payload.encode()).hexdigest()

    def _notify_alert(self, rule: AlertRule, incident: AlertIncident):
        """
        Alert routing logic.
        """
        routes = self.db.query(AlertRouting).filter(AlertRouting.severity == rule.severity).all()
        for route in routes:
            logger.info(f"Dispatching alert to {route.channel}: {rule.name} ({rule.severity})")
            # Logic to send to Slack/PagerDuty/Email
            if route.channel == "SLACK":
                self._send_to_slack(route.destination, rule, incident)

    def _send_to_slack(self, url: str, rule: AlertRule, incident: AlertIncident):
        # Implementation of slack webhook call
        pass

    def seed_production_rules(self):
        """
        Pre-defines critical production alerts.
        """
        production_rules = [
            {
                "name": "HighAPILatency",
                "metric_name": "api_latency_p95_ms",
                "operator": ">",
                "threshold": 500,
                "severity": AlertSeverity.CRITICAL,
                "runbook_url": "https://wiki.cattleos.com/runbooks/api-latency",
                "description": "API P95 latency is above 500ms"
            },
            {
                "name": "ElevatedErrorRate",
                "metric_name": "http_5xx_rate_pct",
                "operator": ">",
                "threshold": 2.0,
                "severity": AlertSeverity.EMERGENCY,
                "runbook_url": "https://wiki.cattleos.com/runbooks/elevated-errors",
                "description": "5xx error rate is above 2%"
            },
            {
                "name": "OTPAbuseDetected",
                "metric_name": "otp_requests_per_ip_1m",
                "operator": ">",
                "threshold": 10.0,
                "severity": AlertSeverity.WARNING,
                "runbook_url": "https://wiki.cattleos.com/runbooks/otp-abuse",
                "description": "Suspicious OTP request volume from single IP"
            },
            {
                "name": "RedisDegradation",
                "metric_name": "redis_connected_clients_pct",
                "operator": ">",
                "threshold": 90.0,
                "severity": AlertSeverity.CRITICAL,
                "runbook_url": "https://wiki.cattleos.com/runbooks/redis-clients",
                "description": "Redis client connections reaching capacity"
            },
            {
                "name": "PostgresSlowQueries",
                "metric_name": "pg_slow_query_count_1m",
                "operator": ">",
                "threshold": 5.0,
                "severity": AlertSeverity.WARNING,
                "runbook_url": "https://wiki.cattleos.com/runbooks/pg-slow-queries",
                "description": "More than 5 slow queries detected in the last minute"
            },
            {
                "name": "CeleryQueueBacklog",
                "metric_name": "celery_queue_length",
                "operator": ">",
                "threshold": 1000.0,
                "severity": AlertSeverity.CRITICAL,
                "runbook_url": "https://wiki.cattleos.com/runbooks/celery-backlog",
                "description": "Celery task queue is growing rapidly"
            }
        ]
        
        for r in production_rules:
            existing = self.db.query(AlertRule).filter(AlertRule.name == r["name"]).first()
            if not existing:
                rule = AlertRule(**r)
                self.db.add(rule)
        
        self.db.commit()
