"""
PackSmart AI — Automatic Supabase Schema Migration Script
Applies backend/supabase_schema.sql to the PostgreSQL database in .env
"""

import os
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

# Load .env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

db_url = os.getenv("DATABASE_URL", "").strip()
sql_path = Path(__file__).resolve().parent / "supabase_schema.sql"

print(f"Applying schema to: {db_url.split('@')[-1] if '@' in db_url else db_url}")

if not sql_path.exists():
    print(f"Error: {sql_path} does not exist")
    exit(1)

with open(sql_path, "r", encoding="utf-8") as f:
    sql_script = f.read()

try:
    conn = psycopg2.connect(db_url, connect_timeout=10)
    conn.autocommit = True
    cursor = conn.cursor()
    print("✓ Successfully connected to Supabase PostgreSQL database.")
    print("Executing schema script...")
    cursor.execute(sql_script)
    print("✅ All Supabase tables, indexes, RLS policies, and seed data created successfully!")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"❌ Migration error: {e}")
    print("If direct socket connection was blocked by firewall or network, you can run the SQL script directly in:")
    print("Supabase Dashboard > SQL Editor > New query > Paste and Run")
