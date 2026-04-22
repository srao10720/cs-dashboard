import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from models import Base, Customer, CustomerMetrics, HealthHistory, AIInsight
from health import compute_health_score, score_to_risk, score_to_label, maturity_index, WEIGHTS, MATURITY_ORDER
from seed import seed as seed_db
from ai import generate_insight

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cs_dashboard.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

app = FastAPI(title="CS Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    if db.query(Customer).count() == 0:
        seed_db(db)
    db.close()


def _score_data(customer: Customer) -> dict:
    m = customer.metrics
    usage_pct = m.active_users / customer.licensed_seats if customer.licensed_seats else 0
    m._usage_pct = usage_pct
    result = compute_health_score(m)
    return result


def _trend(history: list) -> str:
    if len(history) < 3:
        return "flat"
    recent = history[-6:]
    delta = recent[-1].health_score - recent[0].health_score
    if delta >= 3:
        return "up"
    elif delta <= -3:
        return "down"
    return "flat"


def _customer_summary(customer: Customer) -> dict:
    health = _score_data(customer)
    trend = _trend(customer.history)
    m = customer.metrics
    return {
        "id": customer.id,
        "name": customer.name,
        "platform": customer.platform,
        "tier": customer.tier,
        "csm_name": customer.csm_name,
        "renewal_date": str(customer.renewal_date),
        "contract_value": customer.contract_value,
        "industry": customer.industry,
        "employee_count": customer.employee_count,
        "licensed_seats": customer.licensed_seats,
        "health_score": health["score"],
        "health_label": score_to_label(health["score"]),
        "risk_level": score_to_risk(health["score"]),
        "trend": trend,
        "maturity_stage": m.maturity_stage if m else None,
        "maturity_index": maturity_index(m.maturity_stage) if m else 0,
        "active_users": m.active_users if m else 0,
        "last_csm_contact_days": m.last_csm_contact_days if m else 0,
        "nps_score": m.nps_score if m else None,
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/customers")
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    summaries = [_customer_summary(c) for c in customers]
    summaries.sort(key=lambda x: x["health_score"])
    return summaries


@app.get("/customers/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    health = _score_data(customer)
    trend = _trend(customer.history)
    m = customer.metrics

    history_data = [
        {"month": h.recorded_month, "score": h.health_score}
        for h in customer.history
    ]

    return {
        **_customer_summary(customer),
        "health_components": health["components"],
        "health_weights": health["weights"],
        "history": history_data,
        "metrics": {
            "active_users": m.active_users,
            "last_login_days_ago": m.last_login_days_ago,
            "nps_score": m.nps_score,
            "open_tickets": m.open_tickets,
            "avg_resolution_days": m.avg_resolution_days,
            "feature_adoption_pct": m.feature_adoption_pct,
            "maturity_stage": m.maturity_stage,
            "last_csm_contact_days": m.last_csm_contact_days,
            "qbrs_completed_ytd": m.qbrs_completed_ytd,
            "extra_metrics": m.extra_metrics,
        },
        "maturity_stages": MATURITY_ORDER,
    }


@app.post("/customers/{customer_id}/insights")
def get_or_generate_insight(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    existing = db.query(AIInsight).filter(AIInsight.customer_id == customer_id).first()
    if existing:
        return {
            "risk_level": existing.risk_level,
            "summary": existing.summary,
            "recommendations": existing.recommendations.split("\n"),
            "generated_at": existing.generated_at,
            "cached": True,
        }

    health = _score_data(customer)
    trend = _trend(customer.history)
    m = customer.metrics

    customer_data = {
        "name": customer.name,
        "platform": customer.platform,
        "tier": customer.tier,
        "renewal_date": str(customer.renewal_date),
        "contract_value": customer.contract_value,
        "licensed_seats": customer.licensed_seats,
        "health_score": health["score"],
        "trend": trend,
        "metrics": {
            "active_users": m.active_users,
            "last_login_days_ago": m.last_login_days_ago,
            "nps_score": m.nps_score,
            "open_tickets": m.open_tickets,
            "avg_resolution_days": m.avg_resolution_days,
            "feature_adoption_pct": m.feature_adoption_pct,
            "maturity_stage": m.maturity_stage,
            "last_csm_contact_days": m.last_csm_contact_days,
            "qbrs_completed_ytd": m.qbrs_completed_ytd,
            "extra_metrics": m.extra_metrics,
        },
    }

    result = generate_insight(customer_data)

    insight = AIInsight(
        customer_id=customer_id,
        risk_level=result["risk_level"],
        summary=result["summary"],
        recommendations="\n".join(result["recommendations"]),
        generated_at=datetime.utcnow().isoformat(),
    )
    db.add(insight)
    db.commit()

    return {
        "risk_level": result["risk_level"],
        "summary": result["summary"],
        "recommendations": result["recommendations"],
        "generated_at": insight.generated_at,
        "cached": False,
    }


@app.get("/stats")
def portfolio_stats(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    summaries = [_customer_summary(c) for c in customers]

    total = len(summaries)
    healthy = sum(1 for s in summaries if s["risk_level"] == "low")
    at_risk = sum(1 for s in summaries if s["risk_level"] == "medium")
    high_risk = sum(1 for s in summaries if s["risk_level"] == "high")
    critical = sum(1 for s in summaries if s["risk_level"] == "critical")
    avg_score = round(sum(s["health_score"] for s in summaries) / total, 1) if total else 0
    total_arr = sum(s["contract_value"] for s in summaries)
    at_risk_arr = sum(s["contract_value"] for s in summaries if s["risk_level"] in ("high", "critical"))

    return {
        "total_customers": total,
        "healthy": healthy,
        "at_risk": at_risk,
        "high_risk": high_risk,
        "critical": critical,
        "avg_health_score": avg_score,
        "total_arr": total_arr,
        "at_risk_arr": at_risk_arr,
    }
