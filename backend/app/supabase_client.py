"""
PackSmart AI — Supabase Client and Database Service.
Provides REST and direct integration with Supabase tables:
- profiles (Users and RBAC)
- packaging_materials (ASTM Materials Catalog)
- food_presets (Food Chemistry Presets)
- recommendation_history (Audit and ML history)
- system_audit_logs (Security and activity audit logs)
"""

import os
import json
import ssl
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from pathlib import Path

try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass

def _get_ssl_context() -> ssl.SSLContext:
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

def is_supabase_configured() -> bool:
    """Checks whether valid Supabase configuration is set in the environment."""
    if not SUPABASE_URL or "your-project-id" in SUPABASE_URL:
        return False
    if not SUPABASE_ANON_KEY or "your-anon-public-key" in SUPABASE_ANON_KEY:
        return False
    return True

def _get_headers(use_service_key: bool = False) -> Dict[str, str]:
    key = SUPABASE_SERVICE_ROLE_KEY if (use_service_key and SUPABASE_SERVICE_ROLE_KEY) else SUPABASE_ANON_KEY
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def fetch_table(table_name: str, query_params: str = "") -> Optional[List[Dict[str, Any]]]:
    """Fetches records from a Supabase table via PostgREST."""
    if not is_supabase_configured():
        return None
    
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    if query_params:
        url = f"{url}?{query_params}"
        
    req = urllib.request.Request(url, headers=_get_headers())
    try:
        with urllib.request.urlopen(req, timeout=5, context=_get_ssl_context()) as response:
            data = json.loads(response.read().decode())
            return data
    except Exception as e:
        print(f"[Supabase Client] Failed to fetch from {table_name}: {e}")
        return None

def insert_record(table_name: str, record: Dict[str, Any], use_service_key: bool = True) -> Optional[Dict[str, Any]]:
    """Inserts a record into a Supabase table."""
    if not is_supabase_configured():
        return None
        
    url = f"{SUPABASE_URL}/rest/v1/{table_name}"
    payload = json.dumps(record).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=_get_headers(use_service_key), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=5, context=_get_ssl_context()) as response:
            data = json.loads(response.read().decode())
            return data[0] if isinstance(data, list) and len(data) > 0 else data
    except Exception as e:
        print(f"[Supabase Client] Failed to insert into {table_name}: {e}")
        return None


def update_record(table_name: str, match_field: str, match_val: str, updates: Dict[str, Any], use_service_key: bool = True) -> Optional[Dict[str, Any]]:
    """Updates record(s) matching match_field=match_val in a Supabase table."""
    if not is_supabase_configured():
        return None
        
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?{match_field}=eq.{match_val}"
    payload = json.dumps(updates).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=_get_headers(use_service_key), method="PATCH")
    try:
        with urllib.request.urlopen(req, timeout=5, context=_get_ssl_context()) as response:
            raw = response.read().decode()
            if not raw:
                return {"status": "updated"}
            data = json.loads(raw)
            return data[0] if isinstance(data, list) and len(data) > 0 else data
    except Exception as e:
        print(f"[Supabase Client] Failed to update {table_name}: {e}")
        return None


def supabase_auth_login(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticates user via Supabase Auth POST /auth/v1/token?grant_type=password."""
    if not is_supabase_configured():
        return None
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    payload = json.dumps({"email": email.strip().lower(), "password": password}).encode("utf-8")
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
    }
    req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=6, context=_get_ssl_context()) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as he:
        err_msg = he.read().decode()
        print(f"[Supabase Auth Login Error {he.code}]: {err_msg}")
        return None
    except Exception as e:
        print(f"[Supabase Auth Login Exception]: {e}")
        return None


def supabase_auth_verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifies a JWT access token with Supabase Auth GET /auth/v1/user."""
    if not is_supabase_configured() or not token:
        return None
    clean_token = token.replace("Bearer ", "").strip()
    url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {clean_token}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5, context=_get_ssl_context()) as response:
            return json.loads(response.read().decode())
    except Exception:
        # Token expired, invalid or unrecognized
        return None


def supabase_auth_admin_create_user(email: str, password: str, metadata: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """Creates a confirmed user in Supabase Auth via Admin API."""
    if not is_supabase_configured() or not SUPABASE_SERVICE_ROLE_KEY:
        return None
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    payload = {
        "email": email.strip().lower(),
        "password": password,
        "email_confirm": True,
        "user_metadata": metadata or {}
    }
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=6, context=_get_ssl_context()) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"[Supabase Auth Admin Create User Error]: {e}")
        return None


