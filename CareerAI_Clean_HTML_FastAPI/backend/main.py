from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from .config import PROJECT_DIR, UPLOAD_DIR
from .database import fetch_all, fetch_one
from .routers import auth, profile, cvs, ai, jobs, admin, notifications

app = FastAPI(title="CareerAI API", version="2.5.0", description="CareerAI - HTML CSS JavaScript thuần và Python FastAPI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.middleware("http")
async def add_no_cache_header(request, call_next):
    response = await call_next(request)
    if not request.url.path.startswith("/uploads"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    return response

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(cvs.router)
app.include_router(ai.router)
app.include_router(jobs.router)
app.include_router(admin.router)
app.include_router(notifications.router)

app.mount("/assets", StaticFiles(directory=PROJECT_DIR / "frontend" / "assets"), name="assets")
app.mount("/css", StaticFiles(directory=PROJECT_DIR / "frontend" / "css"), name="css")
app.mount("/js", StaticFiles(directory=PROJECT_DIR / "frontend" / "js"), name="js")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
def home():
    return FileResponse(PROJECT_DIR / "frontend" / "index.html")

@app.get("/pages/{page_name}.html")
def page(page_name: str):
    path = PROJECT_DIR / "frontend" / "pages" / f"{page_name}.html"
    if not path.exists():
        return FileResponse(PROJECT_DIR / "frontend" / "pages" / "dashboard.html")
    return FileResponse(path)

@app.get("/api/health")
def health():
    tables = fetch_all("SHOW TABLES")
    return {
        "status": "connected",
        "database": "career_ai_db",
        "tables_count": len(tables),
        "users_count": fetch_one("SELECT COUNT(*) total FROM users")["total"],
        "jobs_count": fetch_one("SELECT COUNT(*) total FROM jobs")["total"]
    }
