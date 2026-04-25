# Scope3Scout

<p align="center"><strong>Autonomous ESG supply chain intelligence for the CSRD era.</strong></p>

<p align="center">
  <em>We don't trust supplier reports  -  we verify them using autonomous browser agents.</em>
</p>

<p align="center">
  <a href="https://m-zest.github.io/scope3scout_pitch/"><img src="https://img.shields.io/badge/Pitch_Deck-View_Live-0F7A6C?style=for-the-badge" alt="Pitch Deck" /></a>
  <a href="https://scope3-scout.vercel.app/"><img src="https://img.shields.io/badge/Product-scope3--scout.vercel.app-142036?style=for-the-badge" alt="Live Demo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TinyFish_Accelerator-Phase_1_Cleared-1EA896" alt="Phase 1 Cleared" />
  <img src="https://img.shields.io/badge/TinyFish_Accelerator-Phase_2_Active-FF5D42" alt="Phase 2 Active" />
  <img src="https://img.shields.io/badge/Regulation-EU_CSRD_2026--2027-E8B04B" alt="CSRD" />
  <img src="https://img.shields.io/badge/Stack-React_19_·_Supabase_·_TinyFish_·_Fireworks-142036" alt="Stack" />
  <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" alt="License: AGPL v3" />
</p>

---

## TinyFish Accelerator Journey

<table>
<tr>
<td align="center" width="50%">

### Phase 1  -  Cleared
**March 2026 · Hackathon**

Selected from the TinyFish Pre-Accelerator hackathon applicant pool on the strength of the TinyFish-native architecture and the regulatory urgency of the CSRD use case.

Evaluators specifically cited the depth of the SSE integration and the product's positioning against a €12B+ compliance spend market.

</td>
<td align="center" width="50%">

### Phase 2  -  Active
**April 2026 · Build Sprint**

14-day sprint toward **Demo Day pitch to Robin Vasan at Mango Capital** for a share of the **$2M seed pool**.

Focus: multi-supplier batch scanning, real contradiction detection via Fireworks (Llama 70B), CSRD-compliant PDF reports, and increased TinyFish concurrency.

</td>
</tr>
</table>

