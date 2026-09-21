"""
Pydantic Schemas for PackSmart AI ML Backend.
Defines input payloads, food properties, barrier requirements, and recommendation outputs.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class FoodInput(BaseModel):
    food_id: Optional[str] = Field("biscuits", description="Identifier of preset food or 'custom'")
    food_name: Optional[str] = Field("Biscuits", description="Name of the food commodity")
    category: str = Field("Bakery / snacks", description="Food category (Fresh produce, Bakery / snacks, Snacks, Grains, Dairy, Meat/Poultry, Powders)")
    moisture_pct: float = Field(4.0, ge=0.1, le=99.0, description="Moisture content in weight %")
    fat_pct: float = Field(18.0, ge=0.0, le=100.0, description="Fat / oil content in weight %")
    ph: float = Field(6.5, ge=1.0, le=14.0, description="Acidity level (pH)")
    respiration_rate: str = Field("Low", description="'None', 'Low', 'Medium', or 'High'")
    storage_type: str = Field("Ambient", description="'Ambient', 'Chilled', or 'Frozen'")
    temperature_c: float = Field(25.0, ge=-25.0, le=60.0, description="Storage temperature in Celsius")
    humidity_pct: float = Field(60.0, ge=5.0, le=100.0, description="Storage relative humidity %")
    shelf_life_days: int = Field(120, ge=1, le=1000, description="Target shelf life in days")
    package_weight_g: float = Field(250.0, ge=10.0, le=50000.0, description="Net weight of packaged food in grams")
    package_surface_area_m2: Optional[float] = Field(0.08, ge=0.005, le=5.0, description="Surface area of the packaging pouch in m2")
    transport_mode: str = Field("Normal", description="'Normal', 'Long distance', 'Refrigerated', or 'High humidity'")
    budget_level: str = Field("Medium", description="'Low', 'Medium', or 'High'")
    initial_microbial_quality: str = Field("Standard (<10³ CFU/g)", description="'High Hygiene (<10² CFU/g)', 'Standard (<10³ CFU/g)', or 'Elevated Load (>10⁴ CFU/g)'")
    protection_priority: float = Field(85.0, ge=0.0, le=100.0, description="Protection importance weight (0-100)")
    sustainability_priority: float = Field(70.0, ge=0.0, le=100.0, description="Sustainability importance weight (0-100)")
    cost_priority: float = Field(60.0, ge=0.0, le=100.0, description="Cost economy importance weight (0-100)")
    advanced_mode: bool = Field(True, description="Whether expert measured values are provided")


class BarrierRequirement(BaseModel):
    target_otr_max: float = Field(..., description="Maximum allowable OTR in cc/(m²·day·atm)")
    target_wvtr_max: float = Field(..., description="Maximum allowable WVTR in g/(m²·day)")
    target_otr_min: Optional[float] = Field(None, description="Minimum OTR required for respiring produce to avoid anaerobiosis")
    critical_oxygen_uptake_cc: float = Field(..., description="Total allowable oxygen absorption in cc")
    critical_moisture_gain_g: float = Field(..., description="Total allowable moisture change in grams")
    equilibrium_rh_pct: float = Field(..., description="Estimated equilibrium relative humidity of the food %")
    driving_rh_delta_pct: float = Field(..., description="Driving relative humidity differential %")
    respiration_oxygen_demand_cc_day: Optional[float] = Field(None, description="Oxygen demand for respiration in cc/day")
    barrier_rationale: str = Field(..., description="Scientific rationale for the calculated barrier limits")


class MaterialBarrierCheck(BaseModel):
    material_id: str
    material_name: str
    category: str
    nominal_thickness_um: float
    effective_thickness_um: float
    actual_otr: float = Field(..., description="Calculated OTR at storage conditions and thickness in cc/(m²·day·atm)")
    actual_wvtr: float = Field(..., description="Calculated WVTR at storage conditions and thickness in g/(m²·day)")
    otr_status: str = Field(..., description="'PASS', 'FAIL', or 'MARGINAL'")
    wvtr_status: str = Field(..., description="'PASS', 'FAIL', or 'MARGINAL'")
    overall_barrier_status: str = Field(..., description="'PASS' or 'FAIL'")
    otr_margin_pct: float = Field(..., description="Safety margin for oxygen: positive means well within limit")
    wvtr_margin_pct: float = Field(..., description="Safety margin for moisture: positive means well within limit")
    barrier_notes: str


class MLSuitabilityScore(BaseModel):
    material_id: str
    ml_suitability_probability: float = Field(..., ge=0.0, le=1.0, description="Machine learning model predicted probability (0-1)")
    ml_confidence_pct: float = Field(..., ge=0.0, le=100.0)
    top_driving_features: List[Dict[str, Any]] = Field(default_factory=list)


class ShelfLifePredictionResult(BaseModel):
    required_shelf_life_days: int = Field(..., description="Required shelf-life target in days")
    predicted_shelf_life_days: int = Field(..., description="Calculated shelf-life under limiting degradation kinetics")
    target_achievable: bool = Field(..., description="True if predicted shelf-life meets or exceeds required target")
    status_label: str = Field(..., description="e.g. '✓ Target achievable' or '⚠ Target not met'")
    limiting_degradation_factor: str = Field(..., description="Key failure mechanism (Lipid Oxidation, Moisture Sorption, Microbial, Senescence)")
    safety_margin_days: int = Field(..., description="Days buffer (predicted - required)")
    microbial_spoilage_days: int = Field(..., description="Estimated days until microbial CFU threshold is reached")
    lipid_oxidation_days: int = Field(..., description="Estimated days until lipid peroxide / rancidity threshold is reached")
    moisture_staling_days: int = Field(..., description="Estimated days until moisture gain/loss limit is reached")
    confidence_interval_days: List[int] = Field(default_factory=list, description="95% confidence interval [min_days, max_days]")
    scientific_validation_disclaimer: str = Field(..., description="Scientific disclaimer on experimental laboratory validation status")


class MAPGasRecommendation(BaseModel):
    initial_flush_o2_pct: float = Field(..., description="Initial flushed gas composition O2 %")
    initial_flush_co2_pct: float = Field(..., description="Initial flushed gas composition CO2 %")
    initial_flush_n2_pct: float = Field(..., description="Initial flushed gas composition N2 %")
    equilibrium_headspace_o2_pct: float = Field(..., description="Steady-state equilibrium headspace O2 %")
    equilibrium_headspace_co2_pct: float = Field(..., description="Steady-state equilibrium headspace CO2 %")
    equilibrium_headspace_n2_pct: float = Field(..., description="Steady-state equilibrium headspace N2 %")
    gas_headspace_ratio: float = Field(..., description="Recommended headspace gas to food volume ratio (e.g. 2.0:1)")
    headspace_volume_cc: float = Field(..., description="Recommended package headspace volume in cc")
    o2_consumption_cc_day: Optional[float] = Field(None, description="Produce O2 consumption rate at storage temp in cc/day")
    co2_generation_cc_day: Optional[float] = Field(None, description="Produce CO2 generation rate in cc/day")
    respiratory_quotient: Optional[float] = Field(None, description="CO2 produced per O2 consumed (RQ)")
    gas_mixture_label: str = Field(..., description="Human-readable formulation label, e.g. 'O₂: 3.5% | CO₂: 5.0% | N₂: 91.5%'")
    preservation_mechanism: str = Field(..., description="Chemical & biological rationale for gas formulation")
    package_collapse_risk: str = Field(..., description="Risk of volume contraction due to CO2 dissolution")


class CostBreakdown(BaseModel):
    raw_material_cost_per_pack: float = Field(..., description="Raw polymer/resin material cost ($/pack)")
    film_thickness_um: float = Field(..., description="Optimized gauge thickness (µm)")
    packaging_surface_area_m2: float = Field(..., description="Film surface area (m²)")
    production_conversion_cost_per_pack: float = Field(..., description="Slitting, lamination, printing, perforation conversion cost ($/pack)")
    transportation_cost_per_pack: float = Field(..., description="Freight and cold chain transport cost ($/pack)")
    packaging_cost_per_pack: float = Field(..., description="Sum of material + production + transport ($/pack)")
    food_value_per_pack: float = Field(..., description="Wholesale/retail commercial value of packaged food ($)")
    spoilage_risk_pct: float = Field(..., description="Predicted spoilage/loss probability based on barrier and shelf-life (%)")
    expected_food_loss_cost_per_pack: float = Field(..., description="Expected food loss cost: Spoilage Risk % * Food Value ($/pack)")
    total_cost_per_pack: float = Field(..., description="Total Cost = Packaging Cost + Expected Loss Cost ($/pack)")
    total_cost_per_1000_packs: float = Field(..., description="Economic cost for commercial production run of 1,000 packs ($)")
    cost_formula_label: str = Field(..., description="Human-readable formula string showing packaging + loss = total")


class SustainabilityIndicator(BaseModel):
    material_weight_g_per_pack: float = Field(..., description="Mass of packaging film per pack in grams")
    packaging_to_product_ratio_pct: float = Field(..., description="Packaging tare weight / Food net weight ratio (%)")
    recyclability_score_pct: float = Field(..., description="Circularity rating (0-100%) based on recycling infrastructure")
    recycled_content_pct: float = Field(..., description="Post-consumer recycled (PCR) content (%)")
    renewable_content_pct: float = Field(..., description="Bio-based / renewable feedstock content (%)")
    embodied_carbon_g_co2_per_pack: float = Field(..., description="Cradle-to-gate carbon footprint of packaging film (g CO₂e/pack)")
    avoided_food_waste_carbon_g_co2: float = Field(..., description="Upstream agricultural LCA carbon emissions saved by preventing spoilage (g CO₂e/pack)")
    net_carbon_impact_g_co2_per_pack: float = Field(..., description="Net Carbon = Embodied Carbon - Avoided Food Waste Credit (g CO₂e/pack)")
    end_of_life_pathway: str = Field(..., description="Primary circular end-of-life stream")
    sustainability_index: float = Field(..., ge=0.0, le=100.0, description="Comprehensive multi-attribute Sustainability Index (0-100)")
    circularity_grade: str = Field(..., description="Circularity classification letter grade (A+, A, B, C, D)")
    sustainability_summary: str = Field(..., description="Quantitative sustainability rationale")


class ParetoOptionItem(BaseModel):
    option_id: str = Field(..., description="Option key (option_a, option_b, option_c, option_d)")
    option_title: str = Field(..., description="Label, e.g. 'Option A → Maximum shelf life'")
    focus: str = Field(..., description="Primary optimization objective")
    material_id: str
    material_name: str
    overall_score: float
    shelf_life_days: int
    packaging_cost_per_pack: float
    expected_loss_cost_per_pack: float
    total_cost_per_pack: float
    sustainability_index: float
    carbon_footprint_g: float
    recyclability_class: str
    tradeoff_summary: str


class OptimizedMaterialResult(BaseModel):
    material_id: str
    name: str
    short_name: str
    category: str
    rank: int
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Multi-objective Pareto optimized score")
    ml_suitability_score: float = Field(..., ge=0.0, le=100.0)
    barrier_check: MaterialBarrierCheck
    recommended_thickness_um: float
    thickness_range_um: List[float]
    estimated_cost_per_m2: float
    carbon_footprint_g_co2_per_pack: float
    recyclability_class: str
    map_recommendation: str
    shelf_life_prediction: Optional[ShelfLifePredictionResult] = None
    map_gas_mix: Optional[MAPGasRecommendation] = None
    cost_breakdown: Optional[CostBreakdown] = None
    sustainability_indicator: Optional[SustainabilityIndicator] = None
    key_strengths: List[str]
    potential_risks: List[str]
    recommendation_reasons: Optional[List[str]] = Field(default_factory=list, description="Structured reasons: Why this material?")
    why_this_material: Optional[Dict[str, str]] = Field(default_factory=dict, description="Detailed category breakdown for Why this material?")


class ShelfLifePredictionRequest(BaseModel):
    food_properties: FoodInput
    material_id: Optional[str] = Field("metalized", description="Material candidate identifier")
    custom_otr: Optional[float] = Field(None, description="Custom OTR in cc/(m²·day·atm)")
    custom_wvtr: Optional[float] = Field(None, description="Custom WVTR in g/(m²·day)")
    initial_microbial_quality: Optional[str] = Field("Standard (<10³ CFU/g)")


class MAPOptimizationRequest(BaseModel):
    food_properties: FoodInput
    material_id: Optional[str] = Field("breathable", description="Packaging material candidate")
    custom_otr: Optional[float] = Field(None, description="Custom OTR in cc/(m²·day·atm)")
    headspace_ratio: Optional[float] = Field(2.0, ge=0.5, le=5.0, description="Headspace gas to product volume ratio")




class ProduceRespirationRequest(BaseModel):
    commodity_key: str = Field("tomato", description="Produce name or species (e.g. tomato, strawberry, broccoli, apple, lettuce_cut, mushroom, banana, bell_pepper, asparagus, onion_potato)")
    temperature_c: float = Field(10.0, ge=-2.0, le=45.0, description="Storage temperature in Celsius")
    package_weight_g: float = Field(500.0, ge=10.0, le=25000.0, description="Net weight of packaged produce in grams")
    package_surface_area_m2: Optional[float] = Field(None, ge=0.005, le=5.0, description="Surface area of the packaging pouch/film in m2")
    total_package_volume_cc: Optional[float] = Field(None, ge=50.0, le=50000.0, description="Total internal package container volume in cc")
    is_fresh_cut: Optional[bool] = Field(False, description="Whether the produce is fresh-cut, sliced, or shredded")
    custom_respiration_rate: Optional[float] = Field(None, description="Custom respiration rate at 10°C in ml O2 / (kg·hr)")


class RecommendationResponse(BaseModel):
    top_recommendation: OptimizedMaterialResult
    alternatives: List[OptimizedMaterialResult]
    all_ranked_materials: List[OptimizedMaterialResult]
    required_barrier: BarrierRequirement
    pareto_options: Optional[List[ParetoOptionItem]] = Field(None, description="Multi-objective Pareto trade-off options (Option A, B, C, D)")
    produce_respiration: Optional[Any] = Field(None, description="Detailed fresh produce respiration model result if applicable")
    ml_model_metadata: Dict[str, Any]
    optimization_summary: Dict[str, Any]
    validation_status: str
    pipeline_execution_time_ms: float


class SimulationInput(BaseModel):
    base_input: FoodInput
    temperature_range: Optional[List[float]] = None
    shelf_life_range: Optional[List[int]] = None
    humidity_range: Optional[List[float]] = None


class SimulationResponse(BaseModel):
    temperature_sensitivity: List[Dict[str, Any]]
    shelf_life_feasibility: List[Dict[str, Any]]
    summary: str


class UserLoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    requested_role: Optional[str] = Field(None, description="Optional role override for demo login")


class UserSignupRequest(BaseModel):
    name: str = Field(..., description="User full name")
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    role: Optional[str] = Field("user", description="Initial role assignment: user, system_manager, super_admin")



class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str = Field(..., description="'user', 'system_manager', or 'super_admin'")
    access_level: str = Field(..., description="'Basic', 'Management', or 'Full'")
    role_title: str
    badge_icon: str
    permissions: List[str]
    status: str = "Active"
    created_at: str


class LoginResponse(BaseModel):
    token: str
    user: UserProfile
    session_expiry: str
    message: str


class UserManagementUpdate(BaseModel):
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class SystemLogEntry(BaseModel):
    id: str
    timestamp: str
    user_email: str
    user_role: str
    action: str
    category: str
    status: str
    details: str


class MaterialManagementUpdate(BaseModel):
    id: str
    is_active: Optional[bool] = None
    nominal_otr: Optional[float] = None
    nominal_wvtr: Optional[float] = None
    sustainability_score: Optional[float] = None


class FoodPresetManagementUpdate(BaseModel):
    id: str
    name: Optional[str] = None
    category: Optional[str] = None
    moisture_pct: Optional[float] = None
    fat_pct: Optional[float] = None
    shelf_life_days: Optional[int] = None


class SystemSettingsUpdate(BaseModel):
    default_temp_c: Optional[float] = 25.0
    default_shelf_buffer_days: Optional[int] = 14
    units: Optional[str] = "Metric (SI)"
    currency: Optional[str] = "USD ($)"



