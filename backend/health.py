"""
Health score engine — transparent, weighted calculation.

Score is 0-100. Weights are configurable and shown in the UI so
interviewers can see exactly how the score is computed.
"""

WEIGHTS = {
    "usage":          0.30,   # % of licensed seats active
    "nps":            0.20,   # NPS score normalized to 0-100
    "support":        0.15,   # low ticket volume / fast resolution = high score
    "engagement":     0.15,   # days since last CSM contact (lower = better)
    "adoption":       0.20,   # feature adoption %
}

MATURITY_ORDER = [
    "Awareness",
    "Adoption",
    "Value Realization",
    "Optimization",
    "Transformation",
]


def compute_health_score(metrics) -> dict:
    """
    Returns overall score (0-100) and individual component scores.
    All inputs come from CustomerMetrics ORM object.
    """
    components = {}

    # Usage: active_users / licensed_seats
    from_usage = getattr(metrics, "_usage_pct", None)
    if from_usage is None:
        # Fallback: use feature_adoption_pct as proxy when seat data unavailable
        usage_pct = min(metrics.feature_adoption_pct / 100, 1.0)
    else:
        usage_pct = from_usage
    components["usage"] = round(usage_pct * 100, 1)

    # NPS: normalize from -100..100 → 0..100
    if metrics.nps_score is not None:
        nps_norm = (metrics.nps_score + 100) / 200
    else:
        nps_norm = 0.5  # neutral if unknown
    components["nps"] = round(nps_norm * 100, 1)

    # Support: penalize high open tickets and slow resolution
    # 0 tickets + 0 days = 100, 10+ tickets = 0
    ticket_score = max(0, 1 - (metrics.open_tickets / 10))
    resolution_score = max(0, 1 - (metrics.avg_resolution_days / 14))
    support_norm = (ticket_score + resolution_score) / 2
    components["support"] = round(support_norm * 100, 1)

    # Engagement: days since last CSM contact — ideal ≤ 14, bad ≥ 60
    raw_eng = max(0, 1 - (metrics.last_csm_contact_days / 60))
    components["engagement"] = round(raw_eng * 100, 1)

    # Adoption: feature_adoption_pct is already 0-100
    components["adoption"] = round(min(metrics.feature_adoption_pct, 100), 1)

    # Weighted total
    total = (
        components["usage"]     * WEIGHTS["usage"]
        + components["nps"]       * WEIGHTS["nps"]
        + components["support"]   * WEIGHTS["support"]
        + components["engagement"] * WEIGHTS["engagement"]
        + components["adoption"]  * WEIGHTS["adoption"]
    )

    return {
        "score": round(total, 1),
        "components": components,
        "weights": WEIGHTS,
    }


def score_to_risk(score: float) -> str:
    if score >= 75:
        return "low"
    elif score >= 55:
        return "medium"
    elif score >= 35:
        return "high"
    return "critical"


def score_to_label(score: float) -> str:
    if score >= 75:
        return "Healthy"
    elif score >= 55:
        return "At Risk"
    elif score >= 35:
        return "High Risk"
    return "Critical"


def maturity_index(stage: str) -> int:
    try:
        return MATURITY_ORDER.index(stage)
    except ValueError:
        return 0
