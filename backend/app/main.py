"""
PackSmart AI — FastAPI Machine Learning Backend.
Exposes REST endpoints for real-time food packaging suitability prediction,
real OTR and WVTR calculations, multi-objective optimization, and simulation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List

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
    LoginResponse,
    UserProfile,
    UserManagementUpdate,
    SystemLogEntry
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
    list_all_users,
    update_user_role,
    get_system_audit_logs,
    ROLE_CONFIG,
    log_event
)

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
        metrics = ml_pipeline.train(n_samples=1500)
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


from .supabase_client import is_supabase_configured
import os

@app.get("/health")
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
def get_recommendation(user_input: FoodInput):
    """
    Complete ML pipeline endpoint:
    User Input -> Preprocessing -> ML Model -> Suitability -> Optimization -> Recommendation
    """
    try:
        response = generate_recommendation_pipeline(user_input)
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


@app.get("/api/materials")
def list_materials():
    """Returns all available packaging materials with technical ASTM specifications."""
    return list(PACKAGING_MATERIALS.values())


@app.get("/api/foods")
def list_foods():
    """Returns reference food catalog."""
    from .data.food_dataset import generate_training_dataset
    # Standard food presets
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
def retrain_model(samples: int = 1500):
    """Trigger retraining of the Scikit-learn model."""
    try:
        metrics = ml_pipeline.train(n_samples=samples)
        return {"status": "retrained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")


# ============================================================================
# Role-Based Access Control (RBAC) & Authentication Endpoints
# ============================================================================

@app.post("/api/auth/login", response_model=LoginResponse)
def login_endpoint(payload: UserLoginRequest):
    """
    Authenticates user and returns role, access tier, and granular permissions.
    """
    try:
        return authenticate_user(
            email=payload.email,
            password=payload.password,
            requested_role=payload.requested_role
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")


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
def get_users_list():
    """Returns all registered users (Super Admin & System Manager access)."""
    return list_all_users()


@app.post("/api/admin/users/update", response_model=UserProfile)
def update_user_endpoint(update: UserManagementUpdate):
    """Updates user role or status (Super Admin access)."""
    res = update_user_role(update)
    if not res:
        raise HTTPException(status_code=404, detail="User not found")
    return res


@app.get("/api/admin/logs", response_model=List[SystemLogEntry])
def get_audit_logs_endpoint():
    """Returns system activity audit logs (Super Admin access)."""
    return get_system_audit_logs()

