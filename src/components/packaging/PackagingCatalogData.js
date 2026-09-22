export const REAL_PACKAGING_FORMATS = [
  {
    id: "pet-bottle",
    name: "PET Bottle",
    material: "Polyethylene Terephthalate",
    code: "RIC 1 (PET)",
    category: "Rigid Plastic Container",
    typicalUse: "Beverages, fruit juices, edible oils, sauces",
    barrierSummary: "Medium Gas & Moisture Barrier",
    barrierRatings: {
      oxygen: "Medium (30-45 cc/m²·d)",
      moisture: "High (3-5 g/m²·d)",
      light: "Low (Clear) / High (Amber/UV additive)"
    },
    durability: "High (Shatter-resistant, drops up to 1.8m)",
    recyclability: "High (Widely recycled in curbside streams)",
    circularityScore: 88,
    nominalWeight: "22 - 38 g",
    carbonFootprint: "2.1 kg CO₂e / kg",
    transportProtection: "Excellent (Lightweight, compressive strength)",
    engineeringNotes: "Biaxially oriented molecular chain provides tensile strength and carbonation retention. Susceptible to thermal deformation above 60°C.",
    iconType: "bottle"
  },
  {
    id: "glass-jar",
    name: "Glass Jar / Bottle",
    material: "Soda-Lime Silica Glass",
    code: "GL 70 / GL 71",
    category: "Rigid Inorganic Container",
    typicalUse: "Jams, preserves, sauces, baby food, premium juices",
    barrierSummary: "Absolute Hermetic Barrier (Zero OTR/WVTR)",
    barrierRatings: {
      oxygen: "Impermeable (0.00 cc/m²·d)",
      moisture: "Impermeable (0.00 g/m²·d)",
      light: "High (Amber/Flint with UV filters)"
    },
    durability: "Low to Moderate (Brittle, impact-sensitive, high burst strength)",
    recyclability: "Highest (100% infinitely recyclable closed loop)",
    circularityScore: 94,
    nominalWeight: "180 - 320 g",
    carbonFootprint: "0.85 kg CO₂e / kg (High transport mass impact)",
    transportProtection: "Requires cushioning & corrugated dividers to prevent transit chipping",
    engineeringNotes: "Zero chemical leaching with non-porous interior. Inert to acidic food matrices (pH < 4.0). Requires thermal shock tolerance margin (ΔT ≤ 42°C).",
    iconType: "jar"
  },
  {
    id: "paper-carton",
    name: "Aseptic Paper Carton",
    material: "FSC Paperboard + LDPE + Alu Foil Layer",
    code: "C/PAP 84",
    category: "Aseptic Multi-Material Composite",
    typicalUse: "UHT milk, plant milks, broths, non-carbonated juices",
    barrierSummary: "High Barrier (Aseptic Light & Oxygen Shield)",
    barrierRatings: {
      oxygen: "High (≤ 0.1 cc/m²·d with 6µm alu foil)",
      moisture: "High (≤ 0.5 g/m²·d)",
      light: "Complete 100% Opacity"
    },
    durability: "Moderate (Puncture resistant, stackable cubic geometry)",
    recyclability: "Medium (Specialized hydrapulping fiber recovery plants)",
    circularityScore: 72,
    nominalWeight: "24 - 32 g per 1L",
    carbonFootprint: "1.2 kg CO₂e / kg",
    transportProtection: "High pallet cube efficiency (up to 95% space utilization)",
    engineeringNotes: "Multi-ply board (75% paperboard for rigidity, 20% polyethylene for liquid seals, 5% aluminum foil for light/O₂ shield). Enables 12-month ambient shelf life without refrigeration.",
    iconType: "carton"
  },
  {
    id: "aluminum-can",
    name: "Aluminum Can",
    material: "Aluminum Alloy 3104 / 5182",
    code: "ALU 41",
    category: "Hermetic Metal Container",
    typicalUse: "Carbonated soft drinks, beer, functional seltzers, ready-to-drink tea",
    barrierSummary: "Absolute Hermetic Barrier (Zero Gas/Light Permeation)",
    barrierRatings: {
      oxygen: "Impermeable (0.00 cc/m²·d)",
      moisture: "Impermeable (0.00 g/m²·d)",
      light: "Complete 100% Opacity"
    },
    durability: "High (Withstands internal carbonation pressure up to 90 psi)",
    recyclability: "Highest (Can-to-can recycling within 60 days)",
    circularityScore: 96,
    nominalWeight: "12 - 15 g (Ultra-lightweight two-piece D&I)",
    carbonFootprint: "8.2 kg CO₂e / kg (Virgin) / 0.9 kg (Recycled content)",
    transportProtection: "Excellent impact absorption; compact column stacking",
    engineeringNotes: "Internal epoxy-free cross-linked polymer liner protects against corrosion from carbonic and citric acids. Rapid chilling thermal conductivity.",
    iconType: "can"
  },
  {
    id: "multilayer-pouch",
    name: "Multilayer Barrier Pouch",
    material: "PET / Met-PET or EVOH / LLDPE",
    code: "OTHER 7 (Barrier Multilayer)",
    category: "Flexible Laminate Pouch",
    typicalUse: "Potato chips, dry nuts, coffee, spice blends, retort ready-meals",
    barrierSummary: "High Gas & Moisture Barrier",
    barrierRatings: {
      oxygen: "High (0.5 - 2.5 cc/m²·d)",
      moisture: "High (0.4 - 1.2 g/m²·d)",
      light: "High (Metallized barrier opacity)"
    },
    durability: "Very High (Flexible puncture resistance, hermetic fin seals)",
    recyclability: "Low to Moderate (Mono-PE/EVOH emerging for circular stream)",
    circularityScore: 64,
    nominalWeight: "3.5 - 8.5 g",
    carbonFootprint: "2.8 kg CO₂e / kg (Lowest packaging-to-product ratio: 1.5%)",
    transportProtection: "Superior flexibility; eliminates transit breakage and shattering",
    engineeringNotes: "Vacuum-deposited aluminum layer provides sub-micron barrier with minimal mass. Hermetic nitrogen gas flushing prevents lipid rancidity.",
    iconType: "pouch"
  },
  {
    id: "corrugated-box",
    name: "Corrugated Secondary Box",
    material: "Kraft Linerboard + Fluted Medium (B/C Flute)",
    code: "PAP 20 (Corrugated)",
    category: "Tertiary / Distribution Packaging",
    typicalUse: "Bulk distribution, produce master cartons, e-commerce transport",
    barrierSummary: "Breathable Structural Packaging",
    barrierRatings: {
      oxygen: "High Gas Exchange (Permeable)",
      moisture: "Permeable / Moisture-Sensitive (Loss of ECT at >80% RH)",
      light: "Opaque"
    },
    durability: "High compressive stacking strength (BCT ≥ 3.5 kN)",
    recyclability: "Highest (92%+ recovered in municipal fiber streams)",
    circularityScore: 92,
    nominalWeight: "220 - 450 g",
    carbonFootprint: "0.78 kg CO₂e / kg",
    transportProtection: "Critical shock absorption, vibration damping, and warehouse stacking",
    engineeringNotes: "Edge Crush Test (ECT) engineered to withstand warehouse humidity cycles. Micro-vented slots allow produce respiration heat dissipation.",
    iconType: "box"
  },
  {
    id: "compostable-pack",
    name: "Biodegradable Compostable Pack",
    material: "PLA / PBAT / Thermoplastic Starch",
    code: "EN 13432 / ASTM D6400",
    category: "Biopolymer Flexible / Rigid Film",
    typicalUse: "Organic snacks, fresh bakery goods, short-shelf fresh produce",
    barrierSummary: "Moderate Gas Barrier / Breathable Moisture",
    barrierRatings: {
      oxygen: "Moderate (350 - 450 cc/m²·d)",
      moisture: "Breathable (25 - 40 g/m²·d)",
      light: "Semi-translucent to clear"
    },
    durability: "Moderate (Good tensile strength, lower tear propagation limit)",
    recyclability: "Organic Recycling (Decomposes within 90 days in industrial composting)",
    circularityScore: 82,
    nominalWeight: "4.2 - 9.0 g",
    carbonFootprint: "1.4 kg CO₂e / kg (Bio-based carbon capture credit)",
    transportProtection: "Moderate; requires temperature control below 45°C in logistics",
    engineeringNotes: "Derived from renewable corn starch / sugarcane. Prevents condensation in high-moisture bakery items, avoiding mold blooms.",
    iconType: "compostable"
  }
];
