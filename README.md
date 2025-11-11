# Art Nuggets

**Art Nuggets** is a small full-stack web application that helps creatives explore learning content and review contracts using AI.  
It combines a **FastAPI** backend (Python) and a **Next.js** frontend (React).

The backend handles authentication, AI chat endpoints, database operations, and Redis-based token management.  
The frontend communicates with the backend API to deliver a seamless web experience.

---

## Project Links

| Resource | Link |
|-----------|------|
| Report | [here](https://github.com/maxprodigy/Art-Nuggets-Implementation/blob/main/Experimentation%2C%20Metrics%2C%20and%20Results.pdf) |
| Demo Video | [here](https://youtu.be/AD6irfvcrsQ) |

---

## Tech Stack

**Backend**
- Python + FastAPI  
- SQLModel / SQLAlchemy  
- asyncpg  
- Redis  
- Uvicorn  

**Frontend**
- Next.js (React)  
- TypeScript (if present)  
- npm  

**Dev Tools**
- Alembic — database migrations  
- Pytest — backend testing  
- Docker — optional (for Redis or DB)  

---

## Prerequisites

Before running the project, ensure you have the following installed:
- Python 3.10+ (tested on 3.11–3.13)  
- Node.js and npm  
- Git  
- Redis (local or Docker)  
- PostgreSQL (or Supabase remote DB) configured via `.env`

---

## Running the Backend (Windows Example)

1. Open PowerShell or CMD (avoid Git Bash for venv activation).  
2. From the repo root:
   ```bash
   cd C:\Users\peter\Desktop\Art-Nuggets-Implementation\backend
   python -m venv venv

3. Activate the environment:
```bash
PowerShell:
.\venv\Scripts\Activate.ps1
```
4. Install dependencies:

```bash
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt


On Windows, uvloop may fail to build. Add this line to requirements.txt to skip it:

uvloop; sys_platform != "win32"

Run the app:

python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Testing

Run backend tests using:
```bash
pytest
