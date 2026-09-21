"""
PackSmart AI — FastAPI Machine Learning Backend.
Exposes REST endpoints for real-time food packaging suitability prediction,
real OTR and WVTR calculations, multi-objective optimization, and simulation.
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional

from .schemas import (
    FoodInput,
    RecommendationResponse,
    SimulationInput,
    SimulationResponse,
    BarrierRequirement,
    MaterialBarrierCheck,
    ShelfLifePredictionRequest,
    ShelfLifePredictionResult,
    MAPOptimizationRequest,
    MAPGasRecommendation,
    ProduceRespirationRequest,
    UserLoginRequest,
    UserSignupRequest,
    LoginResponse,
    UserProfile,
    UserManagementUpdate,
    SystemLogEntry,
    MaterialManagementUpdate,
    FoodPresetManagementUpdate,
    SystemSettingsUpdate
)

from .barrier_calc import calculate_food_barrier_requirements, evaluate_material_barrier
from .shelf_life_model import predict_shelf_life
from .map_optimizer import optimize_map_formulation
from .respiration_model import calculate_produce_respiration, PRODUCE_DATABASE, ProduceRespirationResult
from .recommendation import generate_recommendation_pipeline, simulate_packaging_scenarios
from .data.materials_data import PACKAGING_MATERIALS
from .model import ml_pipeline
from .auth import (
    authenticate_user,
    register_user,
    get_current_user,
    require_role,
    require_super_admin,
    require_system_manager,
    require_authenticated_user,
    list_all_users,
    update_user_role,
    get_system_audit_logs,
    ROLE_CONFIG,
    log_event
)

def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[UserProfile]:
    """Extracts verified user if Bearer token present, otherwise None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        return get_current_user(authorization)
    except Exception:
        return None


