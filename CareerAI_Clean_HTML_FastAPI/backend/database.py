import ssl
import pymysql
from pymysql.cursors import DictCursor
from fastapi import HTTPException
from .config import DB_CONFIG, DB_SSL, DB_SSL_CA, PROJECT_DIR

try:
    import certifi
except ImportError:
    certifi = None


def _build_ssl_context():
    """Configure TLS context when connecting to cloud MySQL providers (e.g., TiDB Cloud, Aiven)."""
    host = (DB_CONFIG.get("host") or "").lower()
    if DB_SSL in {"0", "false", "no", "off", "disable"}:
        return None

    cloud_tls_host = any(
        host.endswith(suffix)
        for suffix in (".tidbcloud.com", ".aivencloud.com", ".psdb.cloud")
    )
    if not DB_SSL and not cloud_tls_host:
        return None

    if DB_SSL_CA:
        return ssl.create_default_context(cafile=DB_SSL_CA)

    if DB_SSL in {"skip-verify", "insecure"} or host.endswith(".aivencloud.com"):
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx

    cafile = certifi.where() if certifi else None
    return ssl.create_default_context(cafile=cafile)


def get_connection():
    try:
        kwargs = {
            **DB_CONFIG,
            "cursorclass": DictCursor,
            "autocommit": True,
            "connect_timeout": 10,
        }
        ssl_ctx = _build_ssl_context()
        if ssl_ctx is not None:
            kwargs["ssl"] = ssl_ctx
        return pymysql.connect(**kwargs)
    except pymysql.MySQLError as error:
        raise HTTPException(
            status_code=503, detail=f"Không kết nối được MySQL: {error}"
        )


def fetch_all(sql, params=()):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return cursor.fetchall()
    finally:
        connection.close()


def fetch_one(sql, params=()):
    rows = fetch_all(sql, params)
    return rows[0] if rows else None


def execute(sql, params=()):
    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute(sql, params)
            return {"id": cursor.lastrowid, "affected": cursor.rowcount}
    finally:
        connection.close()


def _split_sql_statements(sql_text: str):
    """Split SQL file into executable statements ignoring line comments and quoted semicolons."""
    cleaned_lines = []
    for line in sql_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("--") or not stripped:
            continue
        cleaned_lines.append(line)
    cleaned = "\n".join(cleaned_lines)

    statements = []
    buf = []
    in_quote = False
    quote_char = ""
    escaped = False

    for ch in cleaned:
        if escaped:
            buf.append(ch)
            escaped = False
            continue
        if ch == "\\":
            buf.append(ch)
            escaped = True
            continue
        if in_quote:
            buf.append(ch)
            if ch == quote_char:
                in_quote = False
        else:
            if ch in ("'", '"'):
                in_quote = True
                quote_char = ch
                buf.append(ch)
            elif ch == ";":
                stmt = "".join(buf).strip()
                if stmt:
                    statements.append(stmt)
                buf = []
            else:
                buf.append(ch)

    tail = "".join(buf).strip()
    if tail:
        statements.append(tail)
    return statements


def init_schema_from_sql():
    """Initialize schema & seed sample data into target DB if `users` table does not exist."""
    sql_path = PROJECT_DIR / "database.sql"
    if not sql_path.exists():
        return False

    connection = get_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SHOW TABLES LIKE 'users'")
            if cursor.fetchone():
                return False

            sql_text = sql_path.read_text(encoding="utf-8")
            for stmt in _split_sql_statements(sql_text):
                upper = stmt.lstrip().upper()
                # Managed cloud MySQL providers restrict CREATE DATABASE / USE to pre-assigned DBs
                if upper.startswith("CREATE DATABASE") or upper.startswith("USE "):
                    continue
                cursor.execute(stmt)
        return True
    finally:
        connection.close()


if __name__ == "__main__":
    created = init_schema_from_sql()
    print("Initialized database schema." if created else "Database already initialized.")
