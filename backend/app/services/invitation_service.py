import uuid
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.models.invitation import Invitation
from app.models.user import User, UserRole
from app.services.email_service import email_service
from app.services.audit_service import audit_service
from fastapi import Request, HTTPException, status

class InvitationService:
    def create_invitation(
        self,
        db: Session,
        email: str,
        role: UserRole,
        invited_by: User,
        request: Request,
        farm_id: Optional[uuid.UUID] = None
    ) -> Invitation:
        # Check if already invited or user exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)

        invitation = Invitation(
            email=email,
            role=role,
            farm_id=farm_id,
            invited_by=invited_by.id,
            token=token,
            expires_at=expires_at
        )
        db.add(invitation)
        db.commit()
        db.refresh(invitation)

        # Send invite email
        invite_link = f"https://cattleos.com/register?token={token}"
        email_service.send_invitation(email, invite_link, role.value)

        audit_service.log_event(
            db, 
            "USER_INVITED", 
            user_id=invited_by.id, 
            request=request, 
            metadata={"target_email": email, "role": role.value}
        )
        
        return invitation

    def accept_invitation(self, db: Session, token: str, user_id: uuid.UUID):
        invitation = db.query(Invitation).filter(
            Invitation.token == token,
            Invitation.is_accepted == False,
            Invitation.expires_at > datetime.now(timezone.utc)
        ).first()

        if not invitation:
            raise HTTPException(status_code=400, detail="Invalid or expired invitation token")

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update user role and farm assignment
        user.role = invitation.role
        # user.farm_id = invitation.farm_id # If applicable
        
        invitation.is_accepted = True
        db.add(user)
        db.add(invitation)
        db.commit()

        audit_service.log_event(
            db, 
            "INVITATION_ACCEPTED", 
            user_id=user_id, 
            metadata={"role": invitation.role.value}
        )

invitation_service = InvitationService()