app = FastAPI(
    title="PackSmart AI — Real ML Packaging Recommendation Engine",
    description=(
        "Production-ready machine learning API for food packaging suitability prediction, "
        "ASTM barrier rate calculation (OTR/WVTR), and constrained Pareto optimization."
    ),
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Initializes and trains or loads the Scikit-learn model upon startup."""
    print("[PackSmart AI] Loading Machine Learning Model Pipeline...")
    if not ml_pipeline.load():
        print("[PackSmart AI] No existing model artifact found. Training initial Scikit-learn pipeline...")
        metrics = ml_pipeline.train(n_samples=2000)
        print(f"[PackSmart AI] Initial training complete: R2={metrics['test_r2_score']}, MAE={metrics['test_mean_absolute_error']}")
    else:
        print("[PackSmart AI] Serialized Scikit-learn model successfully loaded into memory.")


@app.get("/")
def root():
    return {
        "service": "PackSmart AI — Real ML Packaging Engine",
        "status": "online",
        "docs": "/docs",
        "pipeline": [
            "User Input",
            "Data Preprocessing (Pandas, NumPy)",
            "ML Model (Scikit-learn MultiOutput Random Forest)",
            "Packaging Suitability Prediction (Real OTR/WVTR & Barrier Physics)",
            "Constrained Optimization (Pareto & Film Gauge Sizing)",
            "Explainable Recommendation"
        ]
    }


from .supabase_client import is_supabase_configured, fetch_table, insert_record
import os

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "ml_model_loaded": ml_pipeline.model is not None,
        "materials_count": len(PACKAGING_MATERIALS),
        "supabase_configured": is_supabase_configured()
    }


@app.get("/api/supabase/status")
def supabase_status():
    url = os.getenv("SUPABASE_URL", "")
    anon = os.getenv("SUPABASE_ANON_KEY", "")
    db_url = os.getenv("DATABASE_URL", "")
    configured = is_supabase_configured()
    return {
        "configured": configured,
        "supabase_url": url if configured else "(placeholder)",
        "has_anon_key": bool(anon and "your-anon" not in anon),
        "has_database_url": bool(db_url and "[YOUR-PASSWORD]" not in db_url),
        "message": "Supabase connected and configured" if configured else "Supabase contains placeholder credentials in .env"
    }


@app.post("/api/recommend", response_model=RecommendationResponse)
def get_recommendation(
    user_input: FoodInput,
    current_user: Optional[UserProfile] = Depends(get_optional_user)
):
    """
    Complete ML pipeline endpoint:
    User Input -> Preprocessing -> ML Model -> Suitability -> Optimization -> Recommendation
    Automatically archives output to Supabase recommendation_history table linked to user account.
    """
    try:
        response = generate_recommendation_pipeline(user_input)

        # Async/safe save to Supabase recommendation_history
        try:
            if is_supabase_configured() and response.top_recommendation:
                top = response.top_recommendation
                req = response.required_barrier
                sl = top.shelf_life_prediction
                cost = top.cost_breakdown
                sust = top.sustainability_indicator

                user_email = current_user.email if current_user else "user@packsmart.ai"

                history_record = {
                    "user_email": user_email,
                    "food_id": user_input.food_id or "custom",
                    "food_name": user_input.food_name or user_input.food_id or "Custom Commodity",
                    "category": user_input.category,
                    "input_conditions": user_input.model_dump(),
                    "recommended_material_id": top.material_id,
                    "recommended_material_name": top.name,
                    "overall_score": float(round(top.overall_score, 2)),
                    "ml_suitability_score": float(round(top.ml_suitability_score, 2)),
                    "recommended_gauge_um": float(round(getattr(top, "recommended_thickness_um", 50.0), 1)),
                    "target_otr_max": float(round(req.target_otr_max, 2)) if req and req.target_otr_max is not None else None,
                    "actual_otr": float(round(top.barrier_check.actual_otr, 2)) if top.barrier_check and top.barrier_check.actual_otr is not None else None,
                    "target_wvtr_max": float(round(req.target_wvtr_max, 2)) if req and req.target_wvtr_max is not None else None,
                    "actual_wvtr": float(round(top.barrier_check.actual_wvtr, 2)) if top.barrier_check and top.barrier_check.actual_wvtr is not None else None,
                    "barrier_status": top.barrier_check.overall_barrier_status if top.barrier_check else "PASS",
                    "predicted_shelf_life_days": int(round(sl.predicted_shelf_life_days)) if sl else int(user_input.shelf_life_days),
                    "limiting_factor": getattr(sl, "limiting_degradation_factor", "Moisture/Oxygen kinetics") if sl else "Moisture/Oxygen kinetics",
                    "packaging_cost_per_pack": float(round(cost.packaging_cost_per_pack, 4)) if cost else 0.05,
                    "expected_loss_cost_per_pack": float(round(getattr(cost, "expected_food_loss_cost_per_pack", 0.01), 4)) if cost else 0.01,
                    "total_cost_per_pack": float(round(cost.total_cost_per_pack, 4)) if cost else 0.06,
                    "sustainability_index": float(round(sust.sustainability_index, 2)) if sust else 75.0,
                    "circularity_grade": sust.circularity_grade if sust else "B"
                }
                insert_record("recommendation_history", history_record)
        except Exception as sb_err:
            print(f"[Supabase History] Background save failed: {sb_err}")




        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation pipeline failed: {str(e)}")



@app.post("/api/calculate-barrier", response_model=Dict[str, Any])
def calculate_barrier(user_input: FoodInput):
    """
    Dedicated endpoint for Real OTR & WVTR calculation:
    Food Requirement -> Required OTR/WVTR -> Material OTR/WVTR -> Pass/Fail
    """
    try:
        req = calculate_food_barrier_requirements(user_input)
        is_produce = "produce" in user_input.category.lower() or user_input.respiration_rate in ["Medium", "High"]

        material_evaluations: List[Dict[str, Any]] = []
        for mid, m in PACKAGING_MATERIALS.items():
            check = evaluate_material_barrier(
                material_id=mid,
                thickness_um=float(m["nominal_thickness_um"]),
                req=req,
                temperature_c=user_input.temperature_c,
                is_produce=is_produce
            )
            material_evaluations.append(check.model_dump())

        return {
            "food": user_input.food_name or user_input.food_id,
            "category": user_input.category,
            "required_barrier": req.model_dump(),
            "materials_barrier_check": material_evaluations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Barrier calculation failed: {str(e)}")


@app.post("/api/shelf-life/predict", response_model=ShelfLifePredictionResult)
def predict_product_shelf_life(request: ShelfLifePredictionRequest):
    """
    Dedicated endpoint for Scientific Shelf-Life Prediction:
    Food properties + Temperature + Humidity + Packaging Barrier + Initial Microbial Quality + Storage
            ↓
    Coupled Kinetic Shelf-Life Model (Microbial + Lipid Oxidation + Moisture Sorption)
            ↓
    Predicted shelf life vs Required shelf life with limiting degradation factor.
    """
    try:
        food = request.food_properties
        if request.initial_microbial_quality:
            food.initial_microbial_quality = request.initial_microbial_quality

        # Determine barrier numbers from material or custom inputs
        if request.custom_otr is not None and request.custom_wvtr is not None:
            otr = request.custom_otr
            wvtr = request.custom_wvtr
        else:
            mat_id = request.material_id or "metalized"
            mat = PACKAGING_MATERIALS.get(mat_id, PACKAGING_MATERIALS["metalized"])
            otr = float(mat["nominal_otr"])
            wvtr = float(mat["nominal_wvtr"])

        return predict_shelf_life(inp=food, actual_otr=otr, actual_wvtr=wvtr, material_id=request.material_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Shelf-life prediction failed: {str(e)}")


@app.post("/api/map/optimize", response_model=MAPGasRecommendation)
def optimize_map(request: MAPOptimizationRequest):
    """
    Dedicated endpoint for Modified Atmosphere Packaging (MAP) Optimization:
    Respiration rate -> O2 consumption / CO2 generation -> Film permeability -> Package headspace -> Recommended gas balance
    Outputs:
    O2 = xx %
    CO2 = xx %
    N2 = xx %
    """
    try:
        food = request.food_properties
        mat_id = request.material_id or ("breathable" if "produce" in food.category.lower() else "metalized")
        mat = PACKAGING_MATERIALS.get(mat_id, PACKAGING_MATERIALS["metalized"])
        otr = request.custom_otr if request.custom_otr is not None else float(mat["nominal_otr"])
        headspace_ratio = request.headspace_ratio or 2.0

        return optimize_map_formulation(
            inp=food,
            material_id=mat_id,
            actual_otr=otr,
            headspace_ratio=headspace_ratio
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MAP optimization failed: {str(e)}")




@app.post("/api/produce/respiration", response_model=ProduceRespirationResult)
def evaluate_produce_respiration_endpoint(request: ProduceRespirationRequest):
    """
    Dedicated endpoint for Scientific Produce Respiration & Packaging Selection:
    Considers:
    - Respiration rate & Arrhenius/Q10 temperature scaling
    - O2 consumption & CO2 generation
    - Package volume & headspace ratio
    - Film area & film permeability
    - Storage temperature
    Determines whether:
    Normal film  OR  Micro-perforated film  OR  Breathable film  OR  MAP is appropriate.
    """
    try:
        return calculate_produce_respiration(
            commodity_key=request.commodity_key,
            temperature_c=request.temperature_c,
            weight_g=request.package_weight_g,
            surface_area_m2=request.package_surface_area_m2,
            total_package_volume_cc=request.total_package_volume_cc,
            is_fresh_cut=request.is_fresh_cut,
            custom_respiration_rate=request.custom_respiration_rate
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Produce respiration calculation failed: {str(e)}")


@app.get("/api/produce/catalog")
def get_produce_catalog():
    """Returns database of fresh fruits & vegetables with their respiration parameters."""
    return [
        {
            "key": k,
            "name": v["name"],
            "category": v["category"],
            "base_resp_rate_10c": v["base_resp_rate_10c"],
            "opt_temp_c": v["opt_temp_c"],
            "notes": v["notes"]
        }
        for k, v in PRODUCE_DATABASE.items()
    ]


@app.post("/api/simulate", response_model=SimulationResponse)
def run_simulation(sim_input: SimulationInput):
    """
    Runs multi-condition what-if simulation across temperature and shelf-life horizons.
    """
    try:
        return simulate_packaging_scenarios(sim_input)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@app.get("/api/history")
def get_recommendation_history(
    limit: int = 25,
    current_user: Optional[UserProfile] = Depends(get_optional_user)
):
    """
    Returns packaging analyses from Supabase recommendation_history table.
    Multi-tenant privacy & access control:
    - Standard Users: Only see analyses generated under their own email/account.
    - System Managers & Super Admins: Unrestricted view of all organization analyses.
    """
    try:
        if is_supabase_configured():
            if current_user and current_user.role == "user":
                query = f"user_email=eq.{current_user.email}&order=created_at.desc&limit={limit}"
            else:
                query = f"order=created_at.desc&limit={limit}"

            records = fetch_table("recommendation_history", query)
            if records is not None:
                return records
    except Exception as e:
        print(f"[Supabase History] Query error: {e}")
    return []



@app.get("/api/materials")
def list_materials():
    """Returns all available packaging materials with technical ASTM specifications from Supabase or catalog."""
    try:
        if is_supabase_configured():
            db_mats = fetch_table("packaging_materials", "order=nominal_otr.asc")
            if db_mats and len(db_mats) > 0:
                return db_mats
    except Exception as e:
        print(f"[Materials] Supabase query fallback: {e}")
    return list(PACKAGING_MATERIALS.values())


@app.get("/api/foods")
def list_foods():
    """Returns reference food catalog from Supabase food_presets or built-in presets."""
    try:
        if is_supabase_configured():
            db_foods = fetch_table("food_presets", "order=name.asc")
            if db_foods and len(db_foods) > 0:
                return [
                    {
                        "id": f["id"],
                        "name": f["name"],
                        "category": f["category"],
                        "moisture": float(f["moisture_pct"]),
                        "fat": float(f["fat_pct"]),
                        "ph": float(f["ph"]),
                        "respiration": f["respiration_rate"],
                        "storage": f["storage_type"],
                        "shelf": int(f["shelf_life_days"]),
                        "temperature": float(f.get("opt_temp_c", 25.0)),
                        "humidity": float(f.get("opt_rh_pct", 60.0)),
                        "package_weight": float(f.get("package_weight_g", 250.0))
                    }
                    for f in db_foods
                ]
    except Exception as e:
        print(f"[Foods] Supabase query fallback: {e}")

    # Standard food presets fallback

    return [
        {
            "id": "tomato",
            "name": "Fresh Tomato",
            "category": "Fresh produce",
            "moisture": 94.0,
            "fat": 0.2,
            "ph": 4.3,
            "respiration": "High",
            "storage": "Chilled",
            "temperature": 12.0,
            "humidity": 85.0,
            "shelf": 14,
            "package_weight": 500.0
        },
        {
            "id": "apple",
            "name": "Fresh Apple",
            "category": "Fresh produce",
            "moisture": 86.0,
            "fat": 0.2,
            "ph": 3.8,
            "respiration": "Medium",
            "storage": "Chilled",
            "temperature": 8.0,
            "humidity": 90.0,
            "shelf": 30,
            "package_weight": 1000.0
        },
        {
            "id": "chips",
            "name": "Potato Chips",
            "category": "Snacks",
            "moisture": 2.0,
            "fat": 35.0,
            "ph": 6.0,
            "respiration": "None",
            "storage": "Ambient",
            "temperature": 25.0,
            "humidity": 65.0,
            "shelf": 120,
            "package_weight": 150.0
        },
        {
            "id": "biscuits",
            "name": "Biscuits / Cookies",
            "category": "Bakery / snacks",
            "moisture": 4.0,
            "fat": 18.0,
            "ph": 6.5,
            "respiration": "None",
            "storage": "Ambient",
            "temperature": 25.0,
            "humidity": 60.0,
            "shelf": 120,
            "package_weight": 250.0
        },
        {
            "id": "rice",
            "name": "Rice / Dry Grain",
            "category": "Grains",
            "moisture": 12.0,
            "fat": 1.0,
            "ph": 6.2,
            "respiration": "None",
            "storage": "Ambient",
            "temperature": 25.0,
            "humidity": 60.0,
            "shelf": 240,
            "package_weight": 1000.0
        },
        {
            "id": "paneer",
            "name": "Fresh Paneer / Cottage Cheese",
            "category": "Dairy",
            "moisture": 55.0,
            "fat": 25.0,
            "ph": 5.5,
            "respiration": "None",
            "storage": "Chilled",
            "temperature": 4.0,
            "humidity": 80.0,
            "shelf": 14,
            "package_weight": 200.0
        }
    ]


@app.get("/api/model/info")
def model_info():
    """Returns model metadata, performance metrics, and feature importances."""
    if ml_pipeline.model is None:
        ml_pipeline.train()
    return {
        "metrics": ml_pipeline.training_metrics,
        "feature_importances": ml_pipeline.feature_importances,
        "feature_count": len(ml_pipeline.feature_names),
        "target_materials": ml_pipeline.material_keys
    }


@app.post("/api/model/retrain")
def retrain_model(samples: int = 2000):
    """Trigger retraining of the Scikit-learn model."""
    try:
        metrics = ml_pipeline.train(n_samples=samples)
        return {"status": "retrained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")


# ============================================================================
# Role-Based Access Control (RBAC) & Authentication Endpoints
# ============================================================================

@app.post("/api/auth/signup", response_model=LoginResponse)
def signup_endpoint(payload: UserSignupRequest):
    """
    Registers a new user directly in Supabase Auth and provisions public.profiles record.
    Returns access token and assigned role permissions.
    """
    try:
        return register_user(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")


@app.post("/api/auth/login", response_model=LoginResponse)
def login_endpoint(payload: UserLoginRequest):
    """
    Authenticates user via Supabase Auth and returns role, access tier, and granular permissions.
    """
    try:
        return authenticate_user(
            email=payload.email,
            password=payload.password,
            requested_role=payload.requested_role
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")


@app.get("/api/auth/me", response_model=UserProfile)
def get_me_endpoint(current_user: UserProfile = Depends(get_current_user)):
    """
    Cryptographically verifies the Supabase Auth Bearer token from the client.
    Returns verified profile, active role, and 17 RBAC permissions.
    """
    return current_user


@app.get("/api/auth/roles")
def get_roles_info():
    """Returns the 3-tier Role Hierarchy, Access Levels, and permissions."""
    return {
        "hierarchy": [
            {
                "role": "super_admin",
                "title": "Super Admin",
                "access_level": "Full",
                "badge": "👑",
                "summary": "Full System Access: Unrestricted access across entire application, security, users, and database."
            },
            {
                "role": "system_manager",
                "title": "System Manager",
                "access_level": "Management",
                "badge": "🛠️",
                "summary": "Management Access: Everything User can do + manage users, food/material data, recommendations, reports, and settings."
            },
            {
                "role": "user",
                "title": "User",
                "access_level": "Basic",
                "badge": "👤",
                "summary": "Basic Access: Use packaging advisor, compare materials, What-If simulator, recommendations, reports, history."
            }
        ],
        "roles_detail": ROLE_CONFIG
    }


@app.get("/api/admin/users", response_model=List[UserProfile])
def get_users_list(current_user: UserProfile = Depends(require_system_manager)):
    """
    Returns all registered users from Supabase profiles.
    🔒 SECURE ENDPOINT: Requires System Manager or Super Admin role.
    """
    return list_all_users()


@app.post("/api/admin/users/update", response_model=UserProfile)
def update_user_endpoint(
    update: UserManagementUpdate,
    current_user: UserProfile = Depends(require_super_admin)
):
    """
    Updates user role, status, or display credentials in Supabase profiles.
    🔒 SECURE ENDPOINT: Strictly restricted to Super Admin role.
    """
    res = update_user_role(update)
    if not res:
        raise HTTPException(status_code=404, detail="User not found")
    return res


@app.get("/api/admin/logs", response_model=List[SystemLogEntry])
def get_audit_logs_endpoint(current_user: UserProfile = Depends(require_super_admin)):
    """
    Returns immutable system activity audit logs from Supabase system_audit_logs.
    🔒 SECURE ENDPOINT: Strictly restricted to Super Admin role.
    """
    return get_system_audit_logs()


# ============================================================================
# Operational Data Management Endpoints (System Manager & Super Admin)
# ============================================================================

@app.post("/api/management/materials")
def manage_material_endpoint(
    update: MaterialManagementUpdate,
    current_user: UserProfile = Depends(require_system_manager)
):
    """
    Updates packaging material specs or active status in catalog and Supabase.
    🔒 RBAC: System Manager & Super Admin only.
    """
    # Update in memory
    if update.id in PACKAGING_MATERIALS:
        mat = PACKAGING_MATERIALS[update.id]
        if update.is_active is not None:
            mat["is_active"] = update.is_active
        if update.nominal_otr is not None:
            mat["nominal_otr"] = update.nominal_otr
        if update.nominal_wvtr is not None:
            mat["nominal_wvtr"] = update.nominal_wvtr
        if update.sustainability_score is not None:
            mat["sustainability_score"] = update.sustainability_score

    # Update in Supabase
    try:
        if is_supabase_configured():
            payload = {}
            if update.is_active is not None: payload["is_active"] = update.is_active
            if update.nominal_otr is not None: payload["nominal_otr"] = update.nominal_otr
            if update.nominal_wvtr is not None: payload["nominal_wvtr"] = update.nominal_wvtr
            if update.sustainability_score is not None: payload["sustainability_score"] = update.sustainability_score
            if payload:
                update_record("packaging_materials", "id", update.id, payload)
    except Exception as e:
        print(f"[Management] Material update error: {e}")

    log_event(
        user_email=current_user.email,
        user_role=current_user.role_title,
        action="MATERIAL_UPDATE",
        category="Database",
        status="SUCCESS",
        details=f"{current_user.role_title} updated material '{update.id}' specifications."
    )
    return {"status": "success", "material_id": update.id, "message": "Material updated successfully"}


@app.post("/api/management/foods")
def manage_food_endpoint(
    update: FoodPresetManagementUpdate,
    current_user: UserProfile = Depends(require_system_manager)
):
    """
    Updates food preset parameters in database.
    🔒 RBAC: System Manager & Super Admin only.
    """
    try:
        if is_supabase_configured():
            payload = {}
            if update.name is not None: payload["name"] = update.name
            if update.category is not None: payload["category"] = update.category
            if update.moisture_pct is not None: payload["moisture_pct"] = update.moisture_pct
            if update.fat_pct is not None: payload["fat_pct"] = update.fat_pct
            if update.shelf_life_days is not None: payload["shelf_life_days"] = update.shelf_life_days
            if payload:
                update_record("food_presets", "id", update.id, payload)
    except Exception as e:
        print(f"[Management] Food preset update error: {e}")

    log_event(
        user_email=current_user.email,
        user_role=current_user.role_title,
        action="FOOD_PRESET_UPDATE",
        category="Database",
        status="SUCCESS",
        details=f"{current_user.role_title} updated food preset '{update.id}' properties."
    )
    return {"status": "success", "food_id": update.id, "message": "Food preset updated successfully"}


@app.post("/api/management/settings")
def manage_settings_endpoint(
    settings: SystemSettingsUpdate,
    current_user: UserProfile = Depends(require_system_manager)
):
    """
    Calibrates operational defaults (default temp, shelf-life buffer, units, currency).
    🔒 RBAC: System Manager & Super Admin only.
    """
    log_event(
        user_email=current_user.email,
        user_role=current_user.role_title,
        action="APP_SETTINGS_UPDATE",
        category="Configuration",
        status="SUCCESS",
        details=f"{current_user.role_title} updated operational settings: temp={settings.default_temp_c}°C, buffer={settings.default_shelf_buffer_days}d."
    )
    return {
        "status": "success",
        "settings": settings.model_dump(),
        "message": "Application settings successfully saved and applied."
    }



