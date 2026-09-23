from .clients import router as clients_router
from .cases import router as cases_router
from .hearings import router as hearings_router
from .auth import router as auth_router

__all__ = ["clients_router", "cases_router", "hearings_router", "auth_router"]
