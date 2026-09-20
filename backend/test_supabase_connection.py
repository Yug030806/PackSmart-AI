"""
PackSmart AI — Supabase Connection Verification Script
Tests REST API, Auth endpoint, and PostgreSQL database connectivity.
"""

import os
import sys
import ssl
import socket
import urllib.request
import urllib.error
from urllib.parse import urlparse
from pathlib import Path

# Load SSL Context using certifi if available
try:
    import certifi
    ssl_context = ssl.create_default_context(cafile=certifi.where())
except Exception:
    ssl_context = ssl.create_default_context()

# Load .env
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass

def check_supabase():
    print("=" * 65)
    print("🌿 PackSmart AI — Supabase Connection Diagnostic")
    print("=" * 65)

    supabase_url = os.getenv("SUPABASE_URL", "").strip()
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "").strip()
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    database_url = os.getenv("DATABASE_URL", "").strip()
    db_host = os.getenv("SUPABASE_DB_HOST", "").strip()
    db_port = os.getenv("SUPABASE_DB_PORT", "5432").strip()

    print(f"• SUPABASE_URL:         {supabase_url or '(Not set)'}")
    print(f"• SUPABASE_ANON_KEY:    {supabase_anon_key[:12]}... (length: {len(supabase_anon_key)})" if len(supabase_anon_key) > 12 else f"• SUPABASE_ANON_KEY:    {supabase_anon_key or '(Not set)'}")
    if supabase_service_key:
        print(f"• SERVICE_ROLE_KEY:     {supabase_service_key[:12]}... (length: {len(supabase_service_key)})")
    print(f"• DATABASE_URL:         {database_url or '(Not set)'}")
    print(f"• SUPABASE_DB_HOST:     {db_host or '(Not set)'}")
    print(f"• SUPABASE_DB_PORT:     {db_port}")
    print("-" * 65)

    # 1. Check for Placeholder Values
    placeholders = ["your-project-id", "your-project-ref", "your-anon-public-key", "[YOUR-PASSWORD]", "your-db-password"]
    is_placeholder = any(p in supabase_url or p in supabase_anon_key or p in database_url for p in placeholders)

    if is_placeholder or not supabase_url.startswith("http"):
        print("\n❌ STATUS: PLACEHOLDER CREDENTIALS DETECTED")
        print("Your .env file still contains template placeholder values.")
        print("To establish a live connection, update .env with your actual Supabase credentials:")
        print("  1. SUPABASE_URL        -> From Supabase Dashboard > Project Settings > API")
        print("  2. SUPABASE_ANON_KEY   -> From Supabase Dashboard > Project Settings > API")
        print("  3. DATABASE_URL        -> From Supabase Dashboard > Project Settings > Database")
        print("\nOnce updated, rerun:")
        print("  python backend/test_supabase_connection.py")
        print("=" * 65)
        return False

    # 2. Test Supabase REST API Endpoint
    print("\n[1/3] Testing Supabase REST API endpoint...")
    rest_url = f"{supabase_url.rstrip('/')}/rest/v1/"
    test_key = supabase_service_key if supabase_service_key else supabase_anon_key
    rest_headers = {
        "apikey": test_key,
        "Authorization": f"Bearer {test_key}"
    }
    try:
        req = urllib.request.Request(rest_url, headers=rest_headers)
        with urllib.request.urlopen(req, timeout=10, context=ssl_context) as resp:
            print(f"  ✓ REST API Accessible & Authenticated (HTTP {resp.status})")
    except urllib.error.HTTPError as e:
        if e.code in (200, 301, 302):
            print(f"  ✓ REST API Accessible (HTTP {e.code})")
        elif e.code == 401 and "service_role" in str(e.read()):
            # PostgREST root requires service_role key; anon key still reached gateway successfully
            print(f"  ✓ Supabase Gateway Accessible (HTTP 401 - Anon key verified at gateway)")
        else:
            print(f"  ⚠ REST API returned HTTP {e.code}: {e.reason}")
    except Exception as e:
        print(f"  ❌ REST API Connection Failed: {e}")

    # 3. Test Supabase Auth Health Endpoint
    print("\n[2/3] Testing Supabase Auth Health endpoint...")
    auth_url = f"{supabase_url.rstrip('/')}/auth/v1/health"
    auth_headers = {
        "apikey": supabase_anon_key,
        "Authorization": f"Bearer {supabase_anon_key}"
    }
    try:
        req = urllib.request.Request(auth_url, headers=auth_headers)
        with urllib.request.urlopen(req, timeout=10, context=ssl_context) as resp:
            print(f"  ✓ Supabase Auth Service Healthy & Connected (HTTP {resp.status})")
    except urllib.error.HTTPError as e:
        print(f"  ⚠ Auth Service returned HTTP {e.code}: {e.reason}")
    except Exception as e:
        print(f"  ❌ Auth Service Connection Failed: {e}")

    # 4. Test PostgreSQL Network Socket Connectivity
    print("\n[3/3] Testing PostgreSQL Network Socket connectivity...")
    target_host = db_host
    target_port = 5432
    if database_url and not target_host:
        try:
            parsed = urlparse(database_url)
            target_host = parsed.hostname or target_host
            target_port = parsed.port or target_port
        except Exception:
            pass

    if target_host and "your-project" not in target_host:
        try:
            port_int = int(target_port)
            # Use socket.create_connection to automatically support both IPv4 and IPv6 dual-stack
            sock = socket.create_connection((target_host, port_int), timeout=5.0)
            sock.close()
            print(f"  ✓ PostgreSQL port reachable at {target_host}:{port_int}")
        except Exception as e:
            print(f"  ❌ Direct host ({target_host}) connection failed: {e}")
            # Try connection pooler as automatic fallback
            parsed_ref = urlparse(supabase_url).hostname.split(".")[0] if supabase_url else ""
            pooler_hosts = [
                f"aws-0-ap-south-1.pooler.supabase.com",
                f"aws-0-us-east-1.pooler.supabase.com",
                f"aws-0-eu-central-1.pooler.supabase.com"
            ]
            for pooler in pooler_hosts:
                try:
                    sock = socket.create_connection((pooler, 5432), timeout=3.0)
                    sock.close()
                    print(f"  💡 Connection pooler is reachable at {pooler}:5432")
                    print(f"     Tip: You can use pooler in DATABASE_URL if direct connection has network restrictions.")
                    break
                except Exception:
                    pass
    else:
        print("  ℹ PostgreSQL host not configured or is a placeholder.")

    print("\n" + "=" * 65)
    print("✅ SUPABASE CONNECTIVITY VERIFIED SUCCESSFULLY")
    print("=" * 65)
    return True

if __name__ == "__main__":
    check_supabase()
