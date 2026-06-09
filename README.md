# CARBON·LEDGER // ESG Terminal v3.2

<div align="center">
  <p><strong>Personal ESG Intelligence & Deterministic Carbon Ledger</strong></p>
  <p>
    <a href="#overview">Overview</a> •
    <a href="#theoretical-foundation">Theory</a> •
    <a href="#architecture--mathematical-models">Architecture</a> •
    <a href="#features--ui">Features</a> •
    <a href="#installation">Installation</a>
  </p>
</div>

## Overview

CARBON·LEDGER is an elite-tier, interactive front-end dashboard designed to calculate, simulate, and abate personal or corporate carbon footprints. Built on a purely deterministic mathematical engine, every figure is derived from a single activity profile through emission-factor cascades, composite scoring, z-score anomaly detection, and compounding scenario projections. 

This is not a static mock-up; it is a fully reactive mathematical engine wrapped in a high-fidelity cyber-terminal aesthetic.

---

## 📚 Theoretical Foundation

Carbon accounting and Environmental, Social, and Governance (ESG) tracking require rigorous standardization to be mathematically sound. This software is built upon the following core climate-science frameworks:

### 1. The GHG Protocol (Scope Classification)
To prevent double-counting, greenhouse gas emissions are strictly categorized into three Scopes, which this software dynamically calculates:
*   **Scope 1 (Direct Emissions):** Emissions from owned or controlled sources. In this software, this is calculated via Petrol/Combustion vehicle usage (`petrolLitre` × `2.31 kgCO₂/L`) and Natural Gas heating (`naturalGasKwh` × `0.20 kgCO₂/kWh`).
*   **Scope 2 (Indirect Energy Emissions):** Emissions from the generation of purchased electricity. Calculated using regional grid intensity averages (`electricityKwh` × `0.38 kgCO₂/kWh`). This scope can be mathematically zeroed out in the simulator using the "100% Renewable Tariff" lever.
*   **Scope 3 (Value Chain / Embedded Emissions):** All other indirect emissions occurring in the value chain. This is mathematically the hardest to track but usually the largest component. The software derives this from Flight Distances (Short/Long haul multipliers), Dietary choices (Red Meat vs. Plant-based protein cascades), and General Goods Spending.

### 2. The 1.5°C Paris Agreement Budget
Climate science dictates a maximum remaining global carbon budget to limit warming to 1.5°C above pre-industrial levels. 
*   **Personal Allowance:** The software divides the remaining global budget per capita, resulting in a sustainable allowance of roughly **2,300 kgCO₂e per year** per person.
*   **Overshoot Ratio:** The dashboard calculates your total footprint against this 2,300kg baseline. An overshoot ratio of `4.5x` means you are consuming 4.5 times your sustainable planetary share.
*   **Earths Required:** Derived by scaling the overshoot ratio globally—if everyone lived this specific profile, how many Earths would be required to sustain it?

### 3. ESG Composite Scoring
The software calculates a composite letter grade (A+ through F) based on a weighted matrix:
*   **Environmental (55%):** Purely quantitative, based on the inverse of the carbon footprint variance against the baseline.
*   **Social (20%):** Derived from supplier transparency inputs and waste diversion behaviors.
*   **Governance (25%):** Derived from data completeness and carbon offset coverage percentages.

---

## 🧮 Architecture & Mathematical Models

The application relies on a **Deterministic React State Engine** (`lib/dashboard-data.ts`) with deep structural logic.

### Emission Factor Cascades
Every user input (e.g., `flightLongHaulKm`) is instantly multiplied by a predefined environmental factor (e.g., `0.15 kg/km`). Because the entire UI subscribes to this React Context, dragging a slider forces a synchronous recalculation of the entire dashboard in real-time. The math engine is heavily defended against zero-division errors, safely processing total parameter wipes gracefully.

### Z-Score Anomaly Detection
The **Eco·Assistant Anomaly Engine** does not just flag high numbers. It uses a trailing 3-month variance check (Z-scoring) against a moving baseline. If a specific activity (like Grid Electricity) spikes more than 2 standard deviations above the expected curve, the engine generates a `CRITICAL` alert and maps a specific abatement policy recommendation to resolve it.

### Marginal Abatement Projections
The **Pathway Simulator** uses a compounding year-over-year reduction matrix. When you engage a policy lever (e.g., "Electric Vehicle Fleet"):
1.  The base `petrolLitre` multiplier is slashed by 85%.
2.  The `electricityKwh` multiplier is increased to account for EV charging.
3.  The model projects this new configuration out 10 years, factoring in grid-decarbonization curves, to show total cumulative lifetime metric tons saved alongside Capital Expenditure (CapEx) tracking.

---

## ⚡ Features & UI

This application pushes the extreme limits of front-end engineering with obsessive micro-interactions:

- **AI Executive Briefing:** A floating assistant terminal that evaluates your exact, live data payload to generate deterministic English-language briefings via a typewriter effect with haptic feedback.
- **Executive PDF Exporting:** Utilizes `@react-pdf/renderer` to silently compile your live dashboard data and dynamic charts into a beautifully formatted, downloadable PDF compliance report.
- **Cinematic Bio-Feedback Glassmorphism:** Deep frosted panels (`backdrop-blur-2xl`) that physically react to your inputs. If you exceed the carbon budget, the entire application interface flushes a pulsating Critical Red.
- **Universal Math-Offset Navigation:** Instead of basic sticky scrolling, the app uses a proprietary background engine to cache exact absolute document coordinates. The laser-glowing sidebar, global search bar, and mobile sheet all navigate perfectly at 60 FPS without layout thrashing.
- **Physics-Based Interactions:** Heavy mechanical levers (`active:scale-[0.98]`), spring-loaded tactile sidebars, and 3D hover levitation on metric cards with sweeping light reflections.
- **Haptic Audio Engineering:** Features bespoke UI tick sounds and an optional ambient "Drone" mode to keep you focused.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router) + React 18
- **Styling:** Tailwind CSS + Custom CSS Keyframe Animations
- **Accessibility Engine:** Base UI (`@base-ui-components`) + Shadcn
- **Data Visualization:** Recharts
- **Exporting:** `@react-pdf/renderer`
- **Font:** Inter (Sans) + JetBrains Mono (Terminal)

---

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FrozenLionMax/Carbon-Footprint-Awareness-Software.git
   cd Carbon-Footprint-Awareness-Software
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Ignite the development server:**
   ```bash
   npm run dev
   ```

4. **Access the terminal:**
   Navigate to `http://localhost:3000` to view the live dashboard.

---
<div align="center">
  <sub>Engine: deterministic · GHG Protocol aligned · ESG Terminal v3.2</sub>
</div>
