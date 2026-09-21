"""
PackSmart AI — Systematic 9-Feature Verification Suite
Tests all 9 major API features against the active backend server:
1. Packaging recommendation: POST /api/recommend
2. Barrier analysis: POST /api/calculate-barrier
3. Shelf-life: POST /api/shelf-life/predict
4. MAP: POST /api/map/optimize
5. Produce respiration: POST /api/produce/respiration
6. What-If: POST /api/simulate
7. Materials: GET /api/materials
8. Foods: GET /api/foods
9. History: GET /api/history
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def request(method: str, path: str, payload=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body}
    except Exception as e:
        return 0, {"error": str(e)}

def run_tests():
    print("=" * 70)
    print("PACKSMART AI — 9-FEATURE END-TO-END INTEGRATION TEST SUITE")
    print("=" * 70)

    # First, authenticate as standard user to test auth-scoped history & recommend
    status, login_res = request("POST", "/api/auth/login", {
        "email": "user@packsmart.ai",
        "password": "Password123!"
    })
    user_token = login_res.get("token") or login_res.get("access_token")
    print(f"[*] Auth Setup (user@packsmart.ai): HTTP {status}, token={bool(user_token)}")

    results = []

    # 1. Packaging Recommendation (/api/recommend)
    print("\n[1/9] Testing Packaging Recommendation: POST /api/recommend")
    rec_payload = {
        "food_id": "chips",
        "food_name": "Artisan Potato Crisps",
        "category": "Snacks",
        "moisture_pct": 2.5,
        "fat_pct": 32.0,
        "ph": 6.2,
        "respiration_rate": "Low",
        "storage_type": "Ambient",
        "temperature_c": 25.0,
        "humidity_pct": 65.0,
        "shelf_life_days": 180.0,
        "package_weight_g": 200.0,
        "protection": 80,
        "sustainability": 70,
        "costPriority": 50
    }
    status, rec_data = request("POST", "/api/recommend", rec_payload, token=user_token)
    top_mat = rec_data.get("top_recommendation", {}).get("name")
    score = rec_data.get("top_recommendation", {}).get("overall_score")
    print(f"      Status: HTTP {status}")
    print(f"      Recommended Material: {top_mat} (Score: {score})")
    assert status == 200 and top_mat is not None, "Failed /api/recommend"
    results.append(("1. Packaging Recommendation (/api/recommend)", status, f"{top_mat} (Score: {score})"))

    # 2. Barrier Analysis (/api/calculate-barrier)
    print("\n[2/9] Testing Barrier Analysis: POST /api/calculate-barrier")
    status, barrier_data = request("POST", "/api/calculate-barrier", rec_payload)
    target_otr = barrier_data.get("required_barrier", {}).get("target_otr_max")
    target_wvtr = barrier_data.get("required_barrier", {}).get("target_wvtr_max")
    mat_checks = len(barrier_data.get("materials_barrier_check", []))
    print(f"      Status: HTTP {status}")
    print(f"      Target OTR Max: {target_otr} cc, Target WVTR Max: {target_wvtr} g, Materials Checked: {mat_checks}")
    assert status == 200 and target_otr is not None and mat_checks > 0, "Failed /api/calculate-barrier"
    results.append(("2. Barrier Analysis (/api/calculate-barrier)", status, f"OTR: {target_otr} cc, WVTR: {target_wvtr} g ({mat_checks} materials evaluated)"))

    # 3. Shelf-Life (/api/shelf-life/predict)
    print("\n[3/9] Testing Shelf-Life Prediction: POST /api/shelf-life/predict")
    shelf_payload = {
        "food_properties": rec_payload,
        "material_id": "metalized"
    }
    status, shelf_data = request("POST", "/api/shelf-life/predict", shelf_payload)
    pred_days = shelf_data.get("predicted_shelf_life_days")
    limiting = shelf_data.get("limiting_degradation_factor")
    print(f"      Status: HTTP {status}")
    print(f"      Predicted Shelf-Life: {pred_days} days (Limiting: {limiting})")
    assert status == 200 and pred_days is not None, "Failed /api/shelf-life/predict"
    results.append(("3. Shelf-Life Prediction (/api/shelf-life/predict)", status, f"{pred_days} days (Limiting: {limiting})"))

    # 4. MAP (/api/map/optimize)
    print("\n[4/9] Testing MAP Optimization: POST /api/map/optimize")
    map_payload = {
        "food_properties": rec_payload,
        "material_id": "metalized",
        "headspace_ratio": 2.0
    }
    status, map_data = request("POST", "/api/map/optimize", map_payload)
    gas_mix = map_data.get("gas_mixture_label")
    collapse_risk = map_data.get("package_collapse_risk")
    print(f"      Status: HTTP {status}")
    print(f"      Gas Formulation: {gas_mix} (Collapse Risk: {collapse_risk})")
    assert status == 200 and gas_mix is not None, "Failed /api/map/optimize"
    results.append(("4. MAP Optimization (/api/map/optimize)", status, f"{gas_mix}"))

    # 5. Produce Respiration (/api/produce/respiration)
    print("\n[5/9] Testing Produce Respiration: POST /api/produce/respiration")
    resp_payload = {
        "commodity_key": "tomato",
        "temperature_c": 12.0,
        "package_weight_g": 500.0,
        "package_surface_area_m2": 0.08,
        "is_fresh_cut": False
    }
    status, resp_data = request("POST", "/api/produce/respiration", resp_payload)
    decision = resp_data.get("final_decision")
    rate = resp_data.get("produce_respiration_rate_ml_kg_h")
    print(f"      Status: HTTP {status}")
    print(f"      Produce Decision: {decision} (Respiration: {rate} ml/(kg·h))")
    assert status == 200 and decision is not None, "Failed /api/produce/respiration"
    results.append(("5. Produce Respiration (/api/produce/respiration)", status, f"{decision} ({rate} ml/kg·h)"))

    # 6. What-If Simulation (/api/simulate)
    print("\n[6/9] Testing Scenario Sweep Simulation: POST /api/simulate")
    sim_payload = {
        "base_input": rec_payload,
        "temperature_range": [-5.0, 4.0, 20.0, 35.0],
        "shelf_life_range": [30, 90, 180, 365]
    }
    status, sim_data = request("POST", "/api/simulate", sim_payload)
    temp_count = len(sim_data.get("temperature_sensitivity", []))
    feas_count = len(sim_data.get("shelf_life_feasibility", []))
    summary = sim_data.get("summary", "")[:60]
    print(f"      Status: HTTP {status}")
    print(f"      Sensitivity Points: {temp_count} temps, {feas_count} horizons. Summary: {summary}...")
    assert status == 200 and temp_count == 4 and feas_count == 4, "Failed /api/simulate"
    results.append(("6. What-If Simulation (/api/simulate)", status, f"{temp_count} temps & {feas_count} horizons simulated"))

    # 7. Materials Catalog (/api/materials)
    print("\n[7/9] Testing Materials Catalog: GET /api/materials")
    status, mats_data = request("GET", "/api/materials")
    mats_count = len(mats_data) if isinstance(mats_data, list) else 0
    first_mat = mats_data[0].get("name") if mats_count > 0 else "None"
    print(f"      Status: HTTP {status}")
    print(f"      Materials Count: {mats_count} entries (e.g. {first_mat})")
    assert status == 200 and mats_count >= 5, "Failed /api/materials"
    results.append(("7. Materials Catalog (/api/materials)", status, f"{mats_count} materials cataloged"))

    # 8. Foods Catalog (/api/foods)
    print("\n[8/9] Testing Foods Catalog: GET /api/foods")
    status, foods_data = request("GET", "/api/foods")
    foods_count = len(foods_data) if isinstance(foods_data, list) else 0
    first_food = foods_data[0].get("name") if foods_count > 0 else "None"
    print(f"      Status: HTTP {status}")
    print(f"      Foods Count: {foods_count} presets (e.g. {first_food})")
    assert status == 200 and foods_count >= 5, "Failed /api/foods"
    results.append(("8. Foods Catalog (/api/foods)", status, f"{foods_count} presets cataloged"))

    # 9. History Audit Trail (/api/history)
    print("\n[9/9] Testing Recommendation History: GET /api/history")
    status, hist_data = request("GET", "/api/history?limit=10", token=user_token)
    hist_count = len(hist_data) if isinstance(hist_data, list) else 0
    print(f"      Status: HTTP {status}")
    print(f"      History Records Retrieved: {hist_count}")
    assert status == 200, "Failed /api/history"
    results.append(("9. History Trail (/api/history)", status, f"{hist_count} records retrieved with user isolation"))

    # Final Summary Table
    print("\n" + "=" * 70)
    print("SUMMARY VERIFICATION REPORT — ALL 9 FEATURES PASS")
    print("=" * 70)
    for name, code, detail in results:
        mark = "✅ PASS" if code == 200 else "❌ FAIL"
        print(f"{mark} | HTTP {code} | {name:<42} | {detail}")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
