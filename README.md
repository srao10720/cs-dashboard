# Customer Success Health Dashboard

A full-stack SaaS-style dashboard for Customer Success Managers to monitor account health, track adoption maturity, and generate AI-powered risk assessments across Salesforce and Slack customer portfolios.

Built as a portfolio project for **Salesforce Senior Success Guide** and **Slack Customer Success Manager** applications.

**Live Demo:** _[Deploy to Vercel + Railway — see below]_

---

## Table of Contents

1. [What This Project Is](#what-this-project-is)
2. [Skills Demonstrated](#skills-demonstrated)
3. [How the App Works — End to End](#how-the-app-works--end-to-end)
4. [Features — Portfolio View](#features--portfolio-view)
5. [Features — Customer Detail View](#features--customer-detail-view)
6. [Features — AI Insight Panel](#features--ai-insight-panel)
7. [Health Score Engine — Full Explanation](#health-score-engine--full-explanation)
8. [Adoption Maturity Model](#adoption-maturity-model)
9. [Demo Customers — Full Details](#demo-customers--full-details)
10. [Tech Stack](#tech-stack)
11. [Project Structure](#project-structure)
12. [File-by-File Breakdown](#file-by-file-breakdown)
13. [TypeScript Types Reference](#typescript-types-reference)
14. [API Reference](#api-reference)
15. [Local Setup](#local-setup)
16. [Environment Variables](#environment-variables)
17. [Deployment](#deployment)
18. [How to Use the App](#how-to-use-the-app)

---

## What This Project Is

Customer Success Managers at Salesforce and Slack manage portfolios of 10–50+ accounts simultaneously. Each account has different health trajectories, adoption levels, renewal timelines, and risk signals. Tracking all of this in spreadsheets or account-by-account in Salesforce is slow and misses patterns.

This dashboard automates the monitoring layer:

- **Health scores are calculated automatically** from 5 weighted data dimensions per customer — no manual assessment needed
- **Accounts are ranked by urgency** — Critical accounts surface first so the CSM focuses where it matters most
- **Trend signals** show whether each account is improving or declining over the past 6 months
- **12-month history charts** visualize the full arc of each customer's health trajectory
- **Adoption maturity** is tracked on a 5-stage framework (Awareness → Transformation) per account
- **Claude-powered AI insights** analyze each customer's full data set and return a risk level, 2–3 sentence summary, and 3 prioritized action items
- **All data is pre-seeded** — a hiring manager can open the app and explore a fully realistic 8-account portfolio immediately, with no login or setup

---

## Skills Demonstrated

| Skill | Where It Shows Up |
|---|---|
| **Customer health scoring** | Weighted 5-dimension engine in `health.py` — transparent, component-level breakdown shown in UI |
| **Adoption maturity model** | 5-stage framework (Awareness → Transformation) tracked per customer, rendered as segmented progress bar |
| **Risk identification & prioritization** | Portfolio grouped by Critical → High → At Risk → Healthy; color-coded cards with ring indicators |
| **Renewal risk management** | Days-to-renewal calculated per account with urgency color (red < 90 days, orange < 180 days) |
| **ARR at-risk quantification** | Stats bar shows total ARR exposed in high-risk and critical accounts |
| **CSM engagement tracking** | Days since last CSM contact surfaced per card; turns red above 30 days |
| **AI literacy** | Claude API integration (`ai.py`) for on-demand risk assessments; system prompt cached for performance |
| **Prompt engineering** | Structured system prompt instructs Claude to act as a Senior CSM and return strict JSON |
| **Salesforce platform knowledge** | Sales Cloud, Service Cloud, Experience Cloud metrics and feature names used throughout |
| **Slack platform knowledge** | Slack-specific metrics: DAU/MAU, Canvas views, Workflow Builder runs, Slack Connect |
| **Full-stack development** | Python FastAPI + SQLAlchemy ORM backend; Next.js 14 App Router frontend |
| **Database design** | 4-table relational schema (Customer, CustomerMetrics, HealthHistory, AIInsight) in SQLite |
| **Data visualization** | Recharts line chart with reference lines; animated SVG health rings; maturity progress bars |
| **Server components** | Portfolio and detail pages are Next.js server components — data fetched at render time, no client-side loading states |

---

## How the App Works — End to End

1. **Backend starts** → FastAPI creates the SQLite database and seeds 8 demo customers if none exist
2. **Frontend loads** → Next.js server component calls `GET /stats` and `GET /customers` in parallel
3. **Health scores computed** → For each customer, `compute_health_score()` runs against stored metrics and returns a 0–100 score with 5 component sub-scores
4. **Trend computed** → `_trend()` compares the health score from 6 months ago to today; delta ≥ 3 = up, ≤ -3 = down
5. **Portfolio renders** → Customers grouped into 4 sections by risk tier, displayed as interactive cards
6. **Click a card** → Navigate to `/customers/{id}` — server fetches full customer detail including 12-month history
7. **Click "Generate Insight"** → Client component calls `POST /customers/{id}/insights` → backend builds a prompt with all metrics and calls Claude → JSON response stored in SQLite and returned → UI renders risk summary and recommendations
8. **Second visit** → Insight is served from SQLite cache; Claude is not called again

---

## Features — Portfolio View

### Stats Bar (5 tiles)
- **Total Accounts** — count of all accounts + total ARR formatted as $K or $M
- **Healthy** — count of accounts with score ≥ 75, subtitle "score ≥ 75"
- **At Risk** — count of accounts with score 55–74, subtitle "score 55–74"
- **High Risk / Critical** — combined count of accounts below 55, subtitle shows ARR at risk (e.g., "$205K ARR at risk")
- **Avg Health Score** — portfolio average across all accounts

### Account Sections
The portfolio is split into 4 labelled sections, rendered only if accounts exist in that tier:
- **Critical — Immediate Action Required** (red dot) — score < 35
- **High Risk** (orange dot) — score 35–54
- **At Risk** (amber dot) — score 55–74
- **Healthy** (green dot) — score ≥ 75

Each section uses a responsive CSS grid: 1 column on mobile, 2 on tablet, 3 on desktop.

### Customer Card (each contains)
- **Customer name** — truncated if long
- **Platform badge** — color-coded pill: blue (Sales Cloud), purple (Service Cloud), green (Slack), orange (Experience Cloud)
- **Tier** — Standard / Premier / Signature
- **Industry** — e.g., SaaS, Healthcare, Biotech
- **Health ring** — animated SVG circle showing score 0–100. Two circles: gray background, colored foreground arc whose length = `(score / 100) × circumference`. Color matches risk tier.
- **Trend arrow** — ↑ green (improving), ↓ red (declining), → gray (stable)
- **Risk label badge** — "Healthy", "At Risk", "High Risk", or "Critical" in matching color
- **ARR** — formatted as $K or $M
- **Seat usage bar** — labeled `active_users / licensed_seats (XX%)`, filled bar color matches risk tier
- **Maturity bar** — 5-segment horizontal bar, filled segments = completed maturity stages, label below shows current stage name
- **Footer row** — NPS score · Renewal countdown (with urgency color) · Days since last CSM contact (red if > 30 days)
- **Click behavior** — entire card is a `<Link>` to `/customers/{id}`
- **Hover effect** — `shadow-sm` → `shadow-md` transition

---

## Features — Customer Detail View

### Breadcrumb
"Portfolio / Customer Name" — clicking "Portfolio" returns to the home page.

### Header Card
- Customer name (H2), platform badge, risk badge — all in one row
- Second row: tier, industry, employee count (formatted with commas), CSM name
- Right side: large health ring (SVG radius 44px vs. 28px for cards) + ARR + renewal countdown
- Card border color matches risk tier (emerald, amber, orange, or red ring)

### Key Metrics Panel (left column)
9 metrics displayed as label/value rows:
| Metric | Alert Threshold |
|---|---|
| Active Users (X / Y licensed, Z%) | — |
| Avg Days Since Login | — |
| NPS Score | — |
| Open Tickets | **Red if > 8** |
| Avg Resolution Time | **Red if > 7 days** |
| Feature Adoption % | — |
| Last CSM Contact | **Red if > 30 days** |
| QBRs Completed YTD | **Red if 0** |

Below the standard metrics, a **Platform Notes** section splits `extra_metrics` on commas and renders each as a separate line. Examples: "Win Rate: 38%", "DAU/MAU: 78%", "CSAT: 4.3/5".

### Adoption Maturity Panel (left column)
- 5-segment bar with filled (violet) and unfilled (gray) segments
- Current stage name in violet bold text
- "Stage X of 5" subtitle
- Full stage list below the bar — completed stages in violet, future stages in gray, current stage with "← current" annotation

### 12-Month Health Score Trend Chart (right column)
Recharts `LineChart` with 200px height:
- X-axis: short month names (Jan, Feb, ...) from the last 12 calendar months
- Y-axis: 0–100, fixed domain
- Purple line (`#7c3aed`) with dots (r=3) and active dots (r=5)
- Two dashed `ReferenceLine` elements: green at y=75 labeled "Healthy", amber at y=55 labeled "At Risk"
- Tooltip shows "Health Score: XX" on hover
- Trend label top-right: "Improving", "Declining", or "Stable" with trend icon

### Score Breakdown Panel (right column)
5 labeled progress bars, one per health score dimension:
- **Seat Usage** (blue) — 30% weight
- **NPS Score** (violet) — 20% weight
- **Support Health** (emerald) — 15% weight
- **CSM Engagement** (amber) — 15% weight
- **Feature Adoption** (indigo) — 20% weight

Each bar shows the dimension name, weight percentage, component score (e.g., "84/100"), and a filled bar proportional to the score.

### AI Insight Panel (right column)
See [Features — AI Insight Panel](#features--ai-insight-panel) below.

---

## Features — AI Insight Panel

A client component (`AIInsightPanel.tsx`) with 3 states:

**State 1 — Idle (default)**
Violet call-to-action card:
- Title: "AI Risk Assessment"
- Subtitle: "Powered by Claude claude-sonnet-4-6 · Results cached per customer"
- "Generate Insight" button (violet, hover darker)
- Error message shown below button if the API call fails

**State 2 — Loading**
Violet panel with animated pulse text: "Claude is analyzing this customer..."

**State 3 — Loaded**
Result card with border and background color matching the AI-determined risk level:
- **Header row**: "AI Risk Assessment" label + risk level badge ("Healthy", "At Risk", "High Risk", "Critical") + "Cached" or "Just generated" indicator
- **Summary**: 2–3 sentences of risk narrative from Claude
- **Recommended Actions**: numbered list of 3 action items, each starting with an action verb
- **Footer**: "Generated by Claude claude-sonnet-4-6 · [date]"

Results are stored in SQLite per customer. The second time "Generate Insight" is clicked (or the page is revisited), the cached result is returned instantly without calling Claude again. The `cached: true` flag is reflected in the "Cached" indicator.

---

## Health Score Engine — Full Explanation

**File:** `backend/health.py`

The score is a weighted sum of 5 independent component scores, each normalized to 0–100.

### Weights

```python
WEIGHTS = {
    "usage":      0.30,   # seat utilization — highest weight, most direct signal
    "nps":        0.20,   # customer sentiment — leading indicator of churn
    "support":    0.15,   # ticket volume and resolution speed
    "engagement": 0.15,   # days since last CSM contact
    "adoption":   0.20,   # percentage of platform features in use
}
```

### Component Calculations

**Seat Usage (30%)**
```
usage_pct = active_users / licensed_seats
score = usage_pct × 100
```
The `active_users` and `licensed_seats` values come from the `Customer` and `CustomerMetrics` tables respectively. `_usage_pct` is injected as a temporary attribute on the metrics object by `_score_data()` in `main.py` before calling `compute_health_score()`.

**NPS Score (20%)**
```
nps_norm = (nps_score + 100) / 200
score = nps_norm × 100
```
NPS ranges from -100 to +100. Adding 100 shifts it to 0–200, dividing by 200 normalizes to 0–1, multiplying by 100 gives the 0–100 score. If NPS is `None` (unknown), defaults to 0.5 × 100 = 50 (neutral).

**Support Health (15%)**
```
ticket_score = max(0, 1 - open_tickets / 10)
resolution_score = max(0, 1 - avg_resolution_days / 14)
score = ((ticket_score + resolution_score) / 2) × 100
```
10+ open tickets = 0 for the ticket component. 14+ day resolution = 0 for the resolution component. The two are averaged, so a customer with 0 tickets but slow resolution still loses points.

**CSM Engagement (15%)**
```
score = max(0, 1 - last_csm_contact_days / 60) × 100
```
0 days since contact = 100. 60+ days = 0. This drives the "Last CSM Contact" red alert on cards when the value exceeds 30 days.

**Feature Adoption (20%)**
```
score = min(feature_adoption_pct, 100)
```
Passed through directly since it is already on a 0–100 scale. Capped at 100 to guard against data errors.

### Final Score
```
total = (usage × 0.30) + (nps × 0.20) + (support × 0.15) + (engagement × 0.15) + (adoption × 0.20)
```

### Risk Tiers
```
score ≥ 75  → "low"     → "Healthy"
score ≥ 55  → "medium"  → "At Risk"
score ≥ 35  → "high"    → "High Risk"
score < 35  → "critical" → "Critical"
```

### Trend Calculation
```python
recent = history[-6:]   # last 6 months
delta = recent[-1].health_score - recent[0].health_score
if delta >= 3:   return "up"
if delta <= -3:  return "down"
return "flat"
```
Uses the last 6 months (not 3) to smooth out single-month noise. A customer whose score moved from 48 → 65 over 6 months is clearly "up" even if the last 2 months were flat.

---

## Adoption Maturity Model

**Defined in:** `backend/health.py` → `MATURITY_ORDER`
**Returned by API:** `GET /customers/{id}` → `maturity_stages`

The 5 stages apply to all platforms (Sales Cloud, Service Cloud, Experience Cloud). For Slack, the stage names are the same but the content differs (Engagement replaces Value Realization in the Slack seed data).

| Stage | Index | Meaning |
|---|---|---|
| Awareness | 0 | Platform licensed; users logging in for the first time; minimal configuration |
| Adoption | 1 | Core features in active use; basic workflows set up; user training underway |
| Value Realization | 2 | Measurable business outcomes from the platform; adoption > 50% of licensed seats |
| Optimization | 3 | Advanced features deployed; automation live; platform deeply embedded in workflows |
| Transformation | 4 | Platform is mission-critical; customer is expanding; serves as internal champion |

The `maturity_index` (0–4) is used by the frontend to fill the correct number of segments in the 5-bar maturity progress indicator.

---

## Demo Customers — Full Details

8 pre-seeded customers with 12 months of health history each. All seeded by `seed.py` on first startup.

### 1. TechFlow Inc — Score: 86.6 — Healthy
- **Platform:** Sales Cloud · **Tier:** Signature · **Industry:** SaaS
- **ARR:** $180K · **Renewal:** Jan 2026 · **Seats:** 400 licensed
- **Active users:** 372 (93%) · **NPS:** 62 · **Open tickets:** 2 · **Resolution:** 1.5 days
- **Feature adoption:** 84% · **Maturity:** Optimization · **Last CSM contact:** 8 days
- **Platform notes:** Win Rate: 38%, Pipeline: $18.2M, Forecast Accuracy: 82%
- **History:** [88, 85, 83, 86, 87, 84, 89, 90, 88, 91, 89, 90] — stable high performer
- **Trend:** Flat (last 6 months delta: +2)

### 2. Meridian Health — Score: 39.2 — High Risk
- **Platform:** Service Cloud · **Tier:** Premier · **Industry:** Healthcare
- **ARR:** $95K · **Renewal:** Aug 2025 · **Seats:** 250 licensed
- **Active users:** 118 (47%) · **NPS:** 12 · **Open tickets:** 14 · **Resolution:** 8.2 days
- **Feature adoption:** 31% · **Maturity:** Adoption · **Last CSM contact:** 42 days ⚠️
- **Platform notes:** CSAT: 3.1/5, SLA Compliance: 61%, Case Volume: 340/mo
- **History:** [68, 65, 60, 58, 55, 52, 49, 46, 44, 43, 42, 42] — steady decline
- **Trend:** Down (last 6 months delta: -10)

### 3. Quantum Labs — Score: 91.1 — Healthy
- **Platform:** Slack · **Tier:** Signature · **Industry:** Biotech
- **ARR:** $220K · **Renewal:** Mar 2026 · **Seats:** 700 licensed
- **Active users:** 658 (94%) · **NPS:** 74 · **Open tickets:** 1 · **Resolution:** 0.8 days
- **Feature adoption:** 91% · **Maturity:** Transformation · **Last CSM contact:** 6 days
- **Platform notes:** DAU/MAU: 78%, Canvas Views: 12K/mo, Workflow Runs: 8,400/mo
- **History:** [80, 82, 84, 85, 87, 88, 89, 90, 90, 91, 92, 92] — consistent growth
- **Trend:** Up (last 6 months delta: +4)

### 4. Pioneer Retail — Score: 54.6 — High Risk
- **Platform:** Sales Cloud · **Tier:** Premier · **Industry:** Retail
- **ARR:** $72K · **Renewal:** Nov 2025 · **Seats:** 180 licensed
- **Active users:** 103 (57%) · **NPS:** 28 · **Open tickets:** 7 · **Resolution:** 5.1 days
- **Feature adoption:** 48% · **Maturity:** Adoption · **Last CSM contact:** 28 days
- **Platform notes:** Win Rate: 22%, Avg Deal Cycle: 64 days, Lead Conversion: 5.1%
- **History:** [72, 70, 68, 67, 65, 63, 61, 60, 59, 58, 57, 58] — gradual slide
- **Trend:** Down (last 6 months delta: -5)

### 5. Nova Financial — Score: 81.8 — Healthy
- **Platform:** Service Cloud · **Tier:** Signature · **Industry:** Financial Services
- **ARR:** $310K · **Renewal:** Jun 2026 · **Seats:** 600 licensed
- **Active users:** 554 (92%) · **NPS:** 58 · **Open tickets:** 4 · **Resolution:** 2.2 days
- **Feature adoption:** 76% · **Maturity:** Value Realization · **Last CSM contact:** 11 days
- **Platform notes:** CSAT: 4.3/5, First Contact Resolution: 71%, Deflection Rate: 38%
- **History:** [70, 72, 73, 74, 75, 76, 76, 77, 77, 78, 78, 79] — slow, steady improvement
- **Trend:** Up (last 6 months delta: +3)

### 6. Apex Manufacturing — Score: 22.2 — Critical
- **Platform:** Sales Cloud · **Tier:** Standard · **Industry:** Manufacturing
- **ARR:** $38K · **Renewal:** Jul 2025 · **Seats:** 120 licensed
- **Active users:** 34 (28%) · **NPS:** -18 · **Open tickets:** 19 ⚠️ · **Resolution:** 11.4 days ⚠️
- **Feature adoption:** 18% · **Maturity:** Awareness · **Last CSM contact:** 58 days ⚠️ · **QBRs YTD:** 0 ⚠️
- **Platform notes:** Win Rate: 14%, Pipeline: $1.1M, No active Flows or automation
- **History:** [55, 52, 48, 44, 40, 36, 33, 30, 29, 28, 27, 28] — sharp decline
- **Trend:** Down (last 6 months delta: -8)

### 7. Summit Education — Score: 70.4 — At Risk
- **Platform:** Slack · **Tier:** Premier · **Industry:** Education
- **ARR:** $64K · **Renewal:** Dec 2025 · **Seats:** 260 licensed
- **Active users:** 184 (71%) · **NPS:** 41 · **Open tickets:** 3 · **Resolution:** 3.0 days
- **Feature adoption:** 62% · **Maturity:** Engagement · **Last CSM contact:** 14 days
- **Platform notes:** DAU/MAU: 58%, Canvas Views: 3.2K/mo, Workflow Runs: 1,100/mo
- **History:** [48, 45, 47, 50, 53, 56, 58, 60, 62, 63, 65, 65] — recovering from a dip
- **Trend:** Up (last 6 months delta: +7)

### 8. Coastal Logistics — Score: 68.6 — At Risk
- **Platform:** Experience Cloud · **Tier:** Premier · **Industry:** Logistics
- **ARR:** $88K · **Renewal:** Feb 2026 · **Seats:** 500 licensed
- **Active users:** 341 (68%) · **NPS:** 45 · **Open tickets:** 5 · **Resolution:** 3.8 days
- **Feature adoption:** 67% · **Maturity:** Value Realization · **Last CSM contact:** 16 days
- **Platform notes:** Community Members: 12.4K, Login Rate: 68%, Self-Service Deflection: 41%
- **History:** [60, 62, 63, 65, 66, 67, 68, 69, 70, 71, 71, 72] — consistent improvement
- **Trend:** Up (last 6 months delta: +5)

---

## Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | 0.115.6 | REST API framework — endpoints, dependency injection, CORS middleware |
| `uvicorn[standard]` | 0.32.1 | ASGI server for FastAPI |
| `sqlalchemy` | 2.0.36 | ORM — table definitions, relationships, session management |
| `aiosqlite` | 0.20.0 | Async SQLite driver (required by SQLAlchemy for SQLite) |
| `anthropic` | 0.40.0 | Claude API SDK — `messages.create()` with prompt caching |
| `python-dotenv` | 1.0.1 | Loads `.env` file into `os.environ` on startup |
| `pydantic` | 2.10.3 | Request body validation (via FastAPI integration) |

**Database:** SQLite locally (file: `cs_dashboard.db`), PostgreSQL on Railway via `DATABASE_URL` env var.

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `next` | 14.x | React framework — App Router, server components, dynamic routes |
| `react` / `react-dom` | 18.x | UI rendering |
| `typescript` | 5.x | Static typing throughout |
| `tailwindcss` | 3.x | Utility-first CSS |
| `recharts` | latest | `LineChart`, `ReferenceLine`, `Tooltip` for health trend chart |
| `lucide-react` | latest | Icon set (imported but available for extension) |

---

## Project Structure

```
cs-dashboard/
│
├── README.md
│
├── backend/
│   ├── main.py            # FastAPI app: startup hook, all endpoints, helper functions
│   ├── models.py          # SQLAlchemy ORM: 4 tables
│   ├── health.py          # Health score engine: weights, component calculations, risk tiers
│   ├── seed.py            # 8 demo customers with 12-month history data
│   ├── ai.py              # Claude API: system prompt, user prompt builder, JSON parser
│   ├── requirements.txt
│   ├── .env               # ANTHROPIC_API_KEY (gitignored)
│   ├── .env.example       # Safe-to-commit template
│   ├── .gitignore
│   └── .venv/             # Python virtual environment (gitignored)
│
└── frontend/
    ├── app/
    │   ├── layout.tsx                     # Root layout: imports Header, wraps all pages
    │   ├── page.tsx                       # Portfolio view (server component)
    │   ├── globals.css                    # Tailwind base, font
    │   │
    │   ├── customers/
    │   │   └── [id]/
    │   │       └── page.tsx               # Customer detail (server component, dynamic route)
    │   │
    │   ├── components/
    │   │   ├── Header.tsx                 # Sticky top nav: logo, live indicator
    │   │   ├── StatsBar.tsx               # 5-tile portfolio summary row
    │   │   ├── CustomerCard.tsx           # Clickable card: ring, trend, bars, footer
    │   │   ├── HealthRing.tsx             # SVG circle health score indicator (sm/lg)
    │   │   ├── TrendIcon.tsx              # ↑ ↓ → trend arrow component
    │   │   ├── MaturityBar.tsx            # 5-segment maturity progress bar
    │   │   ├── HealthTrendChart.tsx       # Recharts 12-month line chart
    │   │   ├── ScoreBreakdown.tsx         # 5 labeled progress bars with weights
    │   │   └── AIInsightPanel.tsx         # Claude AI insight (client component, 3 states)
    │   │
    │   └── lib/
    │       ├── api.ts                     # All fetch calls to the FastAPI backend
    │       ├── types.ts                   # Shared TypeScript interfaces
    │       └── utils.ts                   # Color maps, formatARR, daysUntilRenewal
    │
    ├── .env.local                         # NEXT_PUBLIC_API_URL (points to backend)
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## File-by-File Breakdown

### `backend/models.py`

Defines 4 SQLAlchemy ORM models using `DeclarativeBase`:

**`Customer`** — core account record stored in `customers` table.
- `id` — auto-increment primary key
- `name`, `platform`, `tier`, `csm_name` — string fields
- `renewal_date` — Python `date` object, stored as SQL DATE
- `contract_value` — annual recurring revenue in USD (integer)
- `industry`, `employee_count`, `licensed_seats` — firmographic data
- Three relationships: `metrics` (one-to-one), `history` (one-to-many, ordered by month), `ai_insight` (one-to-one), all with `cascade="all, delete-orphan"` so deleting a customer cleans up all related rows

**`CustomerMetrics`** — one-to-one with Customer, stored in `customer_metrics` table.
- `customer_id` — foreign key with `unique=True` (enforces one-to-one)
- **Usage fields:** `active_users` (int), `last_login_days_ago` (int — avg days across all users)
- **Satisfaction:** `nps_score` (int, nullable — -100 to 100)
- **Support:** `open_tickets` (int), `avg_resolution_days` (float)
- **Adoption:** `feature_adoption_pct` (float, 0–100), `maturity_stage` (string)
- **Engagement:** `last_csm_contact_days` (int), `qbrs_completed_ytd` (int)
- `extra_metrics` (Text, nullable) — comma-separated platform-specific notes, e.g. "Win Rate: 38%, Pipeline: $18.2M"

**`HealthHistory`** — one-to-many with Customer, stored in `health_history` table.
- One row per calendar month per customer
- `recorded_month` — string in "YYYY-MM" format (e.g., "2024-07")
- `health_score` — float, the historical score for that month
- 12 rows seeded per customer on first startup

**`AIInsight`** — one-to-one with Customer, stored in `ai_insights` table.
- Created lazily — only when "Generate Insight" is clicked for the first time
- `risk_level` — string: "low", "medium", "high", or "critical"
- `summary` — Text blob, 2–3 sentences from Claude
- `recommendations` — Text blob, 3 lines joined by `\n`; split back to array when returned by the API
- `generated_at` — ISO 8601 UTC timestamp string
- Acts as a cache: once created, it is returned on all subsequent calls without invoking Claude

---

### `backend/health.py`

The health score calculation engine. No database access — takes a `CustomerMetrics` object as input, returns a plain dict.

**`WEIGHTS`** — dict of 5 keys to float weights summing to 1.0. Defined at module level so they appear in the API response unchanged.

**`MATURITY_ORDER`** — ordered list of 5 stage names. Used by `maturity_index()` to map stage → 0-based index.

**`compute_health_score(metrics)`** — main calculation function:
1. Reads `_usage_pct` from the metrics object (injected by `main.py`'s `_score_data()`); falls back to `feature_adoption_pct / 100` if not set
2. Normalizes NPS from -100..100 → 0..100; defaults to 50 if `None`
3. Averages ticket score and resolution score for support component
4. Applies linear decay for engagement (contact days)
5. Passes through feature adoption directly
6. Multiplies each component by its weight and sums
7. Returns: `{ "score": float, "components": dict, "weights": WEIGHTS }`

**`score_to_risk(score)`** — thresholds: ≥75 → "low", ≥55 → "medium", ≥35 → "high", else "critical"

**`score_to_label(score)`** — same thresholds mapped to display strings: "Healthy", "At Risk", "High Risk", "Critical"

**`maturity_index(stage)`** — `MATURITY_ORDER.index(stage)`, returns 0 if not found

---

### `backend/seed.py`

Populates the database on first startup.

**`CUSTOMERS`** — list of 8 dicts, each with three keys:
- `customer` — kwargs for `Customer()`
- `metrics` — kwargs for `CustomerMetrics()`
- `history` — list of 12 floats (oldest to newest)

**`get_months(n=12)`** — generates the last N calendar months as "YYYY-MM" strings. Uses `date.today()` and `timedelta(days=i * 30)` subtraction, so the months align to today's date regardless of when the app is first run.

**`seed(db)`** — iterates over CUSTOMERS, calls `db.add()` + `db.flush()` per customer (flush assigns the auto-increment `id` so it can be used as a foreign key), then creates `CustomerMetrics` and 12 `HealthHistory` rows. Single `db.commit()` at the end for atomicity.

The 8 customers are designed to demonstrate a variety of states:
- Full health spectrum: 22 (critical) to 91 (healthy)
- All 4 platforms represented
- 4 different industries
- Both improving and declining trend arcs
- Multiple maturity stages (Awareness through Transformation)

---

### `backend/ai.py`

Claude API integration for on-demand customer risk assessments.

**`SYSTEM_PROMPT`** — fixed instruction string sent with every request. Cache-controlled with `"ephemeral"` so Claude reuses it across requests within a 5-minute window. Instructs Claude to:
- Act as a Senior CSM with 10+ years of Salesforce/Slack experience
- Return risk level as one of exactly four strings: `low | medium | high | critical`
- Limit summary to 2–3 sentences max
- Return exactly 3 recommendations, each starting with an action verb
- Return **pure JSON only** — no markdown, no extra text

The strict JSON output requirement is critical because the response is parsed with `json.loads()` without any LLM output validation layer.

**`build_insight_prompt(customer_data)`** — constructs the user message. Includes:
- Customer name, platform (human-readable), tier, renewal date, ARR
- Computed health score and trend
- All 9 metric fields from `CustomerMetrics`
- The `extra_metrics` platform notes

The final line is "Return JSON only." — a reinforcement of the system prompt rule, which reduces the chance of Claude adding narrative before the JSON.

**`generate_insight(customer_data)`** — calls `client.messages.create()` with `max_tokens=512` (JSON responses are small). Strips markdown fences if Claude wraps the JSON in ` ```json ``` ` blocks despite the instruction not to. Returns the parsed dict.

---

### `backend/main.py`

FastAPI application. All business logic for HTTP endpoints.

**Startup hook (`@app.on_event("startup")`)** — creates all SQLite tables via `Base.metadata.create_all()`, then checks if any customers exist; if not, calls `seed_db()`. This means the DB is always ready on the first request.

**`get_db()`** — FastAPI dependency that opens a SQLAlchemy session, yields it, and closes it in a `finally` block. Injected into endpoints via `Depends(get_db)`.

**`_score_data(customer)`** — internal helper. Computes `usage_pct = active_users / licensed_seats`, injects it as `m._usage_pct`, then calls `compute_health_score(m)`. Returns the full health dict.

**`_trend(history)`** — compares `history[-6]` to `history[-1]` (last 6 months). Delta ≥ 3 → "up", ≤ -3 → "down", else "flat".

**`_customer_summary(customer)`** — builds the flat dict returned by `GET /customers`. Calls both `_score_data()` and `_trend()` and merges results with customer fields.

**`GET /health`** — health check, returns `{"status": "ok"}`.

**`GET /customers`** — loads all customers with related metrics and history (SQLAlchemy eager-loads via relationships), maps each to `_customer_summary()`, sorts by `health_score` ascending (worst first).

**`GET /customers/{customer_id}`** — loads full customer, calls `_score_data()` and `_trend()`, serializes the 12-month history as `[{"month": "YYYY-MM", "score": float}]`, returns everything including `health_components`, `health_weights`, and the `MATURITY_ORDER` list.

**`POST /customers/{customer_id}/insights`** — checks for an existing `AIInsight` row first; if found, returns it with `"cached": true`. Otherwise, builds `customer_data` dict, calls `generate_insight()`, stores the result as a new `AIInsight` row, commits, and returns the result with `"cached": false`.

**`GET /stats`** — loads all customers, computes summaries, aggregates counts per risk tier, average score, total ARR, and ARR in accounts with `risk_level in ("high", "critical")`.

---

### `frontend/app/page.tsx`

Next.js **server component** — runs on the server at request time, not in the browser.

Calls `fetchStats()` and `fetchCustomers()` in parallel with `Promise.all()`. Filters the customers array into 4 lists by `risk_level`. Renders a `StatsBar` followed by 4 optional `<section>` elements (a section is skipped entirely if its list is empty). Each section has a colored header with a dot indicator and a responsive CSS grid of `CustomerCard` components.

Because this is a server component, there is no loading spinner or skeleton — data arrives before the HTML is sent to the browser.

---

### `frontend/app/customers/[id]/page.tsx`

Next.js **server component** with a dynamic route segment (`[id]`). Receives `params.id` from the URL.

Calls `fetchCustomer(Number(params.id))` — a single API call that returns the full customer object including metrics, history, health components, and maturity stages.

Layout:
- Breadcrumb → header card → 3-column grid
- Left column (1/3 width): Key Metrics panel + Adoption Maturity panel
- Right columns (2/3 width): Trend Chart + Score Breakdown + AI Insight Panel

The metric rows are built from an array literal with optional `alert: boolean` flags. When `alert` is true, the value is rendered in red (`text-red-600`). The `extra_metrics` string is split on commas and each piece rendered as a separate `<p>`.

`AIInsightPanel` is a client component — it manages its own `useState` and `fetch` logic. Being a client component nested inside a server component is valid in Next.js 14's App Router.

---

### `frontend/app/components/Header.tsx`

Sticky top navigation bar (`sticky top-0 z-10`). Contains:
- Violet square logo ("CS")
- Title "Customer Success Dashboard" + subtitle "Portfolio Health Monitor"
- Right side: green pulsing dot + "Live · 8 accounts"

The entire logo + title is wrapped in a `<Link href="/">` so clicking it returns to the portfolio.

---

### `frontend/app/components/StatsBar.tsx`

Renders a 5-tile responsive grid (`grid-cols-2 md:grid-cols-5`). Each tile has:
- A label (gray, small)
- A large bold number in a color matching its category (gray, emerald, amber, red, violet)
- A subtitle (gray, smaller)

The "High Risk / Critical" tile combines `stats.high_risk + stats.critical` into one number, and its subtitle shows the ARR at risk formatted by `formatARR()`.

---

### `frontend/app/components/CustomerCard.tsx`

Client component (needs `"use client"` for the `<Link>` navigation). The entire card is a `<Link>` wrapper so the whole surface area is clickable.

Computes `usagePct = Math.round((active_users / licensed_seats) × 100)` and `days = daysUntilRenewal(renewal_date)` inline.

Uses `RISK_COLORS[risk_level]` to drive: the card's ring color (`ring-1` + `ring-{color}-200`), the health ring arc color, the usage bar fill color, and the label badge colors — all consistently from a single source of truth.

The contact days footer text turns red if `last_csm_contact_days > 30`:
```tsx
c.last_csm_contact_days > 30 ? "text-red-500 font-medium" : "text-gray-600 font-medium"
```

---

### `frontend/app/components/HealthRing.tsx`

Pure SVG health score ring. Two `<circle>` elements share the same `cx`, `cy`, `r`, and are drawn inside a container `<svg>` rotated -90° (so the arc starts from the top, not the right).

- Background circle: gray fill (`#e5e7eb`), full circumference
- Foreground circle: `strokeDasharray = circumference`, `strokeDashoffset = circumference - (score/100 × circumference)` — this is the standard CSS technique for animating progress rings
- `strokeLinecap="round"` gives the arc rounded ends
- Score number is absolutely positioned in the center of the SVG

Two sizes: `sm` (radius 28, stroke 4, used on cards) and `lg` (radius 44, stroke 6, used on detail header).

---

### `frontend/app/components/TrendIcon.tsx`

Minimal component that returns one of three JSX elements based on `trend`:
- `"up"` → `↑` in emerald
- `"down"` → `↓` in red
- `"flat"` → `→` in gray

---

### `frontend/app/components/MaturityBar.tsx`

5-segment horizontal bar. The `STAGES` array is defined locally as `["Awareness", "Adoption", "Value Realization", "Optimization", "Transformation"]`. The current stage's index is found with `STAGES.indexOf(stage)`.

In the card (`compact=false` default), renders the bar + current stage label below. In compact mode (not currently used), just renders the stage name as text.

Each segment is a `<div className="h-1.5 flex-1 rounded-full">` with `bg-violet-500` if `i <= idx` (current and past stages) or `bg-gray-200` (future stages).

---

### `frontend/app/components/HealthTrendChart.tsx`

Recharts `LineChart` wrapped in `ResponsiveContainer` (width 100%, height 200px).

`formatMonth()` converts "2024-07" → "Jul" by constructing a `Date` object and calling `.toLocaleString("default", { month: "short" })`.

The data array passed to `LineChart` is the history mapped to `{ month: "Jul", score: 42 }`.

Reference lines at `y=75` (green, "Healthy") and `y=55` (amber, "At Risk") provide visual context for interpreting the chart without needing to read the y-axis values. `strokeDasharray="4 4"` makes them dashed.

---

### `frontend/app/components/ScoreBreakdown.tsx`

5 labeled progress bars, one per health score component. Receives `components` (component scores) and `weights` (weight values) as props.

`LABELS` maps internal keys to display names: `"usage"` → `"Seat Usage"`, `"nps"` → `"NPS Score"`, etc.

`BAR_COLORS` maps keys to Tailwind background classes — each dimension gets a distinct color to make them visually distinct at a glance.

Each bar renders: dimension name + weight % + score/100 on one line, then a full-width gray track with a colored fill proportional to the score.

---

### `frontend/app/components/AIInsightPanel.tsx`

Client component with `useState` for `insight`, `loading`, and `error`.

The `load()` function:
1. Sets `loading = true`, clears error
2. Calls `generateInsight(customerId)` — `POST /customers/{id}/insights`
3. On success, sets `insight`; on failure, sets `error`
4. Always sets `loading = false`

Three render paths:
1. `!insight && !loading` → CTA card with button (and optional error message below)
2. `loading` → pulsing "Claude is analyzing..." text
3. `insight` → result card

The result card's background and border are driven by `RISK_COLORS[insight.risk_level]`, giving it a green, amber, orange, or red tint matching the AI's determined risk level.

The "Cached" / "Just generated" label in the top-right corner of the result card reads `insight.cached` from the API response — a small transparency feature that shows the result came from the database, not a live Claude call.

---

### `frontend/app/lib/api.ts`

All HTTP calls to the FastAPI backend. Base URL read from `NEXT_PUBLIC_API_URL` with fallback to `http://localhost:8001`.

All functions are plain async functions returning typed data. `cache: "no-store"` is set on fetch calls from server components so Next.js does not cache the responses (health data should always be fresh).

```typescript
fetchStats()           → GET /stats         → PortfolioStats
fetchCustomers()       → GET /customers     → CustomerSummary[]
fetchCustomer(id)      → GET /customers/id  → CustomerDetail
generateInsight(id)    → POST /customers/id/insights → AIInsight
```

---

### `frontend/app/lib/types.ts`

TypeScript interfaces that match the FastAPI API response shapes exactly:

**`CustomerSummary`** — returned by `GET /customers` (array items). Includes all fields shown on the customer card: health score, risk level, trend, maturity, usage, NPS, renewal date, ARR.

**`CustomerDetail extends CustomerSummary`** — returned by `GET /customers/{id}`. Adds `health_components`, `health_weights`, `history`, `metrics` (full raw values), and `maturity_stages` (ordered stage list).

**`PortfolioStats`** — returned by `GET /stats`. All count and ARR aggregations.

**`AIInsight`** — returned by `POST /customers/{id}/insights`. Includes `risk_level`, `summary`, `recommendations[]`, `generated_at`, and `cached` boolean.

**Union types:** `RiskLevel = "low" | "medium" | "high" | "critical"`, `Trend = "up" | "down" | "flat"`, `Platform = "sales_cloud" | "service_cloud" | "slack" | "experience_cloud"`.

---

### `frontend/app/lib/utils.ts`

Shared utilities and color maps used across multiple components:

**`PLATFORM_LABELS`** — maps `Platform` → display string (e.g., `"sales_cloud"` → `"Sales Cloud"`)

**`PLATFORM_COLORS`** — maps `Platform` → Tailwind classes for badge background + text

**`RISK_COLORS`** — maps `RiskLevel` → object with `bg`, `text`, `ring`, and `bar` Tailwind classes. The single source of truth for all risk-tier styling across the app.

**`RISK_LABELS`** — maps `RiskLevel` → display string (e.g., `"low"` → `"Healthy"`)

**`formatARR(value)`** — formats dollar amounts: ≥ $1M → "$1.2M", ≥ $1K → "$95K", else "$500"

**`daysUntilRenewal(renewalDate)`** — `Math.ceil((new Date(renewalDate) - Date.now()) / ms_per_day)`. Returns negative numbers for overdue renewals.

**`renewalUrgency(days)`** — returns a Tailwind text color class: `text-red-600` (overdue), `text-orange-600` (< 90 days), `text-amber-600` (< 180 days), `text-gray-500` (> 180 days).

---

## TypeScript Types Reference

```typescript
// Discriminated unions
type RiskLevel = "low" | "medium" | "high" | "critical";
type Trend     = "up" | "down" | "flat";
type Platform  = "sales_cloud" | "service_cloud" | "slack" | "experience_cloud";

// Card-level data (from GET /customers)
interface CustomerSummary {
  id: number;
  name: string;
  platform: Platform;
  tier: string;              // "Standard" | "Premier" | "Signature"
  csm_name: string;
  renewal_date: string;      // "YYYY-MM-DD"
  contract_value: number;    // ARR in USD
  industry: string;
  employee_count: number;
  licensed_seats: number;
  health_score: number;      // 0-100, 1 decimal
  health_label: string;      // "Healthy" | "At Risk" | "High Risk" | "Critical"
  risk_level: RiskLevel;
  trend: Trend;
  maturity_stage: string;
  maturity_index: number;    // 0-4
  active_users: number;
  last_csm_contact_days: number;
  nps_score: number | null;
}

// Full detail page data (from GET /customers/{id})
interface CustomerDetail extends CustomerSummary {
  health_components: Record<string, number>;   // { usage, nps, support, engagement, adoption }
  health_weights: Record<string, number>;       // { usage: 0.30, nps: 0.20, ... }
  history: { month: string; score: number }[];  // 12 entries, "YYYY-MM"
  metrics: {
    active_users: number;
    last_login_days_ago: number;
    nps_score: number | null;
    open_tickets: number;
    avg_resolution_days: number;
    feature_adoption_pct: number;
    maturity_stage: string;
    last_csm_contact_days: number;
    qbrs_completed_ytd: number;
    extra_metrics: string | null;
  };
  maturity_stages: string[];   // ["Awareness", "Adoption", ..., "Transformation"]
}

// Stats bar data (from GET /stats)
interface PortfolioStats {
  total_customers: number;
  healthy: number;
  at_risk: number;
  high_risk: number;
  critical: number;
  avg_health_score: number;
  total_arr: number;
  at_risk_arr: number;
}

// AI insight (from POST /customers/{id}/insights)
interface AIInsight {
  risk_level: RiskLevel;
  summary: string;
  recommendations: string[];  // exactly 3 items
  generated_at: string;       // ISO 8601 UTC
  cached: boolean;
}
```

---

## API Reference

All endpoints served from `http://localhost:8001` (or Railway URL in production).

### `GET /health`
```json
{ "status": "ok" }
```

### `GET /stats`
```json
{
  "total_customers": 8,
  "healthy": 3,
  "at_risk": 2,
  "high_risk": 2,
  "critical": 1,
  "avg_health_score": 64.3,
  "total_arr": 1067000,
  "at_risk_arr": 205000
}
```

### `GET /customers`
Returns array sorted by `health_score` ascending (worst first). Each item is a `CustomerSummary` object.

```json
[
  {
    "id": 6,
    "name": "Apex Manufacturing",
    "platform": "sales_cloud",
    "tier": "Standard",
    "health_score": 22.2,
    "health_label": "Critical",
    "risk_level": "critical",
    "trend": "down",
    "maturity_stage": "Awareness",
    "maturity_index": 0,
    "active_users": 34,
    "licensed_seats": 120,
    "nps_score": -18,
    "last_csm_contact_days": 58,
    "contract_value": 38000,
    "renewal_date": "2025-07-15",
    ...
  },
  ...
]
```

### `GET /customers/{id}`
Returns full `CustomerDetail`. Includes all summary fields plus:
```json
{
  "health_components": {
    "usage": 28.3,
    "nps": 41.0,
    "support": 5.3,
    "engagement": 3.3,
    "adoption": 18.0
  },
  "health_weights": {
    "usage": 0.30,
    "nps": 0.20,
    "support": 0.15,
    "engagement": 0.15,
    "adoption": 0.20
  },
  "history": [
    { "month": "2024-05", "score": 55 },
    { "month": "2024-06", "score": 52 },
    ...
  ],
  "metrics": {
    "active_users": 34,
    "last_login_days_ago": 31,
    "nps_score": -18,
    "open_tickets": 19,
    "avg_resolution_days": 11.4,
    "feature_adoption_pct": 18.0,
    "maturity_stage": "Awareness",
    "last_csm_contact_days": 58,
    "qbrs_completed_ytd": 0,
    "extra_metrics": "Win Rate: 14%, Pipeline: $1.1M, No active Flows or automation"
  },
  "maturity_stages": ["Awareness", "Adoption", "Value Realization", "Optimization", "Transformation"]
}
```

### `POST /customers/{id}/insights`
No request body. Returns cached result if one exists, otherwise calls Claude and stores the result.

```json
{
  "risk_level": "critical",
  "summary": "Apex Manufacturing is in severe churn risk with only 28% license utilization, an NPS of -18, and no QBRs completed this year.",
  "recommendations": [
    "Schedule an emergency executive business review within the next 7 days to align on adoption blockers and renewal risk.",
    "Assign a dedicated adoption specialist to deliver a structured onboarding program for the 86 inactive licensed users.",
    "Escalate to the Sales team immediately to assess renewal likelihood and explore contract restructuring options."
  ],
  "generated_at": "2025-04-21T14:32:00.123456",
  "cached": false
}
```

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### 1. Backend

```bash
cd cs-dashboard/backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Mac/Linux
# .venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set: ANTHROPIC_API_KEY=sk-ant-...

# Start the server
uvicorn main:app --reload --port 8001
```

On first startup, the server will:
1. Create `cs_dashboard.db` in the backend directory
2. Seed all 8 demo customers with 12 months of health history
3. Be ready to serve requests immediately

Swagger UI (auto-generated API docs): `http://localhost:8001/docs`

### 2. Frontend

```bash
cd cs-dashboard/frontend

npm install

# .env.local is pre-configured:
# NEXT_PUBLIC_API_URL=http://localhost:8001

npm run dev
```

Open `http://localhost:3000`.

### 3. Verify everything works

```bash
# Check backend health
curl http://localhost:8001/health
# → {"status":"ok"}

# View portfolio stats
curl http://localhost:8001/stats | python3 -m json.tool

# See all customers ranked by health score
curl http://localhost:8001/customers | python3 -c "
import json, sys
for c in json.load(sys.stdin):
    print(f\"{c['name']:25} score={c['health_score']:5.1f}  risk={c['risk_level']:8}  trend={c['trend']}\")"

# Generate an AI insight (Apex Manufacturing = customer 6)
curl -X POST http://localhost:8001/customers/6/insights | python3 -m json.tool
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Anthropic API key. Get one at console.anthropic.com. Never commit this file. |
| `DATABASE_URL` | No | `sqlite:///./cs_dashboard.db` | SQLAlchemy connection string. For PostgreSQL on Railway: `postgresql://user:pass@host/db` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8001` | Backend URL. Set to your Railway deployment URL in production. |

---

## Deployment

### Backend → Railway

1. Create a new project at [railway.app](https://railway.app) and connect this GitHub repo
2. Set root directory: `cs-dashboard/backend/`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `ANTHROPIC_API_KEY` = your key
   - `DATABASE_URL` = leave empty to use SQLite, or add a Railway PostgreSQL plugin and use its connection string
5. Deploy — Railway will install dependencies and start the server
6. Note your Railway public URL (e.g., `https://cs-backend.up.railway.app`)

### Frontend → Vercel

1. Import this repo at [vercel.com](https://vercel.com)
2. Set root directory: `cs-dashboard/frontend/`
3. Framework: **Next.js** (auto-detected)
4. Environment variable: `NEXT_PUBLIC_API_URL` = your Railway backend URL
5. Deploy

### Update CORS for production

In `backend/main.py`, add your Vercel domain to `allow_origins` if needed:

```python
allow_origins=[
    "http://localhost:3000",
    "https://*.vercel.app",
    "https://your-custom-domain.com",  # add if using a custom domain
],
```

---

## How to Use the App

1. **Open** `http://localhost:3000`
2. **Read the stats bar** — immediately see how many accounts are healthy vs. at risk and how much ARR is exposed
3. **Scan the Critical section** — accounts here need same-week action
4. **Click any customer card** — opens the full detail view
5. **Review Key Metrics** — red values indicate fields that exceed alert thresholds
6. **Read the Adoption Maturity panel** — see where the customer sits in their platform journey and what the next stage requires
7. **Study the 12-month chart** — is the trend improving or declining? When did the inflection happen?
8. **Open Score Breakdown** — understand exactly which dimensions are dragging the score down
9. **Click "Generate Insight"** — Claude analyzes all 9 metrics and returns a risk assessment + 3 prioritized action items in ~3 seconds
10. **Go back to portfolio** — breadcrumb at the top, or click the CS logo in the header
