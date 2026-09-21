# 📘 PackSmart AI — Complete User Manual & Operating Guide

> **Smarter Packaging · A Healthier Tomorrow**  
> *A comprehensive, step-by-step operating manual covering platform navigation, end-to-end workflows, role-based governance, and technical diagnostic capabilities.*

---

## 📋 Table of Contents

1. [Introduction & Platform Overview](#1-introduction--platform-overview)
2. [User Roles & Security Governance (RBAC)](#2-user-roles--security-governance-rbac)
   - [Role Hierarchy](#role-hierarchy)
   - [Permissions & Capability Matrix](#permissions--capability-matrix)
   - [Pre-Configured Demo Accounts](#pre-configured-demo-accounts)
   - [How to Switch Roles](#how-to-switch-roles)
3. [Global Interface & Navigation Layout](#3-global-interface--navigation-layout)
   - [Header Navigation Bar](#header-navigation-bar)
   - [System Health & Connection Monitor](#system-health--connection-monitor)
   - [Currency Switcher (INR ₹ / USD $)](#currency-switcher-inr---usd-)
4. [Step-by-Step Operating Workflows](#4-step-by-step-operating-workflows)
   - [Workflow 1: 5-Step Packaging Recommendation Wizard](#workflow-1-5-step-packaging-recommendation-wizard)
     - [Step 01: Food Profile & Biochemical Calibration](#step-01-food-profile--biochemical-calibration)
     - [Step 02: Environmental & Storage Thermodynamics](#step-02-environmental--storage-thermodynamics)
     - [Step 03: Packaging Substrate Selection](#step-03-packaging-substrate-selection)
     - [Step 04: AI Multi-Stage Optimization Pipeline](#step-04-ai-multi-stage-optimization-pipeline)
     - [Step 05: Decision Intelligence & Results](#step-05-decision-intelligence--results)
   - [Workflow 2: What-If Packaging Simulator](#workflow-2-what-if-packaging-simulator)
     - [Tab 1: Shelf-Life Kinetics](#tab-1-shelf-life-kinetics)
     - [Tab 2: Produce Respiration & EMAP](#tab-2-produce-respiration--emap)
     - [Tab 3: MAP Gas Formulation](#tab-3-map-gas-formulation)
     - [Tab 4: Scenario Sensitivity Sweep](#tab-4-scenario-sensitivity-sweep)
   - [Workflow 3: Materials Library & Benchmarking Matrix](#workflow-3-materials-library--benchmarking-matrix)
   - [Workflow 4: Recommendation History & Re-Run](#workflow-4-recommendation-history--re-run)
   - [Workflow 5: Exporting Technical PDF Reports](#workflow-5-exporting-technical-pdf-reports)
   - [Workflow 6: System Management (Manager Portal)](#workflow-6-system-management-manager-portal)
   - [Workflow 7: Super Admin Governance & Audit Logging (Admin Portal)](#workflow-7-super-admin-governance--audit-logging-admin-portal)
5. [Understanding Results & Decision Intelligence](#5-understanding-results--decision-intelligence)
   - [Multi-Objective Pareto Optimization (Options A, B, C, D)](#multi-objective-pareto-optimization-options-a-b-c-d)
   - [The "Why this material?" Framework](#the-why-this-material-framework)
   - [ASTM Barrier Compliance Matrix](#astm-barrier-compliance-matrix)
6. [Resilience, Validations & Error Recovery](#6-resilience-validations--error-recovery)
   - [Mass Conservation Validation](#mass-conservation-validation)
   - [Server Offline & Thermodynamic Fallback Mode](#server-offline--thermodynamic-fallback-mode)
   - [API Request Timeouts](#api-request-timeouts)
   - [Session Expiry & Re-Authentication](#session-expiry--re-authentication)
   - [Application Recovery Shield (Error Boundary)](#application-recovery-shield-error-boundary)
7. [Frequently Asked Questions (FAQ)](#7-frequently-asked-questions-faq)

---

## 1. Introduction & Platform Overview

**PackSmart AI** is an enterprise AI software platform designed for packaging engineers, food technologists, supply chain directors, and sustainability managers. 

Traditional packaging specification often involves trial-and-error, generic supplier catalogs, or subjective terms ("High Barrier"), leading to **premature food spoilage write-offs** or **costly, non-recyclable over-packaging**.

PackSmart AI replaces guesswork with exact physical mathematics:
* **ASTM D3985** Oxygen Transmission Rate ($\text{OTR}_{\max}$) modeling based on lipid auto-oxidation thresholds.
* **ASTM F1249** Water Vapor Transmission Rate ($\text{WVTR}_{\max}$) modeling using Guggenheim-Anderson-de Boer (GAB) moisture sorption isotherms.
* **Coupled Arrhenius $Q_{10}$ Kinetics** simulating microbial growth, lipid rancidity, and texture staling.
* **Equilibrium Modified Atmosphere Packaging (EMAP)** balancing produce respiration and micro-perforations.
* **Total Cost Analysis** combining raw packaging material, conversion, freight, and expected food spoilage risk.
* **LCA Circularity & Carbon Offsetting** quantifying packaging-to-product ratio (PPR) and upstream avoided food waste emissions.

---

## 2. User Roles & Security Governance (RBAC)

PackSmart AI implements a strict 3-tier Role-Based Access Control (RBAC) architecture. All permissions are verified on the backend with JSON Web Tokens (JWT).

### Role Hierarchy

```
                            👑 SUPER ADMIN
                         Full Root Access (17)
                                  │
                                  ▼
                          🛠️ SYSTEM MANAGER
                        Management Access (12)
                                  │
                                  ▼
                               👤 USER
                          Standard Access (6)
```

### Permissions & Capability Matrix

| Feature / Domain | 👤 Standard User | 🛠️ System Manager | 👑 Super Admin |
| :--- | :---: | :---: | :---: |
| **Run Packaging Recommendation Wizard** | ✅ | ✅ | ✅ |
| **Run What-If Scenario Simulator** | ✅ | ✅ | ✅ |
| **View Materials Benchmark Catalog** | ✅ | ✅ | ✅ |
| **Save & View Personal History** | ✅ | ✅ | ✅ |
| **Export & Print PDF Engineering Reports** | ✅ | ✅ | ✅ |
| **Switch Display Currencies (INR ₹ / USD $)** | ✅ | ✅ | ✅ |
| **View Team / Organization Recommendations** | ❌ | ✅ | ✅ |
| **Manage & Add Food Commodity Presets** | ❌ | ✅ | ✅ |
| **Manage & Edit Packaging Material Specs** | ❌ | ✅ | ✅ |
| **Access Management Portal** | ❌ | ✅ | ✅ |
| **View All Registered Platform Users** | ❌ | ❌ | ✅ |
| **Promote / Demote User Roles** | ❌ | ❌ | ✅ |
| **Activate / Deactivate Accounts** | ❌ | ❌ | ✅ |
| **Inspect Real-Time Security Audit Logs** | ❌ | ❌ | ✅ |
| **Configure System-Wide Security Settings** | ❌ | ❌ | ✅ |

### Pre-Configured Demo Accounts

For evaluation, three pre-configured enterprise personas are available:

| Persona Name | Assigned Role | Email Address | Password | Intended Evaluation Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Sarah Chen** | 👑 Super Admin | `admin@packsmart.ai` | `admin` | User governance, role assignment, security audit review |
| **Marcus Vance** | 🛠️ System Manager | `manager@packsmart.ai` | `manager` | Catalog updates, team oversight, application management |
| **Alex Rivera** | 👤 Standard User | `user@packsmart.ai` | `user` | Daily packaging analysis, simulator, PDF export |

### How to Switch Roles

You can test different role perspectives at any time using two methods:

#### Method A: Quick-Switch Dropdown (Fastest)
1. Locate the persona card in the **top-right navigation header**.
2. Click the user badge (e.g., `Sarah Chen [👑 Admin]`).
3. Select any target role from the dropdown (`Super Admin`, `System Manager`, or `Standard User`).
4. The application immediately switches tokens, updates the navigation bar, and adjusts portal access.

#### Method B: Standard Login Page
1. Click **Sign In / Log In** in the navigation header (or navigate to `/login`).
2. Click one of the **1-Click Demo Buttons** (e.g., *"Sign In as Super Admin"*), or type credentials manually.
3. Click **Authenticate & Launch Portal**.

---

## 3. Global Interface & Navigation Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🌿 PackSmart AI   [Advisor] [Simulator] [Materials] [History] [Management*] [Admin*] │ User │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
│ [STATUS BANNER: Backend Online ✓ | ASTM Engine Active | Health 100%]                        │
```
*\*Management and Admin navigation tabs appear only when logged in with appropriate privileges.*

### Header Navigation Bar
* **🌿 Logo / Home**: Returns to the executive landing page.
* **Dashboard**: High-level telemetry, quick-start food pills, recent analyses, and system stats.
* **Packaging Advisor**: The primary 5-step guided recommendation workflow.
* **What-If Simulator**: Interactive sandbox for stress-testing temperature, humidity, and logistics.
* **Compare Materials**: Multi-polymer ASTM property comparison table with radar plots.
* **History**: Personal analysis log with re-run actions and CSV exports.
* **Management**: Operational catalog management (System Manager and Super Admin only).
* **Admin**: Security governance, user access, and audit trails (Super Admin only).

### System Health & Connection Monitor
PackSmart AI continuously monitors server connectivity via background health checks (`GET /api/health`).
* **Healthy State**: Subtle green badge in the footer indicating active ML model and Supabase connectivity.
* **Offline / Disconnected**: Sticky notification banner offering a **Retry Connection** button and expandable technical diagnostics. *(The platform automatically activates its in-browser thermodynamic ASTM fallback so your workflow is never interrupted).*

### Currency Switcher (INR ₹ / USD $)
Located on the Results and Simulator pages:
* Toggle between **₹ Indian Rupees (INR)** and **$ US Dollars (USD)**.
* Converts resin costs, conversion costs, and expected food loss figures using live conversion rates ($1\text{ USD} = 83.2\text{ INR}$).

---

## 4. Step-by-Step Operating Workflows

---

### Workflow 1: 5-Step Packaging Recommendation Wizard

The Recommendation Wizard takes you from a raw food commodity to an optimized packaging specification.

```
[01 Food Profile] ──► [02 Conditions] ──► [03 Packaging] ──► [04 AI Pipeline] ──► [05 Results]
```

#### Step 01: Food Profile & Biochemical Calibration

1. **Select a Commodity**:
   * Use the **Search Bar** to type commodity keywords (e.g., *"Potato Chips"*, *"Biscuits"*, *"Tomato"*, *"Paneer"*).
   * Or filter by categories: `All`, `Snacks`, `Bakery`, `Fresh produce`, `Dairy`, `Grains`.
   * Or click one of the **Popular Options Pills** (Chips, Biscuits, Tomato, Cheese, Coffee, etc.).
2. **Review Default Biochemical Specs**:
   * The food card displays standard moisture %, lipid %, pH, and target shelf life.
3. **Customize Biochemical Specs (Optional)**:
   * Click **"Customize Biochemical Specs"** to expand the chemical parameter panel.
   * Adjust **Moisture Content (%)**: $0.1\%$ to $99.0\%$.
   * Adjust **Fat / Lipid Content (%)**: $0.0\%$ to $100.0\%$.
   * Adjust **pH Acidity Level**: $1.0$ (acidic) to $14.0$ (alkaline).
   * Adjust **Respiration Rate**: `None` (dry goods), `Low`, `Medium`, or `High` (fresh produce).
4. Click **Proceed to Environmental Conditions →**.

---

#### Step 02: Environmental & Storage Thermodynamics

1. **Storage Temperature Slider**:
   * Drag the slider between $0^\circ\text{C}$ and $45^\circ\text{C}$ (e.g., $0^\circ\text{C}$ cold chain, $25^\circ\text{C}$ ambient, $45^\circ\text{C}$ hot desert).
2. **Relative Humidity Slider**:
   * Drag the slider between $20\%$ and $95\%$ RH (e.g., $20\%$ arid, $60\%$ standard ASTM, $95\%$ tropical/monsoon).
3. **Target Shelf-Life Horizon**:
   * Use the **[-]** and **[+]** buttons to increment or decrement days (e.g., $90$, $120$, $180$, $365$ days).
4. **Package Net Weight & Storage Type**:
   * Enter net fill weight in grams (e.g., $150\text{g}$, $250\text{g}$, $1000\text{g}$).
   * Select storage mode: `Ambient`, `Chilled (Refrigerated)`, or `Frozen (-18°C)`.
5. **Transportation Condition**:
   * Select your expected transit stress:
     * `Standard Transit`: Local distribution.
     * `Long Distance Freight`: Extended interstate logistics with heavy vibration.
     * `Refrigerated Cold Chain`: $2\text{--}8^\circ\text{C}$ temperature-controlled logistics.
     * `Tropical / High Humidity`: Monsoon and coastal moisture exposure.
6. **Budget Constraint**:
   * Select your economic target: `Economy Priority (Low)`, `Standard Commercial (Medium)`, or `Premium Preservation (High)`.
7. **Inspect the Live Arrhenius $Q_{10}$ Kinetic Curve**:
   * The right-hand column dynamically renders a decay curve showing how thermal abuse accelerates quality deterioration.
8. Click **Proceed to Packaging Materials →**.

---

#### Step 03: Packaging Substrate Selection

1. Review the catalog of candidate materials (PET/PE, BOPP/Met-PET, Aluminium Foil Tri-Laminate, Recyclable Mono-PE, EVOH Coextrusion, Laser-Perforated Breathable Film, Barrier Paper).
2. Select your baseline candidate.
3. Click **Run AI Analysis & Optimize →**:
   * *Notice the immediate loading feedback: The button transitions to `<RefreshCw className="spin" /> Analyzing...` and disables to confirm your click has registered.*

---

#### Step 04: AI Multi-Stage Optimization Pipeline

The platform launches a dedicated 6-stage sequential loading pipeline:

```
┌──────────────────────────────────────────────────────────┐
│                   AI NEURAL ORBITAL                      │
│                  (O₂ · CO₂ · H₂O · N₂)                   │
│                                                          │
│   STAGE 4 OF 6: Barrier requirements                     │
│   [████████████████████░░░░░░░░░] 67% COMPLETE           │
│                                                          │
│   ✓ [01] Analyzing... [ENGINE INIT]                      │
│   ✓ [02] Food properties [BIOCHEMISTRY]                  │
│   ✓ [03] Packaging materials [SUBSTRATES]                │
│   ⟳ [04] Barrier requirements [ASTM PHYSICS]             │
│   ○ [05] ML prediction [RANDOM FOREST]                   │
│   ○ [06] Recommendation [PARETO OPTIMA]                  │
│                                                          │
│   > [00:18] [BARRIER] Derived permissible OTR & WVTR     │
└──────────────────────────────────────────────────────────┘
```

1. **Analyzing...**: Calibrates ambient thermodynamics and baseline storage conditions.
2. **Food properties**: Maps moisture sorption isotherms and lipid sensitivity.
3. **Packaging materials**: Screens polymer structures across gauge thicknesses.
4. **Barrier requirements**: Calculates critical ASTM D3985 OTR and ASTM F1249 WVTR limits.
5. **ML prediction**: Executes the Random Forest regressor and Arrhenius kinetics.
6. **Recommendation**: Solves the multi-objective Pareto trade-off frontier.
7. Upon completion, the screen displays *"Optimization Complete ✓"* and transitions smoothly to Results.

---

#### Step 05: Decision Intelligence & Results

The Results view provides an engineering-grade packaging specification:

```
┌────────────────────────────────────────────────────────────────────────┐
│  PARETO CONFIGURATIONS:                                                │
│  [Option A: Max Life]  [Option B: Lowest Cost]  [Option D: Recommended] │
├────────────────────────────────────────────────────────────────────────┤
│  🏆 RANKED #1 RECOMMENDED PACKAGING:                                   │
│  Metallized Film (BOPP / Met-PET) — 38 µm                              │
│  ML Suitability: 94% · Cost: $0.051/pk · Circularity: Grade B          │
├────────────────────────────────────────────────────────────────────────┤
│  WHY THIS MATERIAL?                                                    │
│  Reasons:                                                              │
│  * High moisture protection (WVTR: 0.88 g/m²·d ≤ limit 1.14 g)         │
│  * Good oxygen barrier (OTR: 2.21 cc/m²·d ≤ limit 12.63 cc)            │
│  * Suitable for required shelf life (156d vs 120d target)              │
│  * Suitable for transportation conditions (Standard transit verified)  │
│  * Within selected budget ($0.051/pack matches Medium budget)          │
│  * Acceptable sustainability score (Grade B, 66/100 Index)             │
├────────────────────────────────────────────────────────────────────────┤
│  [OTR Card]   [WVTR Card]   [Shelf Life Card]   [Cost]   [LCA Carbon]  │
├────────────────────────────────────────────────────────────────────────┤
│  ASTM COMPLIANCE MATRIX: Barrier Test vs Requirement Limit             │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Select Pareto Alternatives**:
   * Click **Option A (Max Shelf Life)**, **Option B (Lowest Cost)**, or **Option C (High Sustainability)**.
   * Notice that the entire page, including the **"Why this material?"** reasons, updates dynamically to reflect the chosen trade-off.
2. **Review the "Why this material?" Section**:
   * Read the 6 clear reasons with quantitative verification evidence.
3. **Review ASTM Technical Verification Bars**:
   * Compare actual OTR and WVTR against allowable limits.
4. **Inspect Economics & Sustainability**:
   * Review raw material cost, conversion expense, and expected food loss risk.
   * Review packaging-to-product ratio (PPR %) and avoided food waste carbon offset.
5. **Actions**:
   * Click **Save / Print PDF Report** to export a technical report.
   * Click **Test in What-If Simulator** to stress-test your chosen configuration.
   * Click **New Analysis** to start a fresh calculation.

---

### Workflow 2: What-If Packaging Simulator

The Simulator allows you to stress-test your packaging configuration against environmental and logistics variations.

1. Navigate to **What-If Simulator** from the navigation bar.
2. Select from the 4 specialized tabs:

#### Tab 1: Shelf-Life Kinetics
* Drag the **Temperature** slider (e.g., increase from $20^\circ\text{C}$ to $35^\circ\text{C}$).
* Drag the **Relative Humidity** slider (e.g., increase from $50\%$ to $85\%$).
* Switch packaging materials in the dropdown (e.g., test a lighter mono-material).
* *Notice the dynamic badge:* Displays `<RefreshCw className="spin" /> Recalculating Arrhenius Kinetics...` while computing.
* Review the **Degradation Pathways Breakdown Chart**:
  * Visualizes whether Microbial Spoilage, Lipid Rancidity, or Moisture Staling is the rate-limiting factor.

#### Tab 2: Produce Respiration & EMAP
* Dedicated to fresh commodities (tomatoes, berries, greens).
* Toggle produce state between **Intact Whole Commodity** and **Fresh-Cut / Sliced (Wounded)**.
* The engine calculates $O_2$ consumption rate ($\text{cc/day}$) and derives the exact **laser micro-perforation density** (number of holes and hole diameter in $\mu\text{m}$) needed to prevent produce hypoxia.

#### Tab 3: MAP Gas Formulation
* Calculates the optimal gas flushing mixture:
  * Percentage of Oxygen ($\text{O}_2$), Carbon Dioxide ($\text{CO}_2$), and Nitrogen ($\text{N}_2$).
  * Recommended gas-to-product headspace volume ratio (typically $1.5\text{--}2.0\times$).
  * Analyzes **Package Collapse Risk** due to $\text{CO}_2$ dissolution into the moisture/lipid phase.

#### Tab 4: Scenario Sensitivity Sweep
* Executes a matrix sweep testing 4 temperature steps ($5^\circ\text{C}, 15^\circ\text{C}, 25^\circ\text{C}, 35^\circ\text{C}$) against multiple shelf-life horizons.
* Displays a color-coded feasibility matrix showing where packaging fails or succeeds.

---

### Workflow 3: Materials Library & Benchmarking Matrix

1. Navigate to **Compare Materials**.
2. Browse the 8 ASTM-certified packaging substrates in the catalog.
3. Review key metrics:
   * **ASTM D3985 OTR** ($\text{cc}/(\text{m}^2\cdot\text{day}\cdot\text{atm})$).
   * **ASTM F1249 WVTR** ($\text{g}/(\text{m}^2\cdot\text{day})$).
   * **Standard Gauge Thickness** ($\mu\text{m}$).
   * **Circularity Grade** (Grade A+ to Grade D) and end-of-life recycling stream.
   * **Base Cost** per $\text{m}^2$.
4. Check the **Interactive Radar Plot** to compare barrier, durability, cost, and circularity across multiple substrates simultaneously.

---

### Workflow 4: Recommendation History & Re-Run

1. Navigate to **History**.
2. Browse your past recommendations (each logged with commodity, date, material, and suitability score).
3. **Filter & Search**: Type keywords into the search box to find specific commodities or materials.
4. **Re-Run Analysis**: Click **"View & Re-Run"** on any record to load that exact analysis back into the 5-step wizard.
5. **Export**: Click **Export History (CSV)** to download a spreadsheet for audit or team reporting.

---

### Workflow 5: Exporting Technical PDF Reports

1. From the Results page (Step 5), click **Save / Print PDF Report**.
2. A modal displays the **Technical Assessment & Engineering Report**:
   * Header: Document ID, generation timestamp, ASTM validation status.
   * Section 1 & 2: Commodity profile and storage conditions.
   * Section 3: Recommended specification with the complete **"Why this material?"** justification.
   * Section 4: Physical ASTM Barrier Compliance Matrix with safety buffer percentages.
   * Section 5: Unit economics and life-cycle carbon indicator.
3. Click **Print / Export PDF**:
   * The browser's native print dialogue opens. Select **"Save as PDF"** or choose a physical printer.

---

### Workflow 6: System Management (Manager Portal)

*Access Requirement: Logged in as **System Manager** or **Super Admin**.*

1. Navigate to **Management** from the navigation bar.
2. **Catalog Oversight**:
   * View all active packaging material substrates and food commodity presets.
   * Inspect nominal OTR, WVTR, thickness limits, and circularity ratings.
3. **Operational Monitoring**:
   * Review recent team recommendations and check system health status.

---

### Workflow 7: Super Admin Governance & Audit Logging (Admin Portal)

*Access Requirement: Logged in as **Super Admin**.*

1. Navigate to **Admin** from the navigation bar.
2. **User Management**:
   * Browse the user directory (names, emails, active roles, and account statuses).
   * Promote or demote user roles using the **Role Dropdown**:
     * Change a `User` to `System Manager` or `Super Admin`.
     * Changes take effect immediately on the backend via `POST /api/admin/users/update`.
3. **Real-Time Security Audit Logs**:
   * Click **Audit Logs** to view timestamped security records:
     * Login attempts, role modifications, catalog updates, and recommendation executions.
     * Includes client IP addresses and user agents.

---

## 5. Understanding Results & Decision Intelligence

### Multi-Objective Pareto Optimization (Options A, B, C, D)

In real-world packaging, no single material is best at everything. PackSmart AI resolves this trade-off by presenting 4 distinct non-dominated Pareto choices:

* **Option A → Maximum Shelf Life**: Maximizes barrier protection. Ideal when brand reputation and product longevity override unit cost.
* **Option B → Lowest Total Cost**: Minimizes overall expenditure ($\text{Packaging Cost} + \text{Expected Spoilage Risk}$). Ideal for price-sensitive, high-volume commodities.
* **Option C → Higher Sustainability**: Prioritizes mono-material circularity and low carbon footprint. Ideal for ESG goals and sustainable product lines.
* **Option D → Balanced Solution (Recommended)**: Mathematical compromise factoring your protection, cost, and sustainability weightings.

### The "Why this material?" Framework

Every recommendation answers *"Why this material?"* across 6 criteria:

1. **High moisture protection**: Validates that actual film WVTR is below the critical threshold to prevent sogginess or moisture caking.
2. **Good oxygen barrier**: Validates that actual film OTR prevents lipid oxidation rancidity. *(For fresh produce: validates micro-perforations prevent suffocation).*
3. **Suitable for required shelf life**: Validates that the predicted Arrhenius shelf life exceeds your target duration with a positive buffer margin.
4. **Suitable for transportation conditions**: Verifies that the film's mechanical puncture resistance, seal integrity, and tensile toughness match your chosen transit mode.
5. **Within selected budget**: Verifies that unit packaging and food loss risk remain within your budget allocation.
6. **Acceptable sustainability score**: Reports the circularity rating, recyclability stream, and embodied carbon footprint.

### ASTM Barrier Compliance Matrix

| Parameter | ASTM Standard | Target Limit | Material Value | Safety Margin | Verdict |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Oxygen Transmission** | ASTM D3985 | $\le 11.22\text{ cc/m}^2\cdot\text{d}$ | $2.21\text{ cc}$ | $+80.3\%$ | **PASS** |
| **Water Vapor Transmission** | ASTM F1249 | $\le 0.92\text{ g/m}^2\cdot\text{d}$ | $0.88\text{ g}$ | $+4.3\%$ | **PASS** |

* **PASS**: Material transmission is safely within allowable limits.
* **MARGINAL**: Material transmission is close to the threshold (safety buffer $< 15\%$).
* **FAIL**: Material allows excessive gas or moisture ingress, resulting in premature spoilage.

---

## 6. Resilience, Validations & Error Recovery

### Mass Conservation Validation
If you enter physically impossible values (such as $\text{Moisture } 60\% + \text{Fat } 55\% = 115\% > 100\%$), the platform:
* Highlights the offending input fields with a **red outline**.
* Displays a clear alert message: *"Physically invalid: Moisture + Fat exceeds 100% total mass."*
* Blocks advancing to subsequent steps until parameters are physically plausible.

### Server Offline & Thermodynamic Fallback Mode
If the backend server is stopped or unreachable:
* A sticky banner appears: **"Unable to connect to PackSmart AI server"**.
* Click **Retry Connection** to re-probe the server.
* The application activates its **In-Browser Thermodynamic Fallback Engine**, running real ASTM Fickian equations locally so you are never left with a blank screen or broken UI.

### API Request Timeouts
All backend requests are protected by an **8-second timeout** (`AbortController`). If an endpoint stalls due to network latency, the request safely cancels and prompts you to retry.

### Session Expiry & Re-Authentication
If your authentication session expires (HTTP 401):
* The platform displays an **"Authentication Session Expired"** banner with a **Log In Again** button.
* Your current inputs in the 5-step wizard are **preserved in memory** so you do not lose your work.

### Application Recovery Shield (Error Boundary)
If an unexpected JavaScript rendering exception occurs in any component, the React Error Boundary catches it, displays diagnostics, and offers:
* **"Try Recovering State"**: Attempts to remount components without losing form data.
* **"Reload Application"**: Cleans caches and reloads the interface safely.

---

## 7. Frequently Asked Questions (FAQ)

#### Q: How is PackSmart AI different from standard packaging supplier catalogs?
**A:** Supplier catalogs list static properties at laboratory conditions ($23^\circ\text{C}, 0\%\text{ RH}$). PackSmart AI derives the exact biochemical requirements of your food and applies **temperature-scaled Arrhenius kinetics** to predict real-world shelf life, spoilage probabilities, and economic trade-offs.

#### Q: Can I specify custom food commodities not in the preset list?
**A:** Yes. Select any preset, click **"Customize Biochemical Specs"**, and adjust moisture, fat, pH, and respiration rate to match your proprietary recipe.

#### Q: How does PackSmart AI calculate shelf life?
**A:** It models three competing degradation pathways—**Microbial Spoilage**, **Lipid Oxidation**, and **Moisture Staling**—and identifies the rate-limiting mechanism:
$$\theta_{\text{shelf}} = \min(\theta_{\text{microbial}}, \theta_{\text{oxidation}}, \theta_{\text{moisture}})$$

#### Q: What does Equilibrium Modified Atmosphere Packaging (EMAP) do for fresh produce?
**A:** Live produce breathes ($O_2$ in, $CO_2$ out). Sealing produce in airtight film causes suffocation ($<2\% O_2$) and alcoholic fermentation. PackSmart AI calculates the exact respiration rate and determines the necessary **laser micro-perforation density** to maintain safe equilibrium ($3\text{--}5\% O_2$).

#### Q: How can I change a user's role to Super Admin?
**A:** Log in as **Sarah Chen (Super Admin)**, navigate to the **Admin** portal, locate the user in the User Directory, select **Super Admin** in the role dropdown, and confirm.

---

<p align="center">
  <b>PackSmart AI</b> · Smarter Packaging, A Healthier Tomorrow<br>
  <i>For technical support or inquiries, contact <a href="mailto:support@packsmart.ai">support@packsmart.ai</a></i>
</p>
