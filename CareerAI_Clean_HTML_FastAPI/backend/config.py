import os
from pathlib import Path
from urllib.parse import urlparse, unquote
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent
load_dotenv(BASE_DIR / ".env")


def _parse_mysql_url(raw_url: str):
    """Parse mysql://user:password@host:port/database if provided by a cloud host."""
    if not raw_url:
        return {}
    parsed = urlparse(raw_url)
    if not parsed.hostname:
        return {}
    return {
        "host": parsed.hostname,
        "port": str(parsed.port or 3306),
        "user": unquote(parsed.username or "root"),
        "password": unquote(parsed.password or ""),
        "database": parsed.path.lstrip("/") or "career_ai_db",
    }


_url_db = _parse_mysql_url(os.getenv("MYSQL_URL") or os.getenv("DATABASE_URL") or "")

DB_CONFIG = {
    "host": os.getenv("DB_HOST") or _url_db.get("host") or "localhost",
    "port": int(os.getenv("DB_PORT") or _url_db.get("port") or "3306"),
    "user": os.getenv("DB_USER") or _url_db.get("user") or "root",
    "password": (
        os.getenv("DB_PASSWORD")
        if os.getenv("DB_PASSWORD") is not None
        else _url_db.get("password", "")
    ),
    "database": os.getenv("DB_NAME") or _url_db.get("database") or "career_ai_db",
    "charset": "utf8mb4",
}

DB_SSL = os.getenv("DB_SSL", "").strip().lower()
DB_SSL_CA = os.getenv("DB_SSL_CA", "").strip()
AUTO_INIT_DB = os.getenv("AUTO_INIT_DB", "false").strip().lower() in {"1", "true", "yes"}

JWT_SECRET = os.getenv("JWT_SECRET", "CHANGE_THIS_SECRET_BEFORE_DEPLOYMENT")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "5"))
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
