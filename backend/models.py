from datetime import date
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, Text, Boolean
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    platform = Column(String, nullable=False)       # sales_cloud | service_cloud | slack | experience_cloud
    tier = Column(String, nullable=False)            # Standard | Premier | Signature
    csm_name = Column(String, nullable=False)
    renewal_date = Column(Date, nullable=False)
    contract_value = Column(Integer, nullable=False) # ARR in USD
    industry = Column(String, nullable=False)
    employee_count = Column(Integer, nullable=False)
    licensed_seats = Column(Integer, nullable=False)

    metrics = relationship("CustomerMetrics", back_populates="customer", uselist=False, cascade="all, delete-orphan")
    history = relationship("HealthHistory", back_populates="customer", cascade="all, delete-orphan", order_by="HealthHistory.recorded_month")
    ai_insight = relationship("AIInsight", back_populates="customer", uselist=False, cascade="all, delete-orphan")


class CustomerMetrics(Base):
    __tablename__ = "customer_metrics"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True)

    # Usage
    active_users = Column(Integer, nullable=False)
    last_login_days_ago = Column(Integer, nullable=False)   # avg days since last login across users

    # Satisfaction
    nps_score = Column(Integer, nullable=True)              # -100 to 100

    # Support
    open_tickets = Column(Integer, nullable=False)
    avg_resolution_days = Column(Float, nullable=False)

    # Adoption
    feature_adoption_pct = Column(Float, nullable=False)    # 0-100
    maturity_stage = Column(String, nullable=False)         # Awareness | Adoption | Value Realization | Optimization | Transformation

    # Engagement
    last_csm_contact_days = Column(Integer, nullable=False) # days since last CSM touchpoint
    qbrs_completed_ytd = Column(Integer, nullable=False)

    # Platform-specific extras (stored as JSON-like string)
    extra_metrics = Column(Text, nullable=True)

    customer = relationship("Customer", back_populates="metrics")


class HealthHistory(Base):
    __tablename__ = "health_history"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    recorded_month = Column(String, nullable=False)  # "2024-07"
    health_score = Column(Float, nullable=False)

    customer = relationship("Customer", back_populates="history")


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True)
    risk_level = Column(String, nullable=False)      # low | medium | high | critical
    summary = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=False)   # newline-separated list
    generated_at = Column(String, nullable=False)

    customer = relationship("Customer", back_populates="ai_insight")
