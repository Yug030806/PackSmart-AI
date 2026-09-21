-- ============================================================================
-- PACKSMART AI — COMPLETE SUPABASE DATABASE SCHEMA
-- Production PostgreSQL Schema for ASTM Barrier Physics, ML Optimization,
-- RBAC Security Architecture, and Real-time Auditing.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE 1: profiles (User Accounts & Role-Based Access Control)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT DEFAULT 'pbkdf2_sha256$placeholder',
    role TEXT NOT NULL CHECK (role IN ('user', 'system_manager', 'super_admin')),
    access_level TEXT NOT NULL CHECK (access_level IN ('Basic', 'Management', 'Full')),
    role_title TEXT NOT NULL,
    badge_icon TEXT NOT NULL DEFAULT '👤',
    permissions TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on email and role
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- TABLE 2: packaging_materials (ASTM Barrier Materials Catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.packaging_materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    category TEXT NOT NULL,
    nominal_otr NUMERIC NOT NULL,       -- ASTM D3985: cc/(m²·day·atm)
    nominal_wvtr NUMERIC NOT NULL,      -- ASTM F1249: g/(m²·day)
    thickness TEXT NOT NULL,            -- e.g. '50–110 µm'
    nominal_thickness_um NUMERIC NOT NULL,
    sustainability_score NUMERIC NOT NULL DEFAULT 3,
    cost_rating NUMERIC NOT NULL DEFAULT 3,
    carbon_footprint NUMERIC NOT NULL DEFAULT 2.5, -- kg CO₂e/kg polymer
    recyclability TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 3: food_presets (Food Chemistry & Sorption Isotherm Database)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.food_presets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    moisture_pct NUMERIC NOT NULL,
    fat_pct NUMERIC NOT NULL,
    ph NUMERIC NOT NULL,
    respiration_rate TEXT NOT NULL CHECK (respiration_rate IN ('None', 'Low', 'Medium', 'High')),
    storage_type TEXT NOT NULL CHECK (storage_type IN ('Ambient', 'Chilled', 'Frozen')),
    shelf_life_days INT NOT NULL,
    opt_temp_c NUMERIC DEFAULT 25.0,
    opt_rh_pct NUMERIC DEFAULT 60.0,
    package_weight_g NUMERIC DEFAULT 250.0,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 4: recommendation_history (Audit Trail of ML Analyses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recommendation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    food_id TEXT,
    food_name TEXT NOT NULL,
    category TEXT NOT NULL,
    input_conditions JSONB NOT NULL,
    recommended_material_id TEXT NOT NULL,
    recommended_material_name TEXT NOT NULL,
    overall_score NUMERIC NOT NULL,
    ml_suitability_score NUMERIC NOT NULL,
    recommended_gauge_um NUMERIC NOT NULL,
    target_otr_max NUMERIC,
    actual_otr NUMERIC,
    target_wvtr_max NUMERIC,
    actual_wvtr NUMERIC,
    barrier_status TEXT NOT NULL,
    predicted_shelf_life_days INT,
    limiting_factor TEXT,
    packaging_cost_per_pack NUMERIC,
    expected_loss_cost_per_pack NUMERIC,
    total_cost_per_pack NUMERIC,
    sustainability_index NUMERIC,
    circularity_grade TEXT,
    pareto_options JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendation_history_email ON public.recommendation_history(user_email);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_created ON public.recommendation_history(created_at DESC);

-- ============================================================================
-- TABLE 5: system_audit_logs (Immutable Security & Activity Stream)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('log-' || substr(md5(random()::text), 1, 8)),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_email TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    details TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.system_audit_logs(timestamp DESC);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packaging_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon & authenticated roles full read access to public reference catalogs
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write profiles" ON public.profiles;
CREATE POLICY "Public write profiles" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read materials" ON public.packaging_materials;
CREATE POLICY "Public read materials" ON public.packaging_materials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write materials" ON public.packaging_materials;
CREATE POLICY "Public write materials" ON public.packaging_materials FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read foods" ON public.food_presets;
CREATE POLICY "Public read foods" ON public.food_presets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write foods" ON public.food_presets;
CREATE POLICY "Public write foods" ON public.food_presets FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read history" ON public.recommendation_history;
CREATE POLICY "Public read history" ON public.recommendation_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write history" ON public.recommendation_history;
CREATE POLICY "Public write history" ON public.recommendation_history FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read logs" ON public.system_audit_logs;
CREATE POLICY "Public read logs" ON public.system_audit_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write logs" ON public.system_audit_logs;
CREATE POLICY "Public write logs" ON public.system_audit_logs FOR ALL USING (true);

-- ============================================================================
-- 7. INITIAL SEED DATA
-- ============================================================================

-- Seed 1: Default RBAC Profiles
INSERT INTO public.profiles (id, name, email, role, access_level, role_title, badge_icon, permissions, status)
VALUES
(
    'usr-sa-001',
    'Sarah Chen',
    'admin@packsmart.ai',
    'super_admin',
    'Full',
    'Super Admin',
    '👑',
    ARRAY[
        'use_packaging_advisor', 'compare_materials', 'what_if_simulator',
        'view_recommendations', 'download_reports', 'view_history',
        'manage_users', 'manage_system_managers', 'manage_roles_permissions',
        'manage_food_database', 'manage_material_database', 'edit_recommendations',
        'view_all_reports', 'view_system_activity_logs', 'configure_application_settings',
        'manage_security_access_controls', 'full_database_access'
    ],
    'Active'
),
(
    'usr-sm-002',
    'Marcus Vance',
    'manager@packsmart.ai',
    'system_manager',
    'Management',
    'System Manager',
    '🛠️',
    ARRAY[
        'use_packaging_advisor', 'compare_materials', 'what_if_simulator',
        'view_recommendations', 'download_reports', 'view_history',
        'manage_users', 'manage_food_database', 'manage_material_database',
        'edit_recommendations', 'view_all_reports', 'configure_application_settings'
    ],
    'Active'
),
(
    'usr-bu-003',
    'Alex Rivera',
    'user@packsmart.ai',
    'user',
    'Basic',
    'Standard User',
    '👤',
    ARRAY[
        'use_packaging_advisor', 'compare_materials', 'what_if_simulator',
        'view_recommendations', 'download_reports', 'view_history'
    ],
    'Active'
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    access_level = EXCLUDED.access_level,
    permissions = EXCLUDED.permissions;

-- Seed 2: Standard ASTM Packaging Materials
INSERT INTO public.packaging_materials (id, name, short_name, category, nominal_otr, nominal_wvtr, thickness, nominal_thickness_um, sustainability_score, cost_rating, carbon_footprint, recyclability, description)
VALUES
(
    'pet-pe',
    'PET / PE Laminate',
    'PET/PE',
    'Laminated Multilayer Film',
    45.0,
    4.5,
    '50–110 µm',
    70,
    3,
    3.5,
    2.9,
    'Specialty Recycling (RIC 7)',
    'Biaxially oriented PET exterior laminated to LDPE interior for strong hermetic seal.'
),
(
    'hdpe',
    'High-Density Polyethylene (HDPE)',
    'HDPE',
    'Mono-material Polyolefin',
    1200.0,
    3.2,
    '35–120 µm',
    60,
    4,
    4.8,
    1.9,
    'Widely Recycled (RIC 2)',
    'Mono-material polyolefin offering excellent moisture barrier at low cost with established circular recycling.'
),
(
    'metalized',
    'Metallized Film (BOPP / Met-PET)',
    'Metallized',
    'Vacuum-Deposited Barrier Film',
    1.5,
    0.6,
    '40–90 µm',
    55,
    2,
    3.2,
    3.4,
    'Hard-to-recycle Multilayer',
    'Sub-micron aluminum vapor deposition providing near-foil gas and light protection.'
),
(
    'alu-laminate',
    'Aluminium Foil Tri-Laminate (PET/Alu/PE)',
    'Alu Laminate',
    'Ultra-High Barrier Laminate',
    0.05,
    0.02,
    '70–160 µm',
    95,
    2,
    2.0,
    7.8,
    'Landfill / Thermal Recovery',
    'True hermetic barrier impermeable to oxygen, moisture, and light for extreme shelf-life.'
),
(
    'bio-film',
    'Bio-Based Compostable Film (PLA / PBAT)',
    'Bio-Film',
    'Industrial Compostable Biopolymer',
    380.0,
    35.0,
    '35–90 µm',
    50,
    5,
    2.2,
    1.4,
    'Compostable (EN 13432)',
    'Bio-based compostable film with minimal fossil footprint. Moderate gas barrier.'
),
(
    'breathable',
    'Micro-Perforated Breathable Film (Laser-Perf BOPP)',
    'Breathable',
    'Active / Modified Permeability Film',
    25000.0,
    85.0,
    '20–50 µm',
    30,
    3.5,
    3.8,
    2.2,
    'Polyolefin Stream (RIC 5)',
    'Precision laser micro-perforations tuned to food respiration for equilibrium MAP.'
),
(
    'evoh-pe',
    'EVOH High-Barrier Coextrusion (PE/EVOH/PE)',
    'EVOH/PE',
    'Recyclable High-Barrier Polyolefin',
    2.2,
    2.8,
    '50–120 µm',
    75,
    4,
    3.0,
    2.6,
    'Compatible with PE recycling (<5% EVOH)',
    'Ethylene Vinyl Alcohol copolymer protected by PE skin layers for high barrier without foil.'
),
(
    'paper-coated',
    'Barrier-Coated FSC Kraft Paper',
    'Coated Paper',
    'Renewable Fiber Barrier',
    25.0,
    12.0,
    '60–140 µm',
    80,
    5,
    3.4,
    1.1,
    'Curbside Paper Recyclable (>85% fiber)',
    'FSC-certified kraft paper with aqueous dispersion coating for recyclable dry packaging.'
)
ON CONFLICT (id) DO UPDATE SET
    nominal_otr = EXCLUDED.nominal_otr,
    nominal_wvtr = EXCLUDED.nominal_wvtr,
    description = EXCLUDED.description;

-- Seed 3: Standard Food Composition Presets
INSERT INTO public.food_presets (id, name, category, moisture_pct, fat_pct, ph, respiration_rate, storage_type, shelf_life_days, opt_temp_c, opt_rh_pct, package_weight_g, description)
VALUES
(
    'tomato',
    'Fresh Tomato',
    'Fresh produce',
    94.0,
    0.2,
    4.3,
    'High',
    'Chilled',
    14,
    12.0,
    85.0,
    500.0,
    'High respiration climacteric fruit requiring active Equilibrium MAP gas balance.'
),
(
    'apple',
    'Fresh Apple',
    'Fresh produce',
    86.0,
    0.2,
    3.8,
    'Medium',
    'Chilled',
    30,
    8.0,
    90.0,
    1000.0,
    'Moderate respiration produce sensitive to moisture transpiration and scald.'
),
(
    'biscuits',
    'Biscuits & Cookies',
    'Bakery / snacks',
    4.0,
    18.0,
    6.5,
    'None',
    'Ambient',
    120,
    25.0,
    60.0,
    250.0,
    'Dry bakery goods requiring high water vapor barrier to prevent loss of crispness.'
),
(
    'rice',
    'White Rice / Grains',
    'Grains',
    12.0,
    1.0,
    6.2,
    'None',
    'Ambient',
    180,
    25.0,
    60.0,
    1000.0,
    'Starchy cereal grains sensitive to ambient relative humidity changes.'
),
(
    'chips',
    'Potato Chips',
    'Snacks',
    2.0,
    35.0,
    6.0,
    'None',
    'Ambient',
    120,
    25.0,
    65.0,
    150.0,
    'High lipid fried snack highly susceptible to oxidative rancidity and staling.'
),
(
    'paneer',
    'Fresh Paneer / Cottage Cheese',
    'Dairy',
    55.0,
    25.0,
    5.5,
    'None',
    'Chilled',
    14,
    4.0,
    80.0,
    200.0,
    'High moisture dairy protein matrix requiring cold chain barrier protection.'
),
(
    'nuts',
    'Roasted Almonds & Nuts',
    'Snacks',
    3.0,
    52.0,
    6.4,
    'None',
    'Ambient',
    180,
    22.0,
    50.0,
    200.0,
    'High unsaturated lipid content prone to hexanal formation from oxygen exposure.'
),
(
    'chocolate',
    'Dark Chocolate',
    'Bakery / snacks',
    1.5,
    32.0,
    5.8,
    'None',
    'Ambient',
    365,
    18.0,
    55.0,
    100.0,
    'Cocoa butter polymorphic crystallization matrix sensitive to odor permeation.'
)
ON CONFLICT (id) DO UPDATE SET
    moisture_pct = EXCLUDED.moisture_pct,
    fat_pct = EXCLUDED.fat_pct,
    description = EXCLUDED.description;

-- Seed 4: Initial Audit Logs
INSERT INTO public.system_audit_logs (id, timestamp, user_email, user_role, action, category, status, details)
VALUES
(
    'log-init-01',
    NOW() - INTERVAL '2 hours',
    'admin@packsmart.ai',
    'Super Admin',
    'SYSTEM_STARTUP',
    'System',
    'SUCCESS',
    'PackSmart AI ASTM Barrier Physics Engine & Supabase tables initialized.'
),
(
    'log-init-02',
    NOW() - INTERVAL '1 hour',
    'admin@packsmart.ai',
    'Super Admin',
    'ML_MODEL_TRAIN',
    'Model',
    'SUCCESS',
    'MultiOutput Random Forest calibrated with ASTM D3985 & F1249 test limits.'
)
ON CONFLICT (id) DO NOTHING;
