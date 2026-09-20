"""
FastAPI Server Runner for PackSmart AI ML Backend.
Runs on http://127.0.0.1:8000
"""

import os
from pathlib import Path
import uvicorn

try:
    from dotenv import load_dotenv
    # Load .env from backend directory or project root
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass

if __name__ == "__main__":
    host = os.getenv("BACKEND_HOST", os.getenv("HOST", "0.0.0.0"))
    port = int(os.getenv("BACKEND_PORT", os.getenv("PORT", "8000")))
    reload = os.getenv("BACKEND_RELOAD", "True").lower() in ("true", "1", "t", "yes")
    uvicorn.run("app.main:app", host=host, port=port, reload=reload)
