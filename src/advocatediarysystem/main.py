import uvicorn
from fastapi import FastAPI

from advocatediarysystem.routers import clients_router, cases_router, hearings_router

app = FastAPI(
    title="Advocate Diary System API",
    description="Backend API for managing legal cases, clients, and hearings.",
    version="1.0.0"
)

app.include_router(clients_router)
app.include_router(cases_router)
app.include_router(hearings_router)


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"message": "Welcome to the Advocate Diary System API!"}


if __name__ == "__main__":
    uvicorn.run("advocatediarysystem.main:app", host="127.0.0.1", port=8000, reload=True)