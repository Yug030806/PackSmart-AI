/**
 * PackSmart AI — Core Data Constants & Schemas
 * Preserves all existing ASTM barrier specifications, foods presets, and RBAC matrix.
 */

export const FOODS = {
  tomato: {
    id: "tomato",
    name: "Tomato",
    category: "Fresh produce",
    moisture: 94,
    fat: 0.2,
    ph: 4.3,
    respiration: "High",
    storage: "Chilled",
    shelf: 14,
    temp: 12,
    rh: 85,
    weight: 500,
    icon: "🍅",
    description: "High respiration climacteric fruit susceptible to chilling injury below 10°C and anaerobic fermentation."
  },
  apple: {
    id: "apple",
    name: "Apple",
    category: "Fresh produce",
    moisture: 86,
    fat: 0.2,
    ph: 3.8,
    respiration: "Medium",
    storage: "Chilled",
    shelf: 30,
    temp: 8,
    rh: 90,
    weight: 1000,
    icon: "🍏",
    description: "Moderate respiration fruit prone to dehydration, firmness loss, and superficial scald."
  },
  biscuits: {
    id: "biscuits",
    name: "Biscuits",
    category: "Bakery / snacks",
    moisture: 4,
    fat: 18,
    ph: 6.5,
    respiration: "None",
    storage: "Ambient",
    shelf: 120,
    temp: 25,
    rh: 60,
    weight: 250,
    icon: "🍪",
    description: "Low moisture, medium lipid snack requiring critical water vapor barrier to prevent loss of crispness."
  },
  rice: {
    id: "rice",
    name: "Rice",
    category: "Grains",
    moisture: 12,
    fat: 1,
    ph: 6.2,
    respiration: "None",
    storage: "Ambient",
    shelf: 180,
    temp: 25,
    rh: 60,
    weight: 1000,
    icon: "🌾",
    description: "Dry cereal grain sensitive to moisture absorption and insect infestation during extended storage."
  },
  chips: {
    id: "chips",
    name: "Potato Chips",
    category: "Snacks",
    moisture: 2,
    fat: 35,
    ph: 6.0,
    respiration: "None",
    storage: "Ambient",
    shelf: 120,
    temp: 25,
    rh: 65,
    weight: 150,
    icon: "🥔",
    description: "Ultra-low moisture with high lipid content (>30%) susceptible to rapid oxidative rancidity and staling."
  },
  paneer: {
    id: "paneer",
    name: "Paneer",
    category: "Dairy",
    moisture: 55,
    fat: 25,
    ph: 5.5,
    respiration: "None",
    storage: "Chilled",
    shelf: 14,
    temp: 4,
    rh: 80,
    weight: 200,
    icon: "🧀",
    description: "High moisture unaged cheese with active microbial load requiring chilled barrier protection."
  },
  nuts: {
    id: "nuts",
    name: "Roasted Almonds & Nuts",
    category: "Snacks",
    moisture: 3,
    fat: 52,
    ph: 6.4,
    respiration: "None",
    storage: "Ambient",
    shelf: 180,
    temp: 22,
    rh: 50,
    weight: 200,
    icon: "🥜",
    description: "High polyunsaturated fat content prone to lipid peroxidation, requiring high oxygen barrier."
  },
  chocolate: {
    id: "chocolate",
    name: "Dark Chocolate",
    category: "Bakery / snacks",
    moisture: 1.5,
    fat: 32,
    ph: 5.8,
    respiration: "None",
    storage: "Ambient",
    shelf: 365,
    temp: 18,
    rh: 55,
    weight: 100,
    icon: "🍫",
    description: "Cocoa butter lipid matrix sensitive to temperature fluctuations, fat bloom, and odor transmission."
  }
};

