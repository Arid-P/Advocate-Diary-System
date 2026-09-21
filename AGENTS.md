# AdvocateDiarySystem — Project Context for AI Agents

> **Purpose**: This file gives any AI coding assistant full context about the project's architecture, conventions, current state, and the user's learning preferences — so it can be productive immediately without reading every source file.

---

## 1. Project Overview

**AdvocateDiarySystem** is a backend API for managing legal case workflows: tracking **Clients**, their **Cases**, and associated **Hearings** (court dates). Built as a learning project using modern Python patterns.

| Aspect | Detail |
|---|---|
| Language | Python 3.14+ |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 (modern `Mapped`/`mapped_column` style) |
| Validation | Pydantic v2 |
| Database | SQLite (file-based: `database/diary.db`) |
| Package Manager | `uv` |
| Server | Uvicorn |
| Layout | `src`-layout (`src/advocatediarysystem/`) |

---

## 2. Directory Structure

```
AdvocateDiarySystem/
├── .agents/rules/tutor.md          # AI tutor persona rules (READ THIS)
├── src/advocatediarysystem/
│   ├── __init__.py
│   ├── config.py                   # Path constants (BASE_DIR, DB_PATH, LOG_PATH) + Pydantic Settings
│   ├── database.py                 # SQLAlchemy engine, SessionLocal, Base, get_db() dependency
│   │
│   ├── models/                     # SQLAlchemy 2.0 ORM models
│   │   ├── __init__.py             # Re-exports all models
│   │   ├── client.py               # Client table
│   │   ├── case.py                 # Case table (has CaseStatus enum)
│   │   └── hearing.py              # Hearing table
│   │
│   ├── schemas/                    # Pydantic v2 validation schemas
│   │   ├── __init__.py             # Re-exports all schemas
│   │   ├── client.py               # ClientBase, ClientCreate, ClientUpdate, ClientRead
│   │   ├── case.py                 # CaseBase, CaseCreate, CaseUpdate, CaseRead
│   │   └── hearing.py              # HearingBase, HearingCreate, HearingUpdate, HearingRead
│   │
│   ├── crud/                       # Data access layer (pure DB queries, no HTTP)
│   │   ├── __init__.py             # Re-exports all CRUD functions via __all__
│   │   ├── client.py               # create_client, get_client_by_id, get_clients, update_client, delete_client
│   │   ├── case.py                 # create_case, get_case_by_id, get_cases, get_cases_by_client, update_case, delete_case
│   │   └── hearing.py              # create_hearing, get_hearing_by_id, get_hearings, get_hearings_by_case, update_hearing, delete_hearing
│   │
│   ├── routers/                    # FastAPI route handlers (TO BE BUILT — Milestone 5)
│   │   ├── clients.py
│   │   ├── cases.py
│   │   └── hearings.py
│   │
│   └── utils/
│       └── logger.py               # setup_logger() → writes to logs/logs.log
│
├── tests/                          # Pytest test suite (on branch: test_setup)
│   ├── conftest.py                 # File-based test DB (database/test.db), per-test table recreation
│   ├── test_models.py
│   ├── test_schemas.py
│   ├── test_crud_client.py
│   ├── test_crud_case.py
│   └── test_crud_hearing.py
│
├── examples/                       # Standalone learning scripts (on branch: Examples)
│   ├── demo.py                     # SQLAlchemy 2.0 query patterns tutorial
│   ├── router_demo.py              # Basic FastAPI router + Depends() demo
│   └── router_demo_advanced.py     # Query params, path params, HTTPException, status codes
│
├── database/                       # SQLite DB files live here (gitignored)
├── pyproject.toml
├── README.md
└── advocate_diary_system_project_spec.md   # Full project specification
```

---

## 3. Data Model & Relationships

```
Client (1) ──→ (N) Case (1) ──→ (N) Hearing
```

### Client (`models/client.py`)
| Column | Type | Constraints |
|---|---|---|
| `id` | `int` | PK, auto-increment, indexed |
| `name` | `str` | `String(100)`, NOT NULL |
| `phone` | `str \| None` | `String(13)` |
| `email` | `str \| None` | `String(100)` |
| `address` | `str` | `Text`, NOT NULL |
| `created_at` | `datetime` | `DateTime(timezone=True)`, defaults to UTC now |
| `cases` | relationship | `list["Case"]`, `cascade="all, delete-orphan"` |

### Case (`models/case.py`)
| Column | Type | Constraints |
|---|---|---|
| `id` | `int` | PK, auto-increment, indexed |
| `case_number` | `str` | `String(50)`, NOT NULL |
| `title` | `str` | `String(200)`, NOT NULL |
| `description` | `str \| None` | `Text` |
| `court` | `str` | `String(100)`, NOT NULL |
| `status` | `CaseStatus` | Enum (`open`, `closed`, `pending`), default `OPEN`, stored via `SQLEnum` |
| `opposite_party` | `str` | `String(200)`, NOT NULL |
| `client_id` | `int` | FK → `clients.id`, `ondelete="CASCADE"` |
| `client` | relationship | back_populates `"cases"` |
| `hearings` | relationship | `list["Hearing"]`, `cascade="all, delete-orphan"` |
| `created_at` | `datetime` | `DateTime(timezone=True)`, defaults to UTC now |

