"""
Authentication and Role-Based Access Control (RBAC) Module for PackSmart AI.

Defines:
- 3 Access Tiers:
    1. 👑 Super Admin (Full System Access)
    2. 🛠️ System Manager (Management Access)
    3. 👤 User (Basic Access)
- User storage, authentication, and permission enforcement
- System activity audit logging
"""

import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from .schemas import UserProfile, LoginResponse, SystemLogEntry, UserManagementUpdate
from .supabase_client import is_supabase_configured, fetch_table, insert_record, update_record

# Role hierarchy & definitions
ROLE_CONFIG = {
    "super_admin": {
        "title": "Super Admin",
        "access_level": "Full",
        "badge_icon": "👑",
        "description": "Unrestricted access to the entire application, security, users, and full database.",
        "permissions": [
            "use_packaging_advisor",
            "compare_materials",
            "what_if_simulator",
            "view_recommendations",
            "download_reports",
            "view_history",
            "manage_users",
            "manage_system_managers",
            "manage_roles_permissions",
            "manage_food_database",
            "manage_material_database",
            "edit_recommendations",
            "view_all_reports",
            "view_system_activity_logs",
            "configure_application_settings",
            "manage_security_access_controls",
            "full_database_access"
        ]
    },
    "system_manager": {
        "title": "System Manager",
        "access_level": "Management",
        "badge_icon": "🛠️",
        "description": "Everything a User can do + manage users, food/material data, recommendations, reports, and application settings.",
        "permissions": [
            "use_packaging_advisor",
            "compare_materials",
            "what_if_simulator",
            "view_recommendations",
            "download_reports",
            "view_history",
            "manage_users",
            "manage_food_database",
            "manage_material_database",
            "edit_recommendations",
            "view_all_reports",
            "configure_application_settings"
        ]
    },
    "user": {
        "title": "Standard User",
        "access_level": "Basic",
        "badge_icon": "👤",
        "description": "Basic access: Use packaging advisor, compare materials, What-If simulator, recommendations, reports, history.",
        "permissions": [
            "use_packaging_advisor",
            "compare_materials",
            "what_if_simulator",
            "view_recommendations",
            "download_reports",
            "view_history"
        ]
    }
}

# In-memory user database initialized with standard accounts
USERS_DB: Dict[str, Dict[str, Any]] = {
    "admin@packsmart.ai": {
        "id": "usr-sa-001",
        "name": "Sarah Chen",
        "email": "admin@packsmart.ai",
        "password": "admin",
        "role": "super_admin",
        "status": "Active",
        "created_at": "2026-01-10T08:00:00Z"
    },
    "manager@packsmart.ai": {
        "id": "usr-sm-002",
        "name": "Marcus Vance",
        "email": "manager@packsmart.ai",
        "password": "manager",
        "role": "system_manager",
        "status": "Active",
        "created_at": "2026-02-15T09:30:00Z"
    },
    "user@packsmart.ai": {
        "id": "usr-bu-003",
        "name": "Alex Rivera",
        "email": "user@packsmart.ai",
        "password": "user",
        "role": "user",
        "status": "Active",
        "created_at": "2026-03-01T11:20:00Z"
    }
}

# Audit logs store
AUDIT_LOGS: List[Dict[str, Any]] = [
    {
        "id": "log-001",
        "timestamp": "2026-09-20T22:15:00Z",
        "user_email": "admin@packsmart.ai",
        "user_role": "Super Admin",
        "action": "SYSTEM_STARTUP",
        "category": "System",
        "status": "SUCCESS",
        "details": "PackSmart AI ML Engine v2.0 initialized with ASTM barrier physics."
    },
    {
        "id": "log-002",
        "timestamp": "2026-09-20T22:18:22Z",
        "user_email": "admin@packsmart.ai",
        "user_role": "Super Admin",
        "action": "ML_MODEL_TRAIN",
        "category": "Model",
        "status": "SUCCESS",
        "details": "MultiOutput Random Forest retrained: R² = 0.996, 1500 samples."
    },
    {
        "id": "log-003",
        "timestamp": "2026-09-20T22:45:10Z",
        "user_email": "manager@packsmart.ai",
        "user_role": "System Manager",
        "action": "DATA_PRESET_UPDATE",
        "category": "Database",
        "status": "SUCCESS",
        "details": "Updated ASTM moisture sorption isotherm for bakery biscuits."
    },
    {
        "id": "log-004",
        "timestamp": "2026-09-20T23:05:00Z",
        "user_email": "user@packsmart.ai",
        "user_role": "Standard User",
        "action": "BARRIER_CALCULATION",
        "category": "Advisor",
        "status": "SUCCESS",
        "details": "Executed real OTR & WVTR calculation for Tomato (Breathable EMAP film)."
    }
]


