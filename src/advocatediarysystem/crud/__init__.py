# src/advocatediarysystem/crud/__init__.py

from .client import (
    create_client,
    get_client_by_id,
    get_client_by_phone,
    get_clients,
    update_client,
    delete_client,
)
from .case import (
    create_case,
    get_case_by_id,
    get_cases,
    get_cases_by_client,
    update_case,
    delete_case,
)
from .hearing import (
    create_hearing,
    get_hearing_by_id,
    get_hearings,
    get_hearings_by_case,
    update_hearing,
    delete_hearing,
)

__all__ = [
    "create_client", "get_client_by_id", "get_client_by_phone", "get_clients", "update_client", "delete_client",
    "create_case", "get_case_by_id", "get_cases", "get_cases_by_client", "update_case", "delete_case",
    "create_hearing", "get_hearing_by_id", "get_hearings", "get_hearings_by_case", "update_hearing", "delete_hearing",
]