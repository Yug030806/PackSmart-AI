<p align="center">
  <img src="./assets/logo.jpg" alt="PackSmart AI Logo" width="220" style="border-radius: 20px; box-shadow: 0 12px 36px rgba(0,0,0,0.25);" />
</p>

<h1 align="center">🌿 PackSmart AI</h1>

<p align="center">
  <b>Smarter Packaging · A Healthier Tomorrow</b><br>
  <i>Real Machine Learning & ASTM Barrier Physics Engine for Food Preservation, Shelf-Life Optimization, and Sustainable Packaging Design</i>
</p>

<p align="center">
  <a href="#-key-features"><img src="https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python 3.13" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/Scikit--Learn-R²_%3D_0.996-F7931E?style=flat-square&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 5" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/ASTM-D3985_%7C_F1249-2e7d32?style=flat-square" alt="ASTM Standards" /></a>
  <a href="#-role-based-access-control-rbac"><img src="https://img.shields.io/badge/Security-3--Tier_RBAC-gold?style=flat-square" alt="RBAC" /></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License MIT" /></a>
</p>

---

## 📋 Table of Contents

- [Executive Overview](#-executive-overview)
- [System Architecture](#-system-architecture)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Core Engineering Engines](#-core-engineering-engines)
  - [1. Real ASTM Barrier Physics Engine](#1-real-astm-barrier-physics-engine)
  - [2. Coupled Kinetic Shelf-Life Prediction](#2-coupled-kinetic-shelf-life-prediction)
  - [3. Equilibrium Modified Atmosphere Packaging (EMAP)](#3-equilibrium-modified-atmosphere-packaging-emap)
  - [4. True Packaging Unit Economics](#4-true-packaging-unit-economics)
  - [5. Quantitative LCA Sustainability & Circularity](#5-quantitative-lca-sustainability--circularity)
  - [6. Multi-Objective Constrained Pareto Optimization](#6-multi-objective-constrained-pareto-optimization)
- [Packaging Materials & Food Preset Library](#-packaging-materials--food-preset-library)
- [Quickstart Guide](#-quickstart-guide)
- [REST API Reference](#-rest-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [License](#license)

---

## 🌟 Executive Overview

In commercial food manufacturing, packaging selection is frequently driven by trial-and-error or subjective "High / Medium / Low" supplier descriptors. This causes two severe industry failure modes:

1. **Under-packaging**: Saving $\$0.01$ on barrier film results in oxidation rancidity or moisture caking, causing **$\$0.25+$ per pack in premature food loss**.
2. **Over-packaging**: Specifying thick non-recyclable multi-material foils for short-distribution commodities generates unnecessary resin costs and carbon liabilities.

**PackSmart AI** bridges food chemistry, machine learning, and polymer permeation physics. It calculates exact, physically derived barrier requirements:

- **$\text{OTR}_{max}$** in $\text{cc}/(\text{m}^2 \cdot \text{day} \cdot \text{atm})$ via lipid oxidation kinetics and respiration equations.
- **$\text{WVTR}_{max}$** in $\text{g}/(\text{m}^2 \cdot \text{day})$ via water activity ($a_w$) and sorption isotherms.

Every packaging material is evaluated under **temperature-scaled Arrhenius permeability** with rigorous **PASS / FAIL** validation, safety margin calculations, MAP gas formulations, unit-cost economics, and life-cycle circularity assessments.

---

## 🏗️ System Architecture

```
                                    PACKSMART AI PIPELINE
                                    
  [ Food Chemistry & Environmental Conditions ]
  • Moisture (%), Fat (%), pH, Respiration Rate
  • Storage Temp (°C), Relative Humidity (% RH), Target Shelf-Life
                         │
                         ▼
  [ ASTM Sorption & Oxidation Kinetics Engine ]
  • Computes Critical Oxygen Absorption: Δ[O₂]crit (cc)
  • Computes Critical Moisture Gain: ΔMcrit (g)
  • Calculates Maximum Allowable OTR & WVTR Thresholds
                         │
                         ▼
  [ Scikit-Learn MultiOutput Random Forest (R² = 0.996) ]
  • Predicts Multi-Dimensional Suitability across 7 Polymer Categories
  • Evaluates Barrier Compatibility against Target Ingress
                         │
                         ▼
  [ Temperature-Dependent Arrhenius Barrier Verification ]
  • ASTM D3985 (Oxygen) & ASTM F1249 (Water Vapor)
  • PASS / FAIL Verification with Safety Buffer (+% Margin)
                         │
                         ▼
  [ Coupled Kinetic Shelf-Life & EMAP Engine ]
  • Evaluates min(θ_microbial, θ_oxidation, θ_moisture)
  • Solves Gas Exchange: Flush % (O₂, CO₂, N₂) & Equilibrium Headspace
                         │
                         ▼
  [ Constrained Multi-Objective Pareto Optimization ]
  ┌──────────────────────┬──────────────────────┬──────────────────────┬──────────────────────┐
  │ Option A: Max Life   │ Option B: Lowest Cost│ Option C: High Sust  │ Option D: Balanced   │
  └──────────────────────┴──────────────────────┴──────────────────────┴──────────────────────┘
```

---

## 🛡️ Role-Based Access Control (RBAC)

PackSmart AI features an enterprise-grade 3-tier hierarchical security topology:

```
                    SUPER ADMIN
                  Full System Access
                         │
                         ▼
                  SYSTEM MANAGER
                Management Access
                         │
                         ▼
                       USER
                   Basic Access
```

### Access Tiers & Privileges

| Role | Access Level | Main Access & Capabilities |
| :--- | :--- | :--- |
| **👑 Super Admin** | **Full System Access** | **Unrestricted root access across the entire application:**<br>• Manage Users<br>• Manage System Managers<br>• Manage roles and permissions<br>• Manage food database<br>• Manage packaging-material database<br>• View/edit recommendations<br>• View all reports<br>• View system activity / audit logs<br>• Application settings & configuration<br>• Security & access control management<br>• Complete database access |
| **🛠️ System Manager** | **Management Access** | **Operational management & catalog oversight:**<br>• Everything a User can do<br>• Manage users<br>• Food/material data<br>• Recommendations and reports<br>• Application settings |
| **👤 User** | **Basic Access** | **Core barrier physics evaluation & analysis:**<br>• Use packaging advisor<br>• Compare materials<br>• What-If simulator<br>• Recommendations<br>• Reports<br>• History |

### Pre-Configured Demo Accounts (1-Click Switch in UI)

| Account | Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Sarah Chen** | 👑 Super Admin | `admin@packsmart.ai` | `admin` | Full System Access (17 Privileges) |
| **Marcus Vance** | 🛠️ System Manager | `manager@packsmart.ai` | `manager` | Management Access (12 Privileges) |
| **Alex Rivera** | 👤 Standard User | `user@packsmart.ai` | `user` | Basic Access (6 Privileges) |

---

## 🔬 Core Engineering Engines

### 1. Real ASTM Barrier Physics Engine

#### Allowable Oxygen Transmission Rate ($\text{OTR}_{max}$):
$$\Delta [O_2]_{crit} = W_{fat} \times \text{Uptake Limit} \quad [\text{cc } O_2]$$

$$\text{OTR}_{req} = \frac{\Delta [O_2]_{crit}}{A \times \theta \times \Delta P_{O2} \times k_{temp}} \quad [\text{cc} / (\text{m}^2 \cdot \text{day} \cdot \text{atm})]$$

#### Allowable Water Vapor Transmission Rate ($\text{WVTR}_{max}$):
$$\Delta M_{crit} = \frac{|M_{crit} - M_0|}{100} \times W_{food} \quad [\text{grams } H_2O]$$

$$\text{WVTR}_{req} = \frac{\Delta M_{crit}}{A \times \theta} \times \frac{\Delta RH_{ASTM}}{\Delta RH_{ambient}} \times \frac{1}{P_{sat}(T)/P_{sat}(38^\circ\text{C})} \quad [\text{g} / (\text{m}^2 \cdot \text{day})]$$

---

### 2. Coupled Kinetic Shelf-Life Prediction

Evaluates three competing degradation pathways to identify the rate-limiting spoilage mechanism:

$$\theta_{shelf} = \min(\theta_{microbial},\; \theta_{oxidation},\; \theta_{moisture})$$

- **Microbial Spoilage ($\theta_{microbial}$)**: Ratkowsky square-root growth kinetics based on storage temperature, water activity ($a_w$), pH, initial microbial baseline ($N_0$), and headspace $CO_2$ dissolution.
- **Lipid Oxidation ($\theta_{oxidation}$)**: Fickian oxygen permeation flux integrated with Arrhenius peroxide decomposition kinetics.
- **Moisture Staling ($\theta_{moisture}$)**: Water vapor sorption driving crispness loss or moisture caking.

---

### 3. Equilibrium Modified Atmosphere Packaging (EMAP)

For fresh respiring produce, PackSmart AI solves the steady-state respiration-permeation balance:

$$\text{OTR}_{produce} = \frac{R_{O2}(T) \times W_{kg} \times 24}{A \times (0.21 - [O_2]_{target})} \quad [\text{cc} / (\text{m}^2 \cdot \text{day} \cdot \text{atm})]$$

- **Produce EMAP**: Balances $O_2$ (3–5%) and $CO_2$ (4–7%) to arrest senescence while preventing anaerobic fermentation.
- **Snacks & Bakery**: $O_2 \le 0.2\%$, $CO_2 = 0\%$, $N_2 = 99.8\%$ (inert cushion preventing rancidity and mechanical crushing).
- **Chilled Dairy & Cheese**: $O_2 \le 0.1\%$, $CO_2 = 30\%$, $N_2 = 70\%$ (bacteriostatic protection).

---

### 4. True Packaging Unit Economics

Calculates the complete financial risk equation:

$$\text{Packaging Cost} = \text{Raw Resin Cost} + \text{Conversion Lamination} + \text{Transportation}$$

$$\text{Total Cost} = \text{Packaging Cost} + \text{Expected Food Loss Cost} \quad [\$/\text{pack}]$$

where:
$$\text{Expected Food Loss Cost} = P_{spoilage}(\Delta\text{OTR}, \Delta\text{WVTR}, \theta_{deficit}) \times \text{Commercial Food Value}$$

---

### 5. Quantitative LCA Sustainability & Circularity

Replaces qualitative star ratings with life-cycle indicators:
- **Packaging-to-Product Ratio (PPR %)**: Sized to minimal safe thickness gauge ($\mu\text{m}$).
- **Post-Consumer Recycled (PCR %)** & Renewable Biopolymer Content.
- **Avoided Food Waste Carbon Credit**: Upstream agricultural emissions saved by barrier preservation.
- **Net Carbon Impact**: $\text{Embodied Packaging Carbon} - \text{Avoided Spoilage Carbon Offset}$ ($\text{g CO}_2\text{e/pack}$).
- **Circularity Grades**: Grade A+ (100% Monomaterial Circular) down to Grade D (Non-recyclable Retort Foil).

---

### 6. Multi-Objective Constrained Pareto Optimization

Extracts 4 distinct non-dominated configurations:
- **Option A → Maximum Shelf Life**: Maximizes barrier protection and product longevity.
- **Option B → Lowest Total Cost**: Minimizes packaging expense + expected food loss.
- **Option C → Higher Sustainability**: Maximizes circularity index and recyclability.
- **Option D → Balanced Solution**: Multi-objective compromise tuned to user priorities.

---

## 📦 Packaging Materials & Food Preset Library

### Materials Library (ASTM D3985 & F1249 Certified)

| Material Structure | Category | Nominal OTR | Nominal WVTR | Circularity Grade | Best Suited For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PET / PE Laminate** | Multilayer Barrier | $45.0\text{ cc}$ | $4.5\text{ g}$ | Grade B (Recyclable RIC 7) | High-speed flow wrap, ambient dry goods |
| **HDPE Mono-Film** | Polyolefin Mono | $1,850\text{ cc}$ | $4.2\text{ g}$ | Grade A (Curbside RIC 2) | High moisture barrier, low oxidation risk |
| **Metallized BOPP/Met-PET**| High Barrier Laminate| $1.2\text{ cc}$ | $0.8\text{ g}$ | Grade B (Specialty RIC 7) | Potato chips, roasted nuts, coffee |
| **Aluminium Tri-Laminate** | Ultra-Hermetic Foil | $0.05\text{ cc}$ | $0.05\text{ g}$| Grade D (Thermal Recovery) | 12+ month shelf life, retort pouches |
| **Bio-Based PLA / PBAT** | Compostable Biopolymer| $420.0\text{ cc}$| $18.0\text{ g}$| Grade A+ (Industrial Compost) | Short shelf-life organics, confectionery |
| **Laser Micro-Perforated** | Breathable EMAP | $35,000\text{ cc}$| $65.0\text{ g}$| Grade A (Curbside PE) | Fresh tomatoes, apples, leafy greens |
| **EVOH Coextrusion** | High-Barrier Polyolefin| $2.5\text{ cc}$ | $2.1\text{ g}$ | Grade A (PE Stream Compatible) | Paneer, cheese, fresh pasta, chilled meat |
| **Barrier FSC Kraft Paper** | Aqueous Barrier Paper| $150.0\text{ cc}$ | $12.0\text{ g}$| Grade A+ (Curbside Paper) | Dry bakery, pulses, grain pouches |

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.10+** (Python 3.13 recommended)
- **Node.js 18+** & `npm`

### 1. Backend Setup

```bash
# Navigate to project root
cd /path/to/PackSmart-AI

# Activate virtual environment
source .venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# (Optional) Retrain Scikit-learn MultiOutput Random Forest
python backend/train_model.py

# Launch FastAPI backend server (Port 8000)
python backend/run.py
```

FastAPI interactive Swagger documentation is available at:
`http://127.0.0.1:8000/docs`

### 2. Frontend Setup

In a second terminal:

```bash
# Install NPM packages
npm install

# Launch Vite development server (Port 5173)
npm run dev
```

Open your browser at `http://localhost:5173`.

### 3. Concurrent Development

```bash
npm run dev:all
```

---

## 📡 REST API Reference

| Endpoint | Method | Access Level | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates user credentials and returns active RBAC profile |
| `/api/auth/roles` | `GET` | Public | Returns complete 3-tier Role Hierarchy and 17-privilege mapping |
| `/api/admin/users` | `GET` | Manager / Admin | Lists all registered accounts and current roles |
| `/api/admin/users/update`| `POST` | Super Admin | Updates user role (User / Manager / Super Admin) or status |
| `/api/admin/logs` | `GET` | Super Admin | Returns real-time security and activity audit logs |
| `/api/recommend` | `POST` | Basic (All) | Full ML pipeline: requirements $\rightarrow$ barrier check $\rightarrow$ Pareto |
| `/api/calculate-barrier`| `POST` | Basic (All) | Computes allowable OTR/WVTR limits from food chemistry |
| `/api/shelf-life/predict`| `POST`| Basic (All) | Coupled kinetic shelf-life prediction (Microbial, Oxidation, Moisture)|
| `/api/map/optimize` | `POST` | Basic (All) | Optimizes MAP gas flush and equilibrium headspace |
| `/api/simulate` | `POST` | Basic (All) | What-If simulator across temperature, humidity, and shelf life |
| `/api/materials` | `GET` | Basic (All) | ASTM technical specifications catalog |
| `/api/foods` | `GET` | Basic (All) | Food composition and sorption isotherm presets |
| `/api/health` | `GET` | Public | System and ML engine health check |

---

## 🧪 Testing & Quality Assurance

```bash
# Verify backend auth and RBAC engine
.venv/bin/python -c "
from backend.app.auth import authenticate_user, list_all_users, get_system_audit_logs
res = authenticate_user('admin@packsmart.ai', 'admin')
print('Super Admin verified:', res.user.role, len(res.user.permissions), 'permissions')
"

# Run frontend production build
npm run build
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<p align="center">
  <b>PackSmart AI</b> · Smarter Packaging, A Healthier Tomorrow
</p>
