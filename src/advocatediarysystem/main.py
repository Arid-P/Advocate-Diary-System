from pathlib import Path
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from advocatediarysystem.routers import (
    clients_router,
    cases_router,
    hearings_router,
    auth_router,
)
from advocatediarysystem.config import FRONTEND_DIR

app = FastAPI(
    title="Advocate Diary System API",
    description="Backend API and Web Interface for managing legal cases, clients, and hearings.",
    version="1.0.0"
)

# Enable CORS for local testing and cross-origin tools
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth_router)
app.include_router(clients_router)
app.include_router(cases_router)
app.include_router(hearings_router)


@app.get("/api/health")
def health_check():
    """Health check endpoint for API and UI status monitoring."""
    return {"message": "Advocate Diary System API is healthy", "status": "healthy"}


if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


if __name__ == "__main__":
    uvicorn.run("advocatediarysystem.main:app", host="127.0.0.1", port=8000, reload=True)