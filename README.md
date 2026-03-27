# Scope3Scout

**We don't trust supplier reports -- we verify them using autonomous web agents.**

[![Status](https://img.shields.io/badge/status-active_development-brightgreen)]()
[![Hackathon](https://img.shields.io/badge/TinyFish_Hackathon-2026-blue)]()
[![Stack](https://img.shields.io/badge/stack-React_+_Supabase_+_TinyFish-purple)]()
[![CSRD](https://img.shields.io/badge/regulation-EU_CSRD_2026-orange)]()

---

## What Is Scope3Scout?

Scope3Scout is an autonomous ESG supply chain intelligence platform that monitors, verifies, and predicts risk across a company's entire supplier network. It deploys 16 AI agents that autonomously browse real websites, cross-reference supplier claims against evidence, detect contradictions, and predict regulatory consequences -- all in real-time.

Companies are legally required under the EU's CSRD (Corporate Sustainability Reporting Directive) to verify the environmental and social conduct of their suppliers, with fines reaching up to 10% of annual turnover. Scope3Scout automates what currently takes compliance teams 3-6 months and EUR 100,000+ in analyst time.

---

## Demo

Select a supplier. Click "Run Audit". Watch 16 autonomous agents scan real websites, extract claims, verify certifications, and detect contradictions -- live.

When a mismatch is found between what a supplier claims and what the evidence shows, the system surfaces a contradiction panel with financial exposure estimates and time-to-impact predictions.

---

## How It Works

### Three-Tier Intelligence Pipeline

```
TIER 1: Autonomous Web Agents (TinyFish API -- LIVE)
  8 agents per supplier, running in parallel
  - Claim Extractor ............ Scrapes supplier website for ESG claims
  - Certification Verifier ..... Checks ISO registries for valid certificates
  - Compliance Auditor ......... Searches government databases for fines
  - News Scanner ............... Monitors news for controversies
  - Workforce Monitor .......... Detects layoffs and key departures
  - Supply Chain Mapper ........ Maps sub-supplier network and risks
  - Financial Analyst .......... Assesses financial stability signals
  - CSRD Validator ............. Cross-checks sustainability disclosures

TIER 2: LLM Cross-Reference
  4 agents analyzing Tier 1 output
  - Violation Classifier ....... Categorizes and ranks violations
  - Greenwash Detector ......... Finds claim-vs-evidence mismatches
  - Evidence Extractor ......... Ranks and links evidence chains
  - Sentiment Analyzer ......... Measures public perception risk

TIER 3: Risk Prediction
  4 agents simulating stakeholder response
  - Regulator Predictor ........ Predicts enforcement probability
  - Media Risk Predictor ....... Predicts press coverage likelihood
  - Investor Risk Predictor .... Predicts ESG fund divestment
  - NGO Response Predictor ..... Predicts advocacy group actions
```

### Contradiction Detection

The core value proposition: when Tier 1 extracts a supplier claim (e.g., "ISO 14001 Certified") and another agent finds contradicting evidence (e.g., certificate expired), the system automatically generates a contradiction alert with:

- Supplier claim vs. evidence found (side by side)
- Confidence score (0-100%)
- Estimated financial exposure (EUR)
- Time-to-impact prediction (days)
- Source URL for verification

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, TypeScript, Vite | Application framework |
| Styling | Tailwind CSS 3, Framer Motion | Dark glassmorphic UI with animations |
| Auth | Supabase Auth | Email/password authentication |
| Database | Supabase (PostgreSQL) | Supplier data, violations, scan results |
| AI Scraping | TinyFish Web Agent API | Real-time browser automation via SSE |
| LLM | Google Gemini, OpenAI | Tier 2 claim cross-referencing |
| PDF Reports | jsPDF + AutoTable | CSRD-compliant report generation |
| CSV Import | PapaParse | Bulk supplier upload |
| 3D Visual | Spline | Landing page visualization |
| Data Layer | TanStack React Query | Server state management |
| Hosting | Vercel | Production deployment |

---

## Application Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with value proposition |
| Auth | `/auth` | Sign in / sign up |
| Dashboard | `/dashboard` | Risk overview, CCTV agent grid, supplier table |
| Supplier Detail | `/supplier/:id` | Full audit with live agent scan, violations, predictions |
| Upload | `/upload` | CSV bulk import or manual supplier entry |
| Reports | `/reports` | Generate and download CSRD-compliant PDF reports |
| Alerts | `/alerts` | Real-time violation notifications with severity filters |
| Settings | `/settings` | API key management, org settings, notification preferences |

---

## Key Features

**Live Agent Grid (CCTV View)**
Watch 16 agents work in real-time. Each agent card shows: LIVE/DEMO badge, terminal-style logs of actions being taken, progress bar, and final findings. Hero agents (Claim Extractor, Certification Verifier, Compliance Auditor, News Scanner) are prominently displayed. Secondary agents collapse under "+ more agents" to reduce cognitive load.

**Mission Control Bar**
Top-level status showing: current supplier being audited, LIVE/DEMO mode indicator, animated progress bar, elapsed time, and contradiction count. Animated gradient border during active scanning.

**Contradiction Panel**
The centerpiece. Animated red panel that slides in when mismatches are detected. Shows claim vs. evidence side-by-side, confidence bar, financial exposure in EUR, time-to-impact in days, and source link. Auto-scrolls into view with background dim effect.

**Timeline Feed**
Real-time scrolling event log showing every agent action with timestamp, agent name, and color-coded message type (step, action, success, warning, contradiction).

**Action Panel**
Post-scan actions: auto-contact supplier, generate CSRD report (real PDF), download evidence (JSON), re-run scan. Includes audit summary with risk score, risk level, contradiction count, violation count, and CSRD compliance status.

**API Key Management**
API keys (TinyFish, Gemini, OpenAI) are stored in localStorage via the Settings page. No Vercel environment variables needed for demo. Priority: localStorage > env var > empty (falls back to demo mode).

---

## Quick Start

```bash
git clone https://github.com/m-zest/Scope3Scout.git
cd Scope3Scout
npm install
npm run dev
```

Runs at `http://localhost:8080`.

### Environment Variables

```bash
# Supabase (required for auth and real data persistence)
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# TinyFish (optional -- can be entered via Settings page)
VITE_TINYFISH_API_KEY=

# LLM (optional -- for Tier 2 analysis)
VITE_GEMINI_API_KEY=
VITE_OPENAI_API_KEY=
```

All API keys can also be entered through the Settings page at runtime. The app works in demo mode without any keys configured.

---

## Why TinyFish Is Essential

ESG compliance data lives behind dynamic web portals with no APIs:

| Source | API? | Reality |
|--------|------|---------|
| German Federal Environment Agency (UBA) | No | Complex form navigation |
| Hungarian OKIR Environmental Registry | No | Multi-step portal |
| Romanian ANPM Environmental Agency | No | Browser-only access |
| ISO Certification Verification Portals | No | Blocks traditional scrapers |
| Regional Labour Violation Databases | No | Scattered across 27 EU country portals |
| Local News Sites | No | Dynamic JavaScript rendering |

TinyFish agents interact with these portals exactly like a human compliance analyst would, at 1000x the speed. Remove TinyFish and the product cannot exist.

---

## Business Context

| Regulation | Region | Deadline | Penalty |
|-----------|--------|----------|---------|
| CSRD | EU (50,000+ companies) | 2025-2027 | Up to 10% turnover |
| TCFD + SECR | UK | Active | FCA enforcement |
| SEC Climate Rules | USA | 2026-2027 | SEC enforcement |
| ASRS | Australia | 2025-2027 | Active |

Current alternative: consulting firms charge EUR 100,000-500,000 for a one-time audit. Scope3Scout provides continuous, automated monitoring.

---

## Team

**Mohammad Zeeshan** -- Lead Developer and Architect
- Built Parity AI, an enterprise AI Governance and Compliance platform
- Deep expertise in compliance platforms, enterprise security, and AI governance
- Building from Europe with direct understanding of EU regulatory fragmentation
- GitHub: [@m-zest](https://github.com/m-zest)

---

## Legal

```
Copyright (c) 2026 Mohammad Zeeshan
All Rights Reserved

Source available for evaluation purposes only.
Commercial use requires written permission.
```

TinyFish API used with permission for hackathon and commercial development.

---

Built for the TinyFish $2M Pre-Accelerator Hackathon -- March 2026

*Scope3Scout -- We don't trust supplier reports. We verify them.*
