# CARBON·LEDGER — Personal Carbon Footprint Awareness Software

<div align="center">
  <p><strong>A Deterministic ESG Intelligence Terminal for Individual Carbon Accountability</strong></p>
  <p>
    <a href="#chosen-vertical">Vertical</a> •
    <a href="#approach-and-logic">Approach</a> •
    <a href="#how-the-solution-works">How It Works</a> •
    <a href="#assumptions">Assumptions</a> •
    <a href="#tech-stack">Stack</a> •
    <a href="#installation">Installation</a> •
    <a href="#testing">Testing</a>
  </p>
</div>

---

## Chosen Vertical

**Carbon Footprint Awareness Software** — A personal sustainability dashboard that empowers individuals to measure, understand, and actively reduce their carbon footprint through real-time data visualization, anomaly detection, and actionable scenario modeling.

---

## Approach and Logic

### Core Philosophy
Unlike static carbon calculators, CARBON·LEDGER is built as a **fully deterministic mathematical engine** where every single number displayed on the dashboard is derived — not hardcoded. A single activity profile (9 emission inputs + 5 governance metrics) cascades through emission-factor multiplication, scope classification, composite scoring, statistical anomaly detection, and compounding 10-year projections in real-time.

### Mathematical Models Used

| Model | Purpose | Implementation |
|---|---|---|
| **GHG Protocol Scope Classification** | Categorizes emissions into Scope 1 (direct), 2 (energy), 3 (value chain) | `ACTIVITY_SCOPE` mapping in `dashboard-data.ts` |
| **IPCC Emission Factors** | Converts activities (kWh, km, kg) into kgCO₂e | `EMISSION_FACTORS` constant with 9 scientifically sourced multipliers |
| **Paris Agreement 1.5°C Budget** | Per-capita annual carbon allowance (2,300 kg) with linear glide path to net-zero by 2050 | `budgetForYear()` function |
| **Weighted ESG Composite** | Environmental (55%) + Social (20%) + Governance (25%) scoring to 0–100 scale | `computeScores()` with `clamp()` normalization |
| **Z-Score Anomaly Detection** | Detects statistical spikes in monthly emissions using trailing 3-month moving average | `detectAnomalies()` with σ ≥ 1.6 threshold |
| **Marginal Abatement Cost Curve** | Ranks interventions by cost-per-tonne saved ($/tCO₂e) | `getInitiatives()` sorted by `costPerT` |
| **Compounding Scenario Projection** | 10-year cumulative comparison of baseline vs. policy-adjusted trajectory | `projectTenYears()` with CapEx/savings tracking |

### Key Design Decisions
1. **No backend required** — All computation happens client-side in a React Context, making the app instantly deployable with zero infrastructure costs.
2. **Deterministic outputs** — Given the same inputs, the engine always produces the exact same outputs. No randomness in core calculations.
3. **Zero-division protection** — Every mathematical operation is guarded by `safeNumber()` to prevent NaN propagation throughout the UI.
4. **Indian Grid Telemetry** — Live carbon intensity simulation based on the Central Electricity Authority (CEA) baseline of 0.716 kgCO₂/kWh with time-of-day solar/coal curve modeling.

---

## How the Solution Works

### User Flow
1. **Input Activity Data** → Users adjust 9 emission sliders (electricity, flights, diet, etc.) and 5 governance metrics via the Terminal Parameters panel
2. **Instant Visualization** → All 6 dashboard modules recalculate synchronously via React Context subscription
3. **Anomaly Alerts** → The Z-Score engine flags statistical anomalies and recommends specific policy interventions
4. **Scenario Modeling** → Users toggle 4 abatement levers to simulate the impact over a 10-year projection
5. **Export & Report** → Generate a professional PDF compliance report with all live data

### Dashboard Modules

| Module | Component | Function |
|---|---|---|
| **001 · Terminal Parameters** | `DataEntryPanel` | Input sliders for all emission activities and ESG governance metrics |
| **002 · Stat Cards** | `StatCards` | Real-time KPI summary: annual footprint, ESG grade, budget overshoot, earths required |
| **003 · Emission Timeseries** | `EmissionsTrendChart` | 12-month stacked area chart with seasonal modeling |
| **003 · Scope Ledger** | `CategoryBreakdownChart` | GHG Protocol pie chart with expandable per-activity breakdown and MoM variance |
| **004 · Anomaly Engine** | `ConsultantFeed` | Z-Score anomaly detection with actionable "Apply Policy" buttons |
| **005 · Pathway Simulator** | `ScenarioSimulator` | 10-year projection chart with 4 toggle-able abatement levers and CapEx tracking |
| **006 · MAC Strategy** | `Recommendations` | Marginal Abatement Cost curve ranking interventions by $/tCO₂e |
| **ESG Composite** | `ReductionTargets` | Weighted ESG pillar decomposition with letter grading (AAA–CCC) |

