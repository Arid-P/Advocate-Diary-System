# Advocate Diary System

A modern, robust legal practice management backend designed for legal advocates and law firms to manage clients, track court cases, schedule hearings, and organize daily legal proceedings.

Built with **FastAPI**, **SQLAlchemy 2.0 (SQLite)**, **Pydantic v2**, and managed with **uv**.

---

## Features & Domain Architecture

- **Client Management**: Store client profiles, contact information, and matter histories.
- **Case Tracking**: Manage cases with unique case numbers, courts, matter descriptions, statuses (`open`, `pending`, `closed`), and opposing parties.
- **Hearing Schedules**: Schedule and record court hearing dates, stages of proceedings (evidence, arguments, bail), outcomes, and next adjourned dates.
- **Relational Integrity**: Strict 1-to-many cascading relationships ($\text{Client} \xrightarrow{1:N} \text{Case} \xrightarrow{1:N} \text{Hearing}$).
- **Structured Logging**: Self-healing logging utility tracking backend operations and query transactions.
- **Strict Data Validation**: Pydantic v2 schemas providing type safety and OpenAPI / Swagger documentation.

---

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Language** | Python 3.12+ | Modern type hints and annotations |
| **Web Framework** | FastAPI | High-performance asynchronous API framework |
| **ORM & Database** | SQLAlchemy 2.0 + SQLite | Modern 2.0 declarative mapping with session lifecycles |
| **Data Validation** | Pydantic v2 | Contract schemas (`from_attributes=True`) |
| **Package Manager** | uv | Ultra-fast Python package and project manager |
| **Server** | Uvicorn | ASGI web server implementation |

---

## Project Structure (`src` layout)

```text
AdvocateDiarySystem/
├── src/
│   └── advocatediarysystem/
│       ├── config.py             # Portable path & environment configuration (pydantic-settings)
│       ├── database.py           # SQLAlchemy 2.0 engine, sessionmaker & Base
│       ├── models/               # SQLAlchemy ORM database tables
│       │   ├── __init__.py       # Model exports for metadata discovery
│       │   ├── client.py         # Client table
│       │   ├── case.py           # Case table (FK -> Client)
│       │   └── hearing.py        # Hearing table (FK -> Case)
│       ├── schemas/              # Pydantic v2 validation contracts
│       │   ├── __init__.py       # Schema exports
│       │   ├── client.py         # ClientBase, Create, Update, Read
│       │   ├── case.py           # CaseBase, Create, Update, Read
│       │   └── hearing.py        # HearingBase, Create, Update, Read
│       ├── crud/                 # Data access layer (pure SQLAlchemy queries)
│       │   ├── __init__.py
│       │   ├── client.py
│       │   ├── case.py
│       │   └── hearing.py
│       ├── routers/              # FastAPI HTTP endpoints & dependency injection
│       │   ├── __init__.py
│       │   ├── clients.py
│       │   ├── cases.py
│       │   └── hearings.py
│       ├── utils/                # Shared utilities
│       │   ├── __init__.py
│       │   └── logger.py         # Structured application logger
│       └── main.py               # FastAPI application factory & router registration
├── database/                     # SQLite database storage (diary.db)
├── logs/                         # Application log files
├── tests/                        # Automated Pytest suite
├── pyproject.toml                # Dependencies and packaging metadata
└── README.md                     # Project documentation
```

---

## Installation & Setup

### 1. Prerequisites
- [uv](https://github.com/astral-sh/uv) (recommended) or Python 3.12+

### 2. Clone and Setup Environment
```bash
git clone https://github.com/Arid-P/Advocate-Diary-System.git
cd Advocate-Diary-System

# Create virtual environment and install dependencies using uv
uv sync
```

### 3. Environment Variables (Optional)
To override default database paths or settings, create a `.env` file in the root directory:
```env
DATABASE_URL=sqlite:///database/diary.db
```

---

## Development Milestones

- [x] **Milestone 1**: Configuration & Database Engine (`config.py`, `database.py`)
- [x] **Milestone 2**: Relational Models (`Client` $\rightarrow$ `Case` $\rightarrow$ `Hearing` with cascade rules)
- [x] **Milestone 3**: Pydantic v2 Validation Schemas (`Create`, `Read`, `Update` contracts)
- [ ] **Milestone 4**: Data Access Layer (`crud/` with modern SQLAlchemy 2.0 `select()` statements)
- [ ] **Milestone 5**: FastAPI Route Handlers & Dependency Injection (`routers/`)
- [ ] **Milestone 6**: Application Integration (`main.py`) & Interactive Swagger UI Testing (`/docs`)

**Testing Disclaimer**: The automated test suite (`tests/` directory) was generated entirely by an AI assistant. All backend source code (models, schemas, CRUD, routers, and the FastAPI application) was manually written by the user.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