### Hearing (`models/hearing.py`)
| Column | Type | Constraints |
|---|---|---|
| `id` | `int` | PK, auto-increment, indexed |
| `hearing_date` | `date` | `Date`, NOT NULL (note: this is `date`, not `datetime`) |
| `stage` | `str` | `String(50)`, NOT NULL |
| `summary` | `str \| None` | `Text` |
| `next_hearing_date` | `date \| None` | `Date` |
| `case_id` | `int` | FK → `cases.id`, `ondelete="CASCADE"` |
| `case` | relationship | back_populates `"hearings"` |
| `created_at` | `datetime` | `DateTime(timezone=True)`, defaults to UTC now |

---

## 4. CRUD Function Signatures (Important!)

CRUD functions follow a consistent pattern. Pay close attention to `update` and `delete` — they accept the **ORM model instance**, not an integer ID:

```python
# CREATE — takes a Pydantic Create schema, returns ORM model
def create_client(db: Session, client_in: ClientCreate) -> Client

# READ — takes an int ID, returns ORM model or None
def get_client_by_id(db: Session, client_id: int) -> Client | None
def get_clients(db: Session, skip: int = 0, limit: int = 100) -> list[Client]

# UPDATE — takes the ORM model instance + Pydantic Update schema
def update_client(db: Session, db_client: Client, client_in: ClientUpdate) -> Client

# DELETE — takes the ORM model instance, returns None
def delete_client(db: Session, db_client: Client) -> None
```

The same pattern applies to `case` and `hearing` CRUD modules. Additional query functions:
- `get_cases_by_client(db, client_id, skip, limit)` — filter cases by client
- `get_hearings_by_case(db, case_id, skip, limit)` — filter hearings by case

---

## 5. Schema Pattern

Each entity follows a 4-schema pattern:
- **`Base`** — shared required fields (used as parent class)
- **`Create(Base)`** — inherits Base, used for POST requests
- **`Update(BaseModel)`** — all fields optional (`| None = None`), used for PATCH
- **`Read(Base)`** — adds `id` + `created_at`, has `model_config = ConfigDict(from_attributes=True)`

---

## 6. Config & Database

- `config.py` exports module-level constants: `BASE_DIR`, `BACKEND_DIR`, `DB_PATH`, `LOG_PATH`
- `config.py` also exports a `Settings` class (Pydantic Settings) and a singleton `settings` instance
- `database.py` exports `engine`, `SessionLocal`, `Base`, and `get_db()` (a generator dependency for FastAPI)
- `get_db()` uses `yield` + `finally` pattern — ready for `Depends(get_db)` in routers

---

## 7. Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable baseline |
| `CRUD` | Milestone 4 work |
| `Examples` | Learning demos (`examples/` folder) |
| `schemas` | Milestone 3 work |
| `routers` | Milestone 5 work (next up) |
| `test_setup` | Automated test suite |

---

## 8. Milestone Progress

| Milestone | Status | Description |
|---|---|---|
| M1: Config & Database | ✅ Done | `config.py`, `database.py` |
| M2: ORM Models | ✅ Done | `models/client.py`, `case.py`, `hearing.py` |
| M3: Pydantic Schemas | ✅ Done | `schemas/client.py`, `case.py`, `hearing.py` |
| M4: CRUD Layer | ✅ Done | `crud/client.py`, `case.py`, `hearing.py` |
| M5: FastAPI Routers | 🔜 Next | `routers/clients.py`, `cases.py`, `hearings.py` |
| M6: Main App & Swagger | ⬜ Pending | `main.py` integration |

---

## 9. Testing

- **Framework**: pytest (dev dependency in `pyproject.toml`)
- **Run**: `uv run pytest -s -v`
- **Database**: File-based `database/test.db` (NOT in-memory)
- **Isolation**: Tables are dropped and recreated before each test function
- **23 tests** across models, schemas, and all 3 CRUD modules — all passing

---

## 10. Conventions & Gotchas

1. **SQLAlchemy 2.0 only** — no legacy `Column()` / `relationship()` without type hints
2. **CaseStatus enum** — must use `SQLEnum(CaseStatus)` in the column definition for SQLite compatibility
3. **Hearing dates** are `date` (not `datetime`) — Pydantic will coerce `datetime` → `date` silently
4. **`address` is required** on Client (NOT optional) — tests must always include it
5. **Update/Delete CRUD** accept ORM instances, not IDs — routers must fetch first, then pass the object
6. **Logging** — each CRUD module creates its own logger via `setup_logger("crud.<entity>")`
7. **No `updated_at`** column exists on any model — only `created_at`

---

## 11. User Preferences & Tutor Rules

> ⚠️ **READ `.agents/rules/tutor.md` BEFORE WRITING CODE**

- The user is **learning** FastAPI/SQLAlchemy — act as a Socratic tutor
- **Do NOT write full implementations** for the main project code (M1–M6)
- Provide scaffolds with blanks (`...`) and let the user fill them in
- **Exception**: The user may explicitly override this for utility tasks (e.g., "write the test files for me")
- The user appreciates deep dives into "under the hood" mechanics
- No viva/exam questions — keep it purely technical/engineering focused
- The user uses `uv` for package management (not pip/pipx)