export const MATERIALS_CATALOG = [
  {
    id: "pet-pe",
    name: "PET / PE Laminate",
    short: "PET/PE",
    category: "Laminated Multilayer Film",
    nominal_otr: 45.0,
    nominal_wvtr: 4.5,
    thickness: "50–110 µm",
    nominal_thickness: 70,
    sustainability: 3,
    cost: 3.5,
    carbon: 2.9,
    recyclability: "Specialty Recycling (RIC 7)",
    description: "Biaxially oriented PET exterior laminated to LDPE interior for strong hermetic seal."
  },
  {
    id: "hdpe",
    name: "High-Density Polyethylene (HDPE)",
    short: "HDPE",
    category: "Mono-material Polyolefin",
    nominal_otr: 1200.0,
    nominal_wvtr: 3.2,
    thickness: "35–120 µm",
    nominal_thickness: 60,
    sustainability: 4,
    cost: 4.8,
    carbon: 1.9,
    recyclability: "Widely Recycled (RIC 2)",
    description: "Mono-material polyolefin offering excellent moisture barrier at low cost with established circular recycling."
  },
  {
    id: "metalized",
    name: "Metallized Film (BOPP / Met-PET)",
    short: "Metallized",
    category: "Vacuum-Deposited Barrier Film",
    nominal_otr: 1.5,
    nominal_wvtr: 0.6,
    thickness: "40–90 µm",
    nominal_thickness: 55,
    sustainability: 2,
    cost: 3.2,
    carbon: 3.4,
    recyclability: "Hard-to-recycle Multilayer",
    description: "Sub-micron aluminum vapor deposition providing near-foil gas and light protection."
  },
  {
    id: "alu-laminate",
    name: "Aluminium Foil Tri-Laminate (PET/Alu/PE)",
    short: "Alu Laminate",
    category: "Ultra-High Barrier Laminate",
    nominal_otr: 0.05,
    nominal_wvtr: 0.02,
    thickness: "70–160 µm",
    nominal_thickness: 95,
    sustainability: 2,
    cost: 2.0,
    carbon: 7.8,
    recyclability: "Landfill / Thermal Recovery",
    description: "True hermetic barrier impermeable to oxygen, moisture, and light for extreme shelf-life."
  },
  {
    id: "bio-film",
    name: "Bio-Based Compostable Film (PLA / PBAT)",
    short: "Bio-Film",
    category: "Industrial Compostable Biopolymer",
    nominal_otr: 380.0,
    nominal_wvtr: 35.0,
    thickness: "35–90 µm",
    nominal_thickness: 50,
    sustainability: 5,
    cost: 2.2,
    carbon: 1.4,
    recyclability: "Compostable (EN 13432)",
    description: "Bio-based compostable film with minimal fossil footprint. Moderate gas barrier."
  },
  {
    id: "breathable",
    name: "Micro-Perforated Breathable Film (Laser-Perf BOPP)",
    short: "Breathable",
    category: "Active / Modified Permeability Film",
    nominal_otr: 25000.0,
    nominal_wvtr: 85.0,
    thickness: "20–50 µm",
    nominal_thickness: 30,
    sustainability: 3.5,
    cost: 3.8,
    carbon: 2.2,
    recyclability: "Polyolefin Stream (RIC 5)",
    description: "Precision laser micro-perforations tuned to food respiration for equilibrium MAP."
  },
  {
    id: "evoh-pe",
    name: "EVOH High-Barrier Coextrusion (PE/EVOH/PE)",
    short: "EVOH/PE",
    category: "Recyclable High-Barrier Polyolefin",
    nominal_otr: 2.2,
    nominal_wvtr: 2.8,
    thickness: "50–120 µm",
    nominal_thickness: 75,
    sustainability: 4,
    cost: 3.0,
    carbon: 2.6,
    recyclability: "Compatible with PE recycling (<5% EVOH)",
    description: "Ethylene Vinyl Alcohol copolymer protected by PE skin layers for high barrier without foil."
  },
  {
    id: "paper-coated",
    name: "Barrier-Coated FSC Kraft Paper",
    short: "Coated Paper",
    category: "Renewable Fiber Barrier",
    nominal_otr: 25.0,
    nominal_wvtr: 12.0,
    thickness: "60–140 µm",
    nominal_thickness: 80,
    sustainability: 5,
    cost: 3.4,
    carbon: 1.1,
    recyclability: "Curbside Paper Recyclable (>85% fiber)",
    description: "FSC-certified kraft paper with aqueous dispersion coating for recyclable dry packaging."
  }
];

export const INITIAL_USERS = [
  {
    id: "usr-sa-001",
    name: "Sarah Chen",
    email: "admin@packsmart.ai",
    role: "super_admin",
    role_title: "Super Admin",
    access_level: "Full",
    status: "Active",
    created_at: "2026-01-10"
  },
  {
    id: "usr-sm-002",
    name: "Marcus Vance",
    email: "manager@packsmart.ai",
    role: "system_manager",
    role_title: "System Manager",
    access_level: "Management",
    status: "Active",
    created_at: "2026-02-15"
  },
  {
    id: "usr-u-003",
    name: "Alex Rivera",
    email: "user@packsmart.ai",
    role: "user",
    role_title: "Standard User",
    access_level: "Basic",
    status: "Active",
    created_at: "2026-03-01"
  }
];

