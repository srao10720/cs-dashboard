"""Seed 8 realistic demo customers with 12 months of health history."""

from datetime import date, timedelta
from models import Customer, CustomerMetrics, HealthHistory

CUSTOMERS = [
    {
        "customer": dict(
            name="TechFlow Inc",
            platform="sales_cloud",
            tier="Signature",
            csm_name="Shreya Rao",
            renewal_date=date(2026, 1, 15),
            contract_value=180000,
            industry="SaaS",
            employee_count=620,
            licensed_seats=400,
        ),
        "metrics": dict(
            active_users=372,
            last_login_days_ago=2,
            nps_score=62,
            open_tickets=2,
            avg_resolution_days=1.5,
            feature_adoption_pct=84.0,
            maturity_stage="Optimization",
            last_csm_contact_days=8,
            qbrs_completed_ytd=2,
            extra_metrics="Win Rate: 38%, Pipeline: $18.2M, Forecast Accuracy: 82%",
        ),
        "history": [88, 85, 83, 86, 87, 84, 89, 90, 88, 91, 89, 90],
    },
    {
        "customer": dict(
            name="Meridian Health",
            platform="service_cloud",
            tier="Premier",
            csm_name="Shreya Rao",
            renewal_date=date(2025, 8, 31),
            contract_value=95000,
            industry="Healthcare",
            employee_count=1200,
            licensed_seats=250,
        ),
        "metrics": dict(
            active_users=118,
            last_login_days_ago=18,
            nps_score=12,
            open_tickets=14,
            avg_resolution_days=8.2,
            feature_adoption_pct=31.0,
            maturity_stage="Adoption",
            last_csm_contact_days=42,
            qbrs_completed_ytd=1,
            extra_metrics="CSAT: 3.1/5, SLA Compliance: 61%, Case Volume: 340/mo",
        ),
        "history": [68, 65, 60, 58, 55, 52, 49, 46, 44, 43, 42, 42],
    },
    {
        "customer": dict(
            name="Quantum Labs",
            platform="slack",
            tier="Signature",
            csm_name="Shreya Rao",
            renewal_date=date(2026, 3, 20),
            contract_value=220000,
            industry="Biotech",
            employee_count=850,
            licensed_seats=700,
        ),
        "metrics": dict(
            active_users=658,
            last_login_days_ago=1,
            nps_score=74,
            open_tickets=1,
            avg_resolution_days=0.8,
            feature_adoption_pct=91.0,
            maturity_stage="Transformation",
            last_csm_contact_days=6,
            qbrs_completed_ytd=2,
            extra_metrics="DAU/MAU: 78%, Canvas Views: 12K/mo, Workflow Runs: 8,400/mo",
        ),
        "history": [80, 82, 84, 85, 87, 88, 89, 90, 90, 91, 92, 92],
    },
    {
        "customer": dict(
            name="Pioneer Retail",
            platform="sales_cloud",
            tier="Premier",
            csm_name="Shreya Rao",
            renewal_date=date(2025, 11, 30),
            contract_value=72000,
            industry="Retail",
            employee_count=340,
            licensed_seats=180,
        ),
        "metrics": dict(
            active_users=103,
            last_login_days_ago=11,
            nps_score=28,
            open_tickets=7,
            avg_resolution_days=5.1,
            feature_adoption_pct=48.0,
            maturity_stage="Adoption",
            last_csm_contact_days=28,
            qbrs_completed_ytd=1,
            extra_metrics="Win Rate: 22%, Avg Deal Cycle: 64 days, Lead Conversion: 5.1%",
        ),
        "history": [72, 70, 68, 67, 65, 63, 61, 60, 59, 58, 57, 58],
    },
    {
        "customer": dict(
            name="Nova Financial",
            platform="service_cloud",
            tier="Signature",
            csm_name="Shreya Rao",
            renewal_date=date(2026, 6, 1),
            contract_value=310000,
            industry="Financial Services",
            employee_count=2100,
            licensed_seats=600,
        ),
        "metrics": dict(
            active_users=554,
            last_login_days_ago=3,
            nps_score=58,
            open_tickets=4,
            avg_resolution_days=2.2,
            feature_adoption_pct=76.0,
            maturity_stage="Value Realization",
            last_csm_contact_days=11,
            qbrs_completed_ytd=2,
            extra_metrics="CSAT: 4.3/5, First Contact Resolution: 71%, Deflection Rate: 38%",
        ),
        "history": [70, 72, 73, 74, 75, 76, 76, 77, 77, 78, 78, 79],
    },
    {
        "customer": dict(
            name="Apex Manufacturing",
            platform="sales_cloud",
            tier="Standard",
            csm_name="Shreya Rao",
            renewal_date=date(2025, 7, 15),
            contract_value=38000,
            industry="Manufacturing",
            employee_count=480,
            licensed_seats=120,
        ),
        "metrics": dict(
            active_users=34,
            last_login_days_ago=31,
            nps_score=-18,
            open_tickets=19,
            avg_resolution_days=11.4,
            feature_adoption_pct=18.0,
            maturity_stage="Awareness",
            last_csm_contact_days=58,
            qbrs_completed_ytd=0,
            extra_metrics="Win Rate: 14%, Pipeline: $1.1M, No active Flows or automation",
        ),
        "history": [55, 52, 48, 44, 40, 36, 33, 30, 29, 28, 27, 28],
    },
    {
        "customer": dict(
            name="Summit Education",
            platform="slack",
            tier="Premier",
            csm_name="Shreya Rao",
            renewal_date=date(2025, 12, 31),
            contract_value=64000,
            industry="Education",
            employee_count=290,
            licensed_seats=260,
        ),
        "metrics": dict(
            active_users=184,
            last_login_days_ago=6,
            nps_score=41,
            open_tickets=3,
            avg_resolution_days=3.0,
            feature_adoption_pct=62.0,
            maturity_stage="Engagement",
            last_csm_contact_days=14,
            qbrs_completed_ytd=1,
            extra_metrics="DAU/MAU: 58%, Canvas Views: 3.2K/mo, Workflow Runs: 1,100/mo",
        ),
        "history": [48, 45, 47, 50, 53, 56, 58, 60, 62, 63, 65, 65],
    },
    {
        "customer": dict(
            name="Coastal Logistics",
            platform="experience_cloud",
            tier="Premier",
            csm_name="Shreya Rao",
            renewal_date=date(2026, 2, 28),
            contract_value=88000,
            industry="Logistics",
            employee_count=730,
            licensed_seats=500,
        ),
        "metrics": dict(
            active_users=341,
            last_login_days_ago=7,
            nps_score=45,
            open_tickets=5,
            avg_resolution_days=3.8,
            feature_adoption_pct=67.0,
            maturity_stage="Value Realization",
            last_csm_contact_days=16,
            qbrs_completed_ytd=2,
            extra_metrics="Community Members: 12.4K, Login Rate: 68%, Self-Service Deflection: 41%",
        ),
        "history": [60, 62, 63, 65, 66, 67, 68, 69, 70, 71, 71, 72],
    },
]


def get_months(n: int = 12) -> list[str]:
    from datetime import date
    today = date.today()
    months = []
    for i in range(n - 1, -1, -1):
        d = date(today.year, today.month, 1) - timedelta(days=i * 30)
        months.append(f"{d.year}-{d.month:02d}")
    return months


def seed(db):
    months = get_months(12)
    for entry in CUSTOMERS:
        customer = Customer(**entry["customer"])
        db.add(customer)
        db.flush()

        metrics = CustomerMetrics(customer_id=customer.id, **entry["metrics"])
        db.add(metrics)

        for month, score in zip(months, entry["history"]):
            db.add(HealthHistory(customer_id=customer.id, recorded_month=month, health_score=score))

    db.commit()
