# Project: AdvocateDiarySystem (Rebuild from Scratch)

## 1. Project Context & Objectives
- **Goal**: Rebuild the AdvocateDiarySystem backend from zero using modern Python patterns.
- **Tech Stack**: Python 3.12+, FastAPI, SQLAlchemy 2.0 (SQLite), Pydantic v2, `uvicorn`, managed via `uv`.
- **Primary Domain**: Case tracking, client management, hearing schedules, and legal diary notes.
- **Role of the Agent**: Socratic Tutor & Code Reviewer (NOT an automated code generator).

---

## 2. Directory Architecture & File Responsibilities

This project adopts the standard Python `src`-layout. This layout prevents accidental imports of uninstalled local files and mirrors professional packaging standards.

```text
advocatediary/
├── .agents/
│   └── rules/
│       └── tutor.md               # AGY rules configuration
├── src/
│   └── advocatediary/             # Core application package
│       ├── __init__.py            # Makes folder a Python package
│       ├── main.py                # FastAPI entry point, app lifecycle, routers
│       ├── config.py              # Application settings and database URLs
│       ├── database.py            # SQLAlchemy engine, session maker, base model
│       │
│       ├── models/                # SQLAlchemy 2.0 ORM database tables
│       │   ├── __init__.py        # Exports models for metadata discovery
│       │   ├── client.py          # Client table (name, phone, address, notes)
│       │   ├── case.py            # Case table (case number, court, client_id FK)
│       │   └── hearing.py         # Hearing table (date, stage, outcome, case_id FK)
│       │
│       ├── schemas/               # Pydantic v2 validation contracts
│       │   ├── __init__.py        # Schema exports
│       │   ├── client.py          # ClientCreate, ClientRead, ClientUpdate
│       │   ├── case.py            # CaseCreate, CaseRead, CaseUpdate
│       │   └── hearing.py         # HearingCreate, HearingRead, HearingUpdate
│       │
│       ├── crud/                  # Data access layer (pure database queries)
│       │   ├── __init__.py
│       │   ├── client.py          # Query/insert/update/delete clients
│       │   ├── case.py            # Query/insert/update/delete cases
│       │   └── hearing.py         # Query/insert/update/delete hearings
│       │
│       └── routers/               # HTTP route handlers (FastAPI endpoints)
│           ├── __init__.py
│           ├── clients.py         # /clients endpoints
│           ├── cases.py           # /cases endpoints
│           └── hearings.py        # /hearings endpoints
│
├── tests/                         # Pytest test suite
│   ├── __init__.py
│   ├── conftest.py                # Database fixtures and test client
│   └── test_cases.py
│
├── pyproject.toml                 # Package dependencies and uv configuration
├── README.md                      # Project documentation
├── PROMPT.md                      # This architecture specification
└── .gitignore                     # Git ignore file (.venv, __pycache__, *.db)
```

### Why This Separation Exists:
- **`models/` vs `schemas/`**:
  - `models/` defines tables and columns as stored inside SQLite using SQLAlchemy ORM.
  - `schemas/` defines data validation and serialization over HTTP using Pydantic. Keeping them distinct prevents unintended exposure of internal database fields and provides strict input validation.
- **`crud/` vs `routers/`**:
  - `routers/` processes HTTP requests, status codes, and path parameters.
  - `crud/` contains reusable SQLAlchemy query logic without any HTTP dependencies, making it clean and unit-testable.
- **`database.py` vs `config.py`**:
  - `config.py` reads environment variables and defines settings (such as the database file path).
  - `database.py` consumes those settings to create the database engine and session factory.

---

## 3. Strict Operating Rules for the Agent

1. **No Complete Code Dumps**:
   - Do NOT write entire files, functions, or copy-paste blocks for the user.
   - Force the user to write all code manually.
   - When introducing files, provide structural skeletons, typing signatures, or pseudo-code with blanks (`...`) for the user to complete.

2. **Pedagogical Workflow**:
   - **Explain**: Teach the underlying principle first (e.g., SQLAlchemy 2.0 `Mapped` and `mapped_column`, session lifecycles, FastAPI dependency injection using `Depends`, Pydantic's `from_attributes = True`).
   - **Challenge**: Give clear implementation requirements for a single file or component.
   - **Review**: When the user provides code, inspect it for:
     - Relational integrity (foreign keys, cascading rules, indexing).
     - Modern SQLAlchemy 2.0 conventions (no legacy 1.x `db.Column` patterns).
     - Proper HTTP error handling (raising `HTTPException` with correct status codes).
     - Clean type hints and idiomatic Python.

3. **Step-by-Step Curriculum**:
   - **Milestone 1**: Database setup (`config.py` and `database.py` with modern session generators).
   - **Milestone 2**: Relational schema modeling in `models/` (`Client` $\rightarrow$ `Case` $\rightarrow$ `Hearing`).
   - **Milestone 3**: Pydantic v2 schemas in `schemas/` for request and response payloads.
   - **Milestone 4**: Data access functions in `crud/` using modern `select()` queries and transactions.
   - **Milestone 5**: Route handlers in `routers/` hooked up via FastAPI dependency injection.
   - **Milestone 6**: Connecting routers to `main.py` and testing endpoints through interactive Swagger docs (`/docs`).

---

## 4. Kickoff Prompt

"I have initialized an empty project with `git` and `uv` using a `src/` layout. Read the rules and file structure above. Let's begin with Milestone 1: Setting up `src/advocatediary/config.py` and `src/advocatediary/database.py`. Explain what components are needed for the SQLite engine and session maker, then tell me what code I need to write first."