**[View the Demo Day pitch deck →](https://m-zest.github.io/scope3scout_pitch/)**

---

## The Thesis

Under the EU Corporate Sustainability Reporting Directive (CSRD), **50,000+ European companies are legally required** to verify the environmental and social conduct of every supplier in their value chain. Fines reach **10% of annual turnover**.

Three problems make this nearly impossible today:

1. **ESG compliance data has no APIs.** It lives behind dynamic, JavaScript-rendered government portals across 27 EU member states.
2. **Current solutions are either manual or blind.** Consulting firms charge €100–500K per one-time audit. ESG SaaS platforms trust self-reported data without independent verification.
3. **The regulatory window is closing.** Enforcement begins 2027. Companies need continuous verification, not annual reports.

Scope3Scout automates what currently takes compliance teams **3–6 months and €100,000+ in analyst fees**, using autonomous browser agents to independently verify supplier claims against real-world evidence.

---

## Product

Select a supplier. Click *Run Audit*. Watch 16 autonomous AI agents scan real websites, extract claims, verify certifications against government registries, and surface contradictions in real-time.

When a mismatch is detected between what a supplier claims and what public evidence shows, the system generates a **contradiction alert** with confidence score, financial exposure estimate, time-to-impact prediction, and source URL.

<p align="center">
  <a href="https://scope3-scout.vercel.app/"><b>Try the live product →</b></a>
</p>

---

## Three-Tier Intelligence Pipeline

```
┌────────────────────────────────────────────────────────────────────┐
│  TIER 1 · Autonomous Web Agents          8 agents · TinyFish API   │
├────────────────────────────────────────────────────────────────────┤
│  Claim Extractor .......... Scrapes supplier websites for ESG claims
│  Certification Verifier ... Validates ISO certificates in registries
│  Compliance Auditor ....... Searches government databases for fines
│  News Scanner ............. Monitors news archives for controversies
│  Workforce Monitor ........ Detects layoffs and key departures
│  Supply Chain Mapper ...... Maps sub-supplier networks and risks
│  Financial Analyst ........ Assesses financial stability signals
│  CSRD Validator ........... Cross-checks sustainability disclosures
└────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────┐
│  TIER 2 · LLM Cross-Reference            4 agents · Fireworks 70B  │
├────────────────────────────────────────────────────────────────────┤
│  Violation Classifier ..... Categorizes and ranks violations
│  Greenwash Detector ....... Finds claim-vs-evidence mismatches
│  Evidence Extractor ....... Ranks and links evidence chains
│  Sentiment Analyzer ....... Measures public perception risk
└────────────────────────────────────────────────────────────────────┘
                                  ↓
┌────────────────────────────────────────────────────────────────────┐
│  TIER 3 · Risk Prediction                4 agents · Simulation     │
├────────────────────────────────────────────────────────────────────┤
│  Regulator Predictor ...... Predicts enforcement probability
│  Media Risk Predictor ..... Predicts press coverage likelihood
│  Investor Risk Predictor .. Predicts ESG fund divestment
│  NGO Response Predictor ... Predicts advocacy group actions
└────────────────────────────────────────────────────────────────────┘
```

### Contradiction Detection

When Tier 1 extracts a supplier claim and another agent finds conflicting evidence, the system automatically generates a contradiction alert:

| Supplier Claim | Evidence Found |
|---|---|
| *"ISO 14001 certified, audited annually."* | Certificate expired 14 months ago. No renewal on file with ISO registry. |
| Source: `supplier-co.com/sustainability` | Source: `iso.org/certificate-search` |

**Risk assessment appended automatically:**

| Confidence | Financial Exposure | Time to Impact | Risk Tier |
|:---:|:---:|:---:|:---:|
| **94%** | **€2.4M** | **~45 days** | **CRITICAL** |

---

## Why TinyFish Is Core

ESG compliance data lives behind dynamic web portals with no public APIs. Traditional scrapers cannot access them. **Remove TinyFish and the product cannot exist.**

| Data Source | API? | How TinyFish Accesses It |
|---|:---:|---|
| German Federal Environment Agency (UBA) | No | Multi-step form navigation |
| Hungarian OKIR Environmental Registry | No | Dynamic portal traversal |
| Romanian ANPM Environmental Agency | No | Browser-only JavaScript rendering |
| ISO Certification Verification Portals | No | Anti-bot bypass |
| Regional Labour Violation Databases | No | Scattered across 27 country portals |
| Local News Archives | No | Dynamic content extraction |

TinyFish browser agents interact with these portals the way a human compliance analyst would  -  at **1,000x the speed**.

> Scope3Scout is not a TinyFish user. Scope3Scout is a **TinyFish-native product.**

---

## Market

| | Size | Scope |
|---|---|---|
| **TAM** | €12B+ | Global ESG compliance software and consulting  -  150,000+ companies across CSRD, SEC Climate, TCFD, ASRS |
| **SAM** | €3.5B | EU CSRD mandatory compliance  -  50,000+ companies required to verify supplier conduct by 2027 |
| **SOM** | €120M | Mid-market EU companies (250–2,000 employees) pursuing automation  -  12,000 companies at €10K ACV |

### Regulatory Landscape

| Regulation | Region | Deadline | Penalty |
|---|---|---|---|
| **CSRD** | European Union (50,000+ companies) | 2025 – 2027 | Up to 10% of annual turnover |
| **SEC Climate Rules** | United States | 2026 – 2027 | SEC enforcement |
| **TCFD + SECR** | United Kingdom | Active | FCA enforcement |
| **ASRS** | Australia | 2025 – 2027 | ASIC enforcement |

Consulting firms (Deloitte, EY, KPMG) currently capture this market at **€100–500K per one-time audit**. We replace that with continuous, automated monitoring at **€500–2,500/month**.

---

## Competitive Position

|  | Consulting<br/>(Deloitte, EY, KPMG) | ESG SaaS<br/>(Sphera, Workiva) | **Scope3Scout** |
|---|:---:|:---:|:---:|
| Cost per audit | €100K–500K | €30–80K / yr license | **€500–2,500 / month** |
| Time to first result | 3–6 months | 2–4 weeks setup | **15 minutes** |
| Continuous monitoring | No (one-time) | Self-reported only | **Yes, real-time** |
| Independent verification | Human analyst | None | **Autonomous agents** |
| Contradiction detection | Manual only | Not supported | **Automatic** |

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 19, TypeScript, Vite | Application framework |
| Styling | Tailwind CSS 3, Framer Motion | Dark glassmorphic UI with animations |
| Auth | Supabase Auth | Email/password authentication |
| Database | Supabase (PostgreSQL) | Supplier data, violations, scan results |
| AI Scraping | **TinyFish Web Agent API** | Real-time browser automation via SSE |
| LLM Inference | Fireworks AI (Llama 70B), Google Gemini, OpenAI | Tier 2 claim cross-referencing |
| PDF Reports | jsPDF + AutoTable | CSRD-compliant report generation |
| CSV Import | PapaParse | Bulk supplier upload |
| 3D Visual | Spline | Landing page visualization |
| Data Layer | TanStack React Query | Server state management |
| Hosting | Vercel | Production deployment (104 deployments shipped) |

---

## Application Surface

| Page | Route | Description |
|---|---|---|
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
Watch 16 agents work in real-time. Each card shows a LIVE/DEMO badge, terminal-style action logs, progress bar, and final findings. Hero agents are prominently displayed; secondary agents collapse under *+ more agents* to reduce cognitive load.

**Mission Control Bar**
Top-level status: current supplier being audited, LIVE/DEMO mode indicator, animated progress bar, elapsed time, and contradiction count. Animated gradient border during active scanning.

**Contradiction Panel**
The centerpiece. An animated panel slides in when a mismatch is detected, showing claim versus evidence side-by-side with confidence bar, financial exposure in EUR, time-to-impact in days, and source link. Auto-scrolls into view.

**Timeline Feed**
A real-time scrolling event log showing every agent action with timestamp, agent name, and color-coded message type (step, action, success, warning, contradiction).

**Action Panel**
Post-scan actions: auto-contact supplier, generate CSRD report (real PDF), download evidence (JSON), re-run scan. Includes audit summary with risk score, risk tier, contradiction count, violation count, and CSRD compliance status.

**API Key Management**
API keys (TinyFish, Gemini, OpenAI, Fireworks) are stored in `localStorage` via the Settings page. No environment variables required for demo. Priority: `localStorage` → env var → empty (falls back to demo mode).

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

# TinyFish (optional  -  can be entered via Settings page)
VITE_TINYFISH_API_KEY=

# LLM (optional  -  for Tier 2 analysis)
VITE_FIREWORKS_API_KEY=
VITE_GEMINI_API_KEY=
VITE_OPENAI_API_KEY=
```

All API keys can also be entered through the Settings page at runtime. The app works in demo mode without any keys configured.

---

## Roadmap

**Phase 2 Sprint Goals (by April 20, 2026)**

- Multi-supplier batch scanning from CSV upload (target: 50+ suppliers in one run)
- Real contradiction detection via Fireworks AI Llama 70B (replacing mocked contradictions)
- Working CSRD-compliant PDF report generator with evidence chain and risk scoring
- Requested increased TinyFish concurrency (from 2 to 8+ parallel agents)

**Post-Demo-Day (seed stage)**

- Paid pilots with 3–5 EU mid-market companies at €2–5K/month
- Expand regulatory coverage: SEC Climate Rules (US), TCFD + SECR (UK), ASRS (Australia)
- Scale TinyFish agent concurrency to 20+ parallel audits
- Hire compliance domain expert with CSRD audit experience
- SOC 2 readiness and enterprise Supabase tier
- Target: **€200K ARR by month 6, €1.2M ARR by month 12**

---

## Team

**Mohammad Zeeshan**  -  Founder, CEO
AI Research Developer at HUN-REN SZTAKI (Hungary's national research network), independently leading four EU Horizon Europe projects. Builder of Parity AI, a production-grade EU AI Act compliance framework. Incoming AI Governance Technical SME at Sony (April 2026). Starting PhD in AI Systems Security at Óbuda University (September 2026). Stanford Ethics, Technology and Public Policy scholarship recipient (2026).
GitHub: [@m-zest](https://github.com/m-zest)

**Afzal**  -  Co-founder, Operations & Go-to-Market
Leads applications, partnerships, and customer research across compliance verticals. Co-architect of product strategy and regulatory positioning. Drives enterprise outreach and cross-European pilot coordination.

---

## Links

- **Live Product:** [scope3-scout.vercel.app](https://scope3-scout.vercel.app/)
- **Pitch Deck:** [m-zest.github.io/scope3scout_pitch](https://m-zest.github.io/scope3scout_pitch/)
- **TinyFish Accelerator:** [tinyfish.ai](https://www.tinyfish.ai/)
- **Contact:** hdglit@inf.elte.hu

---

## Legal

```
Copyright © 2026 Mohammad Zeeshan. All Rights Reserved.

Source available for evaluation purposes only.
Commercial use requires written permission.
TinyFish API used with permission for hackathon and commercial development.
```

---

<p align="center">
  <em>Built for the <a href="https://www.tinyfish.ai/">TinyFish $2M Pre-Accelerator</a> · March–April 2026</em>
</p>

<p align="center">
  <strong>Scope3Scout  -  The compliance layer of the browser-agent era.</strong>
</p>