### Accessibility
- **Skip-to-content link** for keyboard navigation
- **Semantic HTML5 landmarks** (`<main>`, `<section>`, `<nav>`, `<footer>`) with `aria-label` attributes
- **Screen reader support** via `sr-only` classes and descriptive labels
- **Focus-visible outlines** for all interactive elements
- **Reduced motion support** via CSS `prefers-reduced-motion`

### Security
- **HTTP Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **Input sanitization**: All numeric inputs are clamped to valid ranges on blur
- **No external data persistence**: All data stays in the user's browser localStorage
- **No authentication tokens or API keys** exposed in client code

---

## Assumptions

1. **Individual scope**: The carbon budget of 2,300 kgCO₂e/yr is a per-capita allowance derived from the remaining global carbon budget divided by world population.
2. **Linear budget depletion**: The Paris Agreement glide path assumes a linear reduction from 2,300 kg in 2025 to 0 kg in 2050.
3. **Static emission factors**: Factors (e.g., 0.233 kg/kWh for electricity) represent global averages; real-world values vary by region and grid mix.
4. **Indian Grid**: The CEA proxy uses the official average of 0.716 kgCO₂/kWh with deterministic time-of-day modulation (solar depression at noon, coal spike at evening peak).
5. **Dietary factors**: Red meat at 27.0 kgCO₂e/kg and dairy at 13.5 kgCO₂e/kg are based on published lifecycle assessment literature.
6. **Fiscal year scaling**: Historical FY data (2023, 2024) is derived from the current profile with scaling multipliers rather than separate datasets.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) + React 18 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 + Custom CSS Animations |
| **Components** | Shadcn UI + Lucide Icons |
| **Data Visualization** | Recharts |
| **PDF Export** | `@react-pdf/renderer` |
| **Animation** | Framer Motion |
| **Audio** | Web Audio API (procedural synthesis) |
| **Testing** | Vitest |
| **Typography** | Space Grotesk (Sans) + IBM Plex Mono (Terminal) |

---

## Installation

```bash
# Clone the repository
git clone https://github.com/FrozenLionMax/Carbon-Footprint-Awareness-Software.git
cd Carbon-Footprint-Awareness-Software

# Install dependencies
npm install

# Start the development server
npm run dev

# Open in browser
# Navigate to http://localhost:3000
```

---

## Testing

The project includes a comprehensive test suite using Vitest covering 50+ test cases across 12 categories:

```bash
# Run the full test suite
npx vitest run

# Run in watch mode during development
npx vitest
```

### Test Coverage Areas
- Utility functions (safeNumber, round, avg, stdev, clamp, pct)
- GHG Protocol scope classification
- Emission factor cascade calculations
- Paris Agreement carbon budget logic
- Historical fiscal year scaling
- ESG composite scoring and grading
- Monthly trend generation
- Z-Score anomaly detection
- Scenario lever application
- 10-year cumulative projection
- Marginal abatement cost ranking
- Edge cases and zero-division safety

---

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with fonts, metadata, providers
│   ├── page.tsx            # Main dashboard page with semantic landmarks
│   └── globals.css         # Design system tokens and animations
├── components/
│   ├── data-entry-panel.tsx     # Module 001: Input sliders
│   ├── stat-cards.tsx           # Module 002: KPI summary cards
│   ├── emissions-trend-chart.tsx # Module 003: Timeseries chart
│   ├── category-breakdown-chart.tsx # Module 003: Scope ledger
│   ├── consultant-feed.tsx      # Module 004: Anomaly engine
│   ├── scenario-simulator.tsx   # Module 005: Pathway simulator
│   ├── recommendations.tsx      # Module 006: MAC strategy
│   ├── reduction-targets.tsx    # ESG composite scoring
│   ├── dashboard-header.tsx     # Header with search, clock, ESG grade
│   ├── dashboard-sidebar.tsx    # Navigation with scroll-spy
│   ├── ai-briefing-panel.tsx    # AI executive briefing terminal
│   ├── pdf-report-document.tsx  # PDF report template
│   └── ui/                      # Reusable UI primitives
├── lib/
│   ├── dashboard-data.ts        # Core deterministic math engine
│   ├── context.tsx              # React Context provider + localStorage
│   ├── audio.ts                 # Web Audio API haptic engine
│   └── __tests__/               # Vitest test suites
├── next.config.mjs              # Security headers + Next.js config
└── README.md
```

---

<div align="center">
  <sub>Engine: deterministic · GHG Protocol aligned · Zero hardcoded values · 50+ automated tests</sub>
</div>
