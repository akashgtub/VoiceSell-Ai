from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Call
from app.schemas import DashboardStats, StatusCount, ActivityDataPoint, CallResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

STATUS_COLORS = {
    "Converted": "#10b981",       # Emerald
    "Demo Requested": "#8b5cf6",  # Violet
    "Interested": "#3b82f6",      # Blue
    "Follow-up Required": "#f59e0b", # Amber
    "Not Interested": "#ef4444",  # Red
    "No Response": "#6b7280",     # Gray
    "In Progress": "#06b6d4"      # Cyan
}

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_calls = db.query(Call).count()
    converted_leads = db.query(Call).filter(Call.status == "Converted").count()
    interested_leads = db.query(Call).filter(Call.status == "Interested").count()
    demos_requested = db.query(Call).filter(Call.status == "Demo Requested").count()
    follow_ups_required = db.query(Call).filter(Call.status == "Follow-up Required").count()
    
    conversion_rate = round((converted_leads / total_calls * 100), 1) if total_calls > 0 else 0.0

    # Status distribution
    status_distribution = []
    all_statuses = ["Converted", "Demo Requested", "Interested", "Follow-up Required", "Not Interested", "No Response", "In Progress"]
    for s in all_statuses:
        count = db.query(Call).filter(Call.status == s).count()
        status_distribution.append(StatusCount(
            status=s,
            count=count,
            color=STATUS_COLORS.get(s, "#9ca3af")
        ))

    # Activity by date (last 7 days or past active days)
    activity_over_time = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        next_date = target_date + timedelta(days=1)
        
        day_calls = db.query(Call).filter(Call.started_at >= target_date, Call.started_at < next_date).count()
        day_demos = db.query(Call).filter(Call.started_at >= target_date, Call.started_at < next_date, Call.status == "Demo Requested").count()
        day_converted = db.query(Call).filter(Call.started_at >= target_date, Call.started_at < next_date, Call.status == "Converted").count()
        
        activity_over_time.append(ActivityDataPoint(
            date=target_date.strftime("%b %d"),
            calls=day_calls,
            demos=day_demos,
            converted=day_converted
        ))

    # Recent calls
    recent_call_models = db.query(Call).order_by(Call.started_at.desc()).limit(7).all()
    recent_calls = []
    for c in recent_call_models:
        recent_calls.append(CallResponse(
            id=c.id,
            started_at=c.started_at,
            ended_at=c.ended_at,
            duration_seconds=c.duration_seconds,
            status=c.status,
            original_ai_status=c.original_ai_status,
            recording_path=c.recording_path,
            recording_url=c.recording_url,
            recording_consent=c.recording_consent,
            summary=c.summary,
            customer_requirements=c.customer_requirements,
            objections=c.objections,
            next_steps=c.next_steps,
            key_features_discussed=c.key_features_discussed,
            buying_signals=c.buying_signals,
            notes=c.notes,
            created_at=c.created_at,
            message_count=len(c.messages)
        ))

    return DashboardStats(
        total_calls=total_calls,
        converted_leads=converted_leads,
        interested_leads=interested_leads,
        demos_requested=demos_requested,
        follow_ups_required=follow_ups_required,
        conversion_rate=conversion_rate,
        status_distribution=status_distribution,
        activity_over_time=activity_over_time,
        recent_calls=recent_calls
    )