export const INITIAL_LOGS = [
  { id: "log-1", timestamp: "2026-03-20 17:42:10", user: "admin@packsmart.ai", role: "super_admin", action: "AUTH_LOGIN", details: "Super Admin session initiated via MFA" },
  { id: "log-2", timestamp: "2026-03-20 17:41:05", user: "manager@packsmart.ai", role: "system_manager", action: "DB_SYNC", details: "Updated barrier limits for PET/PE Laminate" },
  { id: "log-3", timestamp: "2026-03-20 17:35:22", user: "user@packsmart.ai", role: "user", action: "ML_CALCULATION", details: "Executed packaging advisor for Potato Chips" },
  { id: "log-4", timestamp: "2026-03-20 17:15:40", user: "admin@packsmart.ai", role: "super_admin", action: "POLICY_UPDATE", details: "Calibrated ASTM safety margin to 1.15x" },
  { id: "log-5", timestamp: "2026-03-20 16:50:18", user: "admin@packsmart.ai", role: "super_admin", action: "ROLE_PERMISSION", details: "Audited 17-point RBAC access matrix" }
];

export const PERMISSIONS_MATRIX = [
  { id: "use_packaging_advisor", name: "Use Packaging Advisor", category: "Core ML Engine", user: true, manager: true, admin: true },
  { id: "compare_materials", name: "Compare Materials (ASTM)", category: "Core ML Engine", user: true, manager: true, admin: true },
  { id: "what_if_simulator", name: "What-If Simulator & Sizing", category: "Core ML Engine", user: true, manager: true, admin: true },
  { id: "view_recommendations", name: "View Recommendations & Pareto", category: "Core ML Engine", user: true, manager: true, admin: true },
  { id: "download_reports", name: "Download & Export Reports", category: "Reporting", user: true, manager: true, admin: true },
  { id: "view_history", name: "View Calculation History", category: "Reporting", user: true, manager: true, admin: true },
  { id: "manage_users", name: "Manage Standard Users", category: "User Administration", user: false, manager: true, admin: true },
  { id: "manage_system_managers", name: "Manage System Managers", category: "User Administration", user: false, manager: false, admin: true },
  { id: "manage_roles_permissions", name: "Manage Roles & Permissions", category: "Security & Access", user: false, manager: false, admin: true },
  { id: "manage_food_database", name: "Manage Food Database", category: "Data Management", user: false, manager: true, admin: true },
  { id: "manage_material_database", name: "Manage Packaging-Material Database", category: "Data Management", user: false, manager: true, admin: true },
  { id: "edit_recommendations", name: "View & Edit Recommendations", category: "Data Management", user: false, manager: true, admin: true },
  { id: "view_all_reports", name: "View All Generated Reports", category: "Reporting", user: false, manager: true, admin: true },
  { id: "view_system_activity_logs", name: "View System Activity / Audit Logs", category: "Security & Access", user: false, manager: false, admin: true },
  { id: "configure_application_settings", name: "Application Settings & Configuration", category: "System Configuration", user: false, manager: true, admin: true },
  { id: "manage_security_access_controls", name: "Security & Access Control Management", category: "Security & Access", user: false, manager: false, admin: true },
  { id: "full_database_access", name: "Complete Database Access", category: "Data Management", user: false, manager: false, admin: true }
];

export const DEMO_ACCOUNTS = [
  {
    role: "super_admin",
    label: "Super Admin",
    email: "admin@packsmart.ai",
    password: "admin",
    badge: "👑",
    level: "Full System Access",
    desc: "Unrestricted root access, security controls, and full database access."
  },
  {
    role: "system_manager",
    label: "System Manager",
    email: "manager@packsmart.ai",
    password: "manager",
    badge: "🛠️",
    level: "Management Access",
    desc: "Everything a User can do + manage users, food/material data, recommendations, reports."
  },
  {
    role: "user",
    label: "Standard User",
    email: "user@packsmart.ai",
    password: "user",
    badge: "👤",
    level: "Basic Access",
    desc: "Use packaging advisor, compare materials, What-If simulator, reports, history."
  }
];

export const POPULAR_FOOD_TAGS = [
  { id: "chips", label: "Chips", key: "chips" },
  { id: "biscuits", label: "Biscuits", key: "biscuits" },
  { id: "nuts", label: "Nuts", key: "nuts" },
  { id: "chocolate", label: "Chocolate", key: "chocolate" },
  { id: "dairy", label: "Dairy (Paneer)", key: "paneer" },
  { id: "bakery", label: "Bakery", key: "biscuits" },
  { id: "produce", label: "Fresh Tomato", key: "tomato" },
  { id: "apple", label: "Apple", key: "apple" }
];
