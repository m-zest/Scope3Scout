# Scope3Scout 🌍

> **"Find what your suppliers are hiding before regulators do."**

[![Status](https://img.shields.io/badge/status-active_development-brightgreen)]()
[![Hackathon](https://img.shields.io/badge/TinyFish_Hackathon-2026-blue)]()
[![License](https://img.shields.io/badge/license-Proprietary-red)]()
[![Stack](https://img.shields.io/badge/stack-React_+_Supabase_+_TinyFish-purple)]()
[![CSRD](https://img.shields.io/badge/regulation-EU_CSRD_2026-orange)]()

---

## 🎬 Submission Links

📺 **[Watch the 3-Minute Demo Video](#)** ← *Added on submission day*
🐦 **[View Official X/Twitter Launch Post](#)** ← *Added on submission day*
🌐 **[Live Demo](https://scope3scout.ai)**

---

## 📌 What Is Scope3Scout?

Scope3Scout is an **autonomous ESG supply chain intelligence platform** that automatically monitors, verifies, and predicts risk across a company's entire supplier network.

Companies are now **legally required** to report the environmental and social conduct of their suppliers under the EU's **CSRD law** (Corporate Sustainability Reporting Directive) — with fines reaching **10% of annual turnover** for non-compliance.

The problem: verifying 200+ suppliers manually takes **3-6 months** and **€100,000+** in analyst time. Suppliers lie. Certifications expire. Violations get buried in regional government databases nobody checks.

**Scope3Scout does it in minutes. Automatically. Every week.**

---

## 🎯 The Problem We Solve

### What is Scope 3?

Every company produces pollution from 3 sources:

| Scope | What It Covers | Example |
|-------|---------------|---------|
| **Scope 1** | Your own direct emissions | Your factory, your cars |
| **Scope 2** | Energy you purchase | Your electricity bill |
| **Scope 3** | Your entire supply chain | Your suppliers' factories, trucks, workers |

**Scope 3 = 70-90% of a company's total carbon footprint** — and companies are now legally responsible for it even though they don't directly control it.

### The Regulatory Crisis

| Regulation | Region | Deadline | Fine |
|-----------|--------|----------|------|
| **CSRD** | EU (50,000+ companies) | 2025-2027 | Up to 10% turnover |
| **TCFD + SECR** | UK | Active now | FCA enforcement |
| **SEC Climate Rules** | USA | 2026-2027 | SEC enforcement |
| **ASRS** | Australia | 2025-2027 | Active |
| **ISSB Standards** | Global | Rolling out | Country-specific |

### The Current Pain

```
Company has 200 suppliers →
Compliance team manually:
  → Emails each supplier asking for ESG reports
  → Googles their name for violations
  → Checks government databases one by one
  → Reads PDFs and annual reports
  → Verifies certifications manually

Result:
  → Takes 3-6 months
  → Costs €100,000+ in analyst time
  → Still misses things
  → Backward looking — no prediction
  → Regulators still not satisfied
```

### What Suppliers Actually Do

```
Supplier claims: "ISO 14001 certified ✅"
Reality:          Certificate expired 2 years ago

Supplier claims: "Zero violations on record ✅"
Reality:          €40,000 EPA fine issued last month

Supplier claims: "Living wage employer ✅"
Reality:          3 labour strikes reported this year

= Companies get fined for their supplier's lies
= Even if the company had no idea
= CSRD makes YOU responsible
```

---

## ✅ What Scope3Scout Does

```
BEFORE Scope3Scout:
"We think our suppliers are compliant
but we're not sure and it took us 6 months to check"

AFTER Scope3Scout:
"We scan all 200 suppliers every week automatically.
We caught 3 lying about certifications.
Our simulation says Supplier X will cause a
regulatory problem in Q2. We already switched.
We are fully CSRD compliant."
```

---

## ⚰️ The API Graveyard — Why This Requires TinyFish

> TinyFish's own test: *"If your application can be built without a web agent navigating real websites — it's not a fit."*

**Scope3Scout fails this test in the best possible way. It literally cannot exist without TinyFish.**

Traditional compliance tools rely on APIs. The ESG data world does not have APIs:

| Data Source | API Available? | Reality |
|-------------|---------------|---------|
| German Bundesanzeiger (Company Register) | ❌ | Complex form navigation required |
| Hungarian OKIR (Environmental Registry) | ❌ | Multi-step portal, no API |
| Romanian ANPM (Environmental Agency) | ❌ | Only accessible via browser |
| Regional labour violation databases | ❌ | Scattered across 27 EU country portals |
| ISO certification verification portals | ❌ | Actively blocks traditional scrapers |
| Local news sites (labour strikes) | ❌ | Dynamic JavaScript rendering |
| B-Corp certification registry | ❌ | Pagination + dynamic UI |
| National court records (most EU countries) | ❌ | Behind login or complex navigation |

**Every single critical data source has no API.**

This is exactly why compliance teams currently pay humans to act as human APIs — manually navigating these fragmented, dynamic, localized systems. TinyFish agents do what no traditional software can: interact with these portals exactly like a human compliance analyst would, at 1000x the speed and 1/100th the cost.

```
Remove TinyFish → product does not exist
Replace with regular scraper → blocked immediately
Replace with LLM + search → stale cached data
Replace with APIs → APIs don't exist

= TinyFish is not an integration
= TinyFish is the foundation
```

---

## 🏗️ How It Works — Full Architecture

### The Three-Tier Intelligence System

---

#### 🔵 Tier 1 — Continuous Monitoring (All Suppliers, Weekly)

**Powered by: TinyFish + Gemini Flash**

For every supplier, TinyFish runs 5 parallel agents simultaneously:

```
Agent 1 → Supplier's own website
          Extracts ESG claims, certifications,
          sustainability commitments, policies

Agent 2 → EU EPA + national environmental databases
          Searches for fines, violations, penalties
          ec.europa.eu/environment + national portals

Agent 3 → Regional news monitoring
          Last 90 days of coverage
          Labour issues, environmental incidents,
          court cases, controversies

Agent 4 → Certification verification portals
          ISO 14001, B-Corp, industry certs
          Checks validity + expiry dates

Agent 5 → LinkedIn company page
          Recent layoffs (instability signal)
          Key ESG officer departures
          Hiring patterns
```

Gemini Flash cross-references claims vs findings.
**Triggers Tier 2 if:** `flag_severity = "high"` or `"critical"`

---

#### 🟡 Tier 2 — Deep Investigation (Flagged Suppliers Only)

**Powered by: TinyFish + GPT-4o**

```
→ Court records and legal databases
→ Additional news sources (5+ outlets)
→ Full annual report extraction
→ Competitor ESG comparison
→ Government tender records
```

**Triggers Tier 3 if:** Any violation with `severity = "critical"`

---

#### 🔴 Tier 3 — Predictive Simulation (Critical Violations Only)

**Powered by: Our Proprietary Simulation Engine**

This is our **core competitive moat**. Violation data is sent to our proprietary simulation engine which creates agents representing:

```
→ EU Regulatory Inspector
→ ESG Investigative Journalist
→ Institutional Investor
→ NGO Watchdog
→ Procurement Auditor
→ Government Enforcement Officer
```

Each agent independently predicts reaction + timeline.

**Sample output:**
```json
{
  "risk_score": 91,
  "risk_level": "critical",
  "predictions": [
    {
      "agent_type": "regulator",
      "prediction": "Enforcement review likely",
      "probability": 0.91,
      "timeline_days": 45
    },
    {
      "agent_type": "media",
      "prediction": "Regional news coverage imminent",
      "probability": 0.67,
      "timeline_days": 30
    }
  ],
  "recommended_action": "Switch supplier within 30 days",
  "csrd_compliant": false,
  "financial_exposure_eur": 2300000
}
```

---

### Data Contracts Between Tiers

```
Tier 1 → Tier 2:
{
  "supplier_id": "uuid",
  "supplier_name": "string",
  "supplier_website": "string",
  "flag_severity": "none|low|medium|high|critical",
  "discrepancies": [
    {
      "claim": "string",
      "finding": "string",
      "source_url": "string",
      "confidence": 0.0-1.0
    }
  ],
  "raw_sources": ["url1", "url2"]
}

Tier 2 → Tier 3:
{
  "supplier_id": "uuid",
  "supplier_name": "string",
  "country": "string",
  "industry": "string",
  "violations": [
    {
      "type": "environmental|labour|legal|financial",
      "severity": "low|medium|high|critical",
      "description": "string",
      "date_found": "ISO date",
      "source_url": "string",
      "fine_amount_eur": number|null
    }
  ],
  "trigger_reason": "string"
}

Tier 3 → Dashboard:
{
  "supplier_id": "uuid",
  "risk_score": 0-100,
  "risk_level": "low|medium|high|critical",
  "predictions": [...],
  "recommended_action": "string",
  "csrd_compliant": boolean,
  "financial_exposure_eur": number
}
```

---

## 💻 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript 5.8** | Type safety |
| **Tailwind CSS 3** | Styling |
| **shadcn/ui** | UI components |
| **Recharts** | Risk visualization |
| **Framer Motion** | Animations |
| **React Hook Form + Zod** | Form validation |
| **TanStack React Query** | Data fetching |
| **React Router DOM 6** | Routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Supabase** | PostgreSQL + Auth + Realtime |
| **Supabase Storage** | Document storage |
| **Row Level Security** | Multi-tenant isolation |
| **Supabase Edge Functions** | Scheduled weekly scans |

### AI & Agent Layer
| Technology | Purpose |
|-----------|---------|
| **TinyFish Web Agent API** | Parallel web scraping + navigation |
| **Gemini Flash** | Tier 1 cross-referencing (fast + cheap) |
| **GPT-4o** | Tier 2 deep analysis |
| **Proprietary Simulation Engine** | Tier 3 predictive risk scoring |

### Reports & Import
| Technology | Purpose |
|-----------|---------|
| **jsPDF + AutoTable** | PDF compliance reports |
| **PapaParse** | CSV supplier list import |

---

## 🔒 Enterprise Security & Trust

Our target buyers are Chief Procurement Officers at large EU corporations. Security is non-negotiable.

**Built on Parity AI's enterprise-grade security heritage:**

| Feature | Implementation |
|---------|---------------|
| **Multi-tenant isolation** | RLS on all Supabase tables — Company A cannot see Company B's data |
| **GDPR compliance** | EU supplier data stays within EU infrastructure |
| **Zero-retention LLM** | Enterprise API endpoints with zero data-training retention |
| **No credential storage** | TinyFish uses session-based access only — no passwords stored |
| **Encrypted at rest** | All data encrypted in Supabase PostgreSQL |
| **Full audit trail** | Every scan, finding, and action logged |
| **Role-based access** | Admin/user/viewer roles per organization |

---

## 🗄️ Database Schema

```
organizations       → Multi-tenant company data
profiles            → User profiles linked to org
user_roles          → Role-based access control
suppliers           → Supplier registry per org
scans               → Scan history + status
tier1_results       → Raw TinyFish findings
violations          → Confirmed violations per supplier
discrepancies       → Claim vs reality gaps
simulation_outputs  → Tier 3 prediction results
alerts              → Real-time notifications
reports             → Generated PDF history
audit_logs          → Full activity trail
```

---

## 📱 Application Pages

| Page | Route | What It Does |
|------|-------|-------------|
| **Upload** | `/upload` | CSV import or manual supplier add |
| **Dashboard** | `/dashboard` | Risk overview across all suppliers |
| **Supplier Detail** | `/supplier/:id` | Full violations + simulation predictions |
| **Reports** | `/reports` | Generate + download CSRD PDF reports |
| **Alerts** | `/alerts` | Real-time violation notifications |
| **Settings** | `/settings` | API keys, scan frequency, team management |

---

## 🌍 Market

### Primary — EU (Launch)
```
50,000+ large EU companies
CSRD enforcement active NOW
Fines: up to 10% annual turnover
Current solution: Manual analysts costing €100k+/year
Our solution: €24k/year, automated, continuous
```

### Expansion
```
UK    → TCFD + SECR compliance
USA   → SEC Climate Rules (2026)
AUS   → ASRS (2025-2027)
Global → ISSB Standards
```

---

## 💰 Business Model

| Plan | Price | Suppliers |
|------|-------|-----------|
| **Starter** | €499/month | Up to 50 |
| **Growth** | €1,999/month | Up to 200 |
| **Enterprise** | €4,999/month | Unlimited + API |

**vs Current Alternative:**
```
Consulting audit  → €100,000-500,000 (one time)
Analyst team      → €100,000+/year
Scope3Scout       → €24,000/year + continuous + predictive
```

---

## 🚀 13-Day Build Plan

```
Day 1-2:  Supabase schema + CSV upload UI
Day 3-4:  TinyFish Tier 1 — one supplier end to end
Day 5-6:  LLM cross-reference + discrepancy detection
Day 7:    Tier 2 deep investigation
Day 8:    Simulation engine API connection (Tier 3)
Day 9:    Full risk dashboard
Day 10:   PDF reports + alert system
Day 11:   End to end testing with real suppliers
Day 12:   Demo video recording
Day 13:   Submit on HackerEarth + post on X
```

---

## 🏆 Why We Win

**1. TinyFish is irreplaceable**
200 suppliers in parallel. Behind dynamic pages. No APIs exist. Regional databases across 27 EU countries. Multiple languages. Cannot be replicated any other way.

**2. Simulation engine is our moat**
Proprietary — 100% owned. Predicts future risk not just current state. No competitor has this. Gets smarter with more data.

**3. Fits exact pattern of selected builders**
NiteCapp, KYC Copilot, ContractSense, MarketLens all did: multi-source messy web → structured intelligence. Scope3Scout does the same for ESG supply chains.

**4. Market urgency is undeniable**
CSRD fines active now. Compliance teams panicking. Budget allocated. No automated solution exists.

**5. Founder-market fit**
Building from Europe, for European regulation. We understand the fragmentation of EU national databases — Germany's UBA, Hungary's OKIR, Romania's ANPM — giving us a massive execution advantage over US-centric tools.

---

## 👥 Team

**Mohammad Zeeshan** — Lead Developer & Architect
- Built **Parity AI** — Enterprise AI Governance & Compliance Platform (live at parity-v2.vercel.app)
- Built **proprietary simulation engine** — multi-agent predictive intelligence system
- Deep expertise in compliance platforms, enterprise security, AI governance
- Building from Europe with direct understanding of EU regulatory fragmentation
- GitHub: [@m-zest](https://github.com/m-zest)

---

## 🔑 Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# TinyFish (used with permission)
VITE_TINYFISH_API_KEY=

# LLM
VITE_GEMINI_API_KEY=
VITE_OPENAI_API_KEY=

# Proprietary Simulation Engine
VITE_SIMULATION_ENGINE_URL=
VITE_SIMULATION_ENGINE_KEY=
```

---

## 📦 Quick Start

```bash
git clone https://github.com/m-zest/scope3scout.git
cd scope3scout
npm install
cp .env.example .env
npm run dev
```

Runs at `http://localhost:8080`

---

## 🗺️ Roadmap

### Hackathon MVP
- [ ] Supabase schema + migrations
- [ ] Supplier CSV upload
- [ ] TinyFish Tier 1 parallel scanning
- [ ] LLM cross-reference engine
- [ ] TinyFish Tier 2 deep investigation
- [ ] Simulation engine Tier 3 integration
- [ ] Risk dashboard
- [ ] PDF report generation
- [ ] Alert system
- [ ] Demo video + X post

### v2 Post-Hackathon
- [ ] Email + Slack integrations
- [ ] UK, US, Australia database coverage
- [ ] Enterprise API
- [ ] White-label for consulting firms
- [ ] Automated CSRD filing directly to regulators

---

## ⚖️ Legal

```
Copyright (c) 2026 Mohammad Zeeshan
All Rights Reserved

Source available for evaluation purposes only.
Commercial use requires written permission.
Contact: hello@scope3scout.ai
```

**TinyFish:** Used with explicit written permission for hackathon and commercial development.

---

## 🔗 Links

- **Hackathon:** [TinyFish $2M Pre-Accelerator Hackathon](https://www.hackerearth.com/challenges/hackathon/the-tiny-fish-hackathon-2026/)
- **TinyFish:** [tinyfish.ai](https://tinyfish.ai)
- **CSRD:** [European Commission CSRD](https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en)
- **Demo Video:** *Coming March 29, 2026*
- **X Post:** *Coming March 29, 2026*

---

*Built for the TinyFish $2M Pre-Accelerator Hackathon — March 2026*
*Scope3Scout — Find what your suppliers are hiding before regulators do.*
