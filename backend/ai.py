"""Claude-powered AI insights for customer health."""

import os
import anthropic

SYSTEM_PROMPT = """You are a Senior Customer Success Manager at Salesforce/Slack with 10+ years of experience.
Your job is to analyze a customer's health data and produce a concise risk assessment with actionable recommendations.

Rules:
- Be direct and specific — name features, metrics, and numbers
- Risk level must be one of: low, medium, high, critical
- Summary: 2-3 sentences maximum
- Recommendations: exactly 3 bullet points, each starting with an action verb
- Output as JSON with keys: risk_level, summary, recommendations (array of 3 strings)
- No markdown, no extra text — pure JSON only"""


def build_insight_prompt(customer_data: dict) -> str:
    m = customer_data["metrics"]
    return f"""Analyze this customer and return JSON only.

Customer: {customer_data['name']}
Platform: {customer_data['platform'].replace('_', ' ').title()}
Tier: {customer_data['tier']}
Renewal: {customer_data['renewal_date']}
ARR: ${customer_data['contract_value']:,}

Health Score: {customer_data['health_score']} / 100
Score Trend: {customer_data['trend']} (last 3 months)

Metrics:
- Active users: {m['active_users']} / {customer_data['licensed_seats']} licensed ({round(m['active_users']/customer_data['licensed_seats']*100)}%)
- Days since last login (avg): {m['last_login_days_ago']}
- NPS: {m['nps_score'] if m['nps_score'] is not None else 'Unknown'}
- Open support tickets: {m['open_tickets']}
- Avg ticket resolution: {m['avg_resolution_days']} days
- Feature adoption: {m['feature_adoption_pct']}%
- Maturity stage: {m['maturity_stage']}
- Days since last CSM contact: {m['last_csm_contact_days']}
- QBRs completed YTD: {m['qbrs_completed_ytd']}
- Platform notes: {m.get('extra_metrics', 'N/A')}

Return JSON only."""


def generate_insight(customer_data: dict) -> dict:
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
        messages=[{"role": "user", "content": build_insight_prompt(customer_data)}],
    )

    import json
    text = response.content[0].text.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())