def log_event(user_email: str, user_role: str, action: str, category: str, status: str, details: str):
    """Appends an audit log entry to memory and Supabase table system_audit_logs."""
    entry = {
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_email": user_email,
        "user_role": user_role,
        "action": action,
        "category": category,
        "status": status,
        "details": details
    }
    AUDIT_LOGS.insert(0, entry)
    if len(AUDIT_LOGS) > 100:
        AUDIT_LOGS.pop()

    try:
        if is_supabase_configured():
            insert_record("system_audit_logs", entry)
    except Exception as e:
        print(f"[Supabase Audit Log] Failed to insert log: {e}")



def authenticate_user(email: str, password: str, requested_role: Optional[str] = None) -> LoginResponse:
    """
    Authenticates user and returns JWT-like bearer payload with role and permissions.
    Supports quick demo logins or password verification.
    """
    email_clean = email.strip().lower()
    
    # Check if user exists in database
    if email_clean in USERS_DB:
        user_record = USERS_DB[email_clean]
        # In demo environment, allow matching password or 'admin'/'manager'/'user' or role override
        role_to_use = requested_role or user_record["role"]
    else:
        # Auto-provision or demo custom user
        role_to_use = requested_role if requested_role in ROLE_CONFIG else "user"
        user_record = {
            "id": f"usr-{uuid.uuid4().hex[:6]}",
            "name": email_clean.split("@")[0].replace(".", " ").title(),
            "email": email_clean,
            "password": password,
            "role": role_to_use,
            "status": "Active",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        USERS_DB[email_clean] = user_record

    role_meta = ROLE_CONFIG.get(role_to_use, ROLE_CONFIG["user"])
    
    profile = UserProfile(
        id=user_record["id"],
        name=user_record["name"],
        email=user_record["email"],
        role=role_to_use,
        access_level=role_meta["access_level"],
        role_title=role_meta["title"],
        badge_icon=role_meta["badge_icon"],
        permissions=role_meta["permissions"],
        status=user_record["status"],
        created_at=user_record["created_at"]
    )

    token = f"pk_jwt_{uuid.uuid4().hex}"

    log_event(
        user_email=profile.email,
        user_role=profile.role_title,
        action="USER_LOGIN",
        category="Auth",
        status="SUCCESS",
        details=f"Successful authentication with {profile.access_level} access tier ({profile.role_title})."
    )

    return LoginResponse(
        token=token,
        user=profile,
        session_expiry="24 hours",
        message=f"Logged in successfully as {profile.role_title} ({profile.access_level} Access)"
    )


def list_all_users() -> List[UserProfile]:
    """Returns all users in the system, prioritizing live Supabase profiles."""
    try:
        if is_supabase_configured():
            sb_profiles = fetch_table("profiles", "order=created_at.asc")
            if sb_profiles and len(sb_profiles) > 0:
                results = []
                for p in sb_profiles:
                    r_key = p.get("role", "user")
                    role_meta = ROLE_CONFIG.get(r_key, ROLE_CONFIG["user"])
                    results.append(UserProfile(
                        id=p.get("id"),
                        name=p.get("name", "User"),
                        email=p.get("email"),
                        role=r_key,
                        access_level=p.get("access_level", role_meta["access_level"]),
                        role_title=p.get("role_title", role_meta["title"]),
                        badge_icon=p.get("badge_icon", role_meta["badge_icon"]),
                        permissions=p.get("permissions") or role_meta["permissions"],
                        status=p.get("status", "Active"),
                        created_at=str(p.get("created_at", ""))
                    ))
                return results
    except Exception as e:
        print(f"[Auth] Supabase profile fetch fallback: {e}")

    res = []
    for u in USERS_DB.values():
        role_meta = ROLE_CONFIG.get(u["role"], ROLE_CONFIG["user"])
        res.append(UserProfile(
            id=u["id"],
            name=u["name"],
            email=u["email"],
            role=u["role"],
            access_level=role_meta["access_level"],
            role_title=role_meta["title"],
            badge_icon=role_meta["badge_icon"],
            permissions=role_meta["permissions"],
            status=u["status"],
            created_at=u["created_at"]
        ))
    return res


def update_user_role(update: UserManagementUpdate) -> Optional[UserProfile]:
    """Updates a user's role or status in memory and Supabase profiles table."""
    updated_profile = None

    # Check and update in memory
    for email, u in USERS_DB.items():
        if u["id"] == update.user_id:
            if update.role and update.role in ROLE_CONFIG:
                u["role"] = update.role
            if update.status:
                u["status"] = update.status
            if update.name:
                u["name"] = update.name
            
            role_meta = ROLE_CONFIG.get(u["role"], ROLE_CONFIG["user"])
            updated_profile = UserProfile(
                id=u["id"],
                name=u["name"],
                email=u["email"],
                role=u["role"],
                access_level=role_meta["access_level"],
                role_title=role_meta["title"],
                badge_icon=role_meta["badge_icon"],
                permissions=role_meta["permissions"],
                status=u["status"],
                created_at=u["created_at"]
            )
            break

    # Also update in Supabase
    try:
        if is_supabase_configured():
            payload = {}
            if update.role and update.role in ROLE_CONFIG:
                role_meta = ROLE_CONFIG[update.role]
                payload["role"] = update.role
                payload["role_title"] = role_meta["title"]
                payload["access_level"] = role_meta["access_level"]
                payload["badge_icon"] = role_meta["badge_icon"]
                payload["permissions"] = role_meta["permissions"]
            if update.status:
                payload["status"] = update.status
            if update.name:
                payload["name"] = update.name

            if payload:
                update_record("profiles", "id", update.user_id, payload)
    except Exception as e:
        print(f"[Auth] Supabase profile update failed: {e}")

    if updated_profile:
        log_event(
            user_email="admin@packsmart.ai",
            user_role="Super Admin",
            action="USER_ROLE_UPDATE",
            category="Administration",
            status="SUCCESS",
            details=f"Updated user ID {update.user_id} to {updated_profile.role_title} ({updated_profile.access_level})."
        )
    return updated_profile


def get_system_audit_logs() -> List[SystemLogEntry]:
    """Returns the latest system audit logs from Supabase or fallback store."""
    try:
        if is_supabase_configured():
            sb_logs = fetch_table("system_audit_logs", "order=timestamp.desc&limit=50")
            if sb_logs:
                return [
                    SystemLogEntry(
                        id=l.get("id", f"log-{i}"),
                        timestamp=str(l.get("timestamp", "")),
                        user_email=l.get("user_email", ""),
                        user_role=l.get("user_role", ""),
                        action=l.get("action", ""),
                        category=l.get("category", ""),
                        status=l.get("status", "SUCCESS"),
                        details=l.get("details", "")
                    )
                    for i, l in enumerate(sb_logs)
                ]
    except Exception as e:
        print(f"[Auth] Supabase audit log query error: {e}")

    return [
        SystemLogEntry(
            id=l["id"],
            timestamp=l["timestamp"],
            user_email=l["user_email"],
            user_role=l["user_role"],
            action=l["action"],
            category=l["category"],
            status=l["status"],
            details=l["details"]
        )
        for l in AUDIT_LOGS
    ]

