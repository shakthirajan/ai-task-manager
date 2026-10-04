# ✨ AI-Powered Task Manager

A responsive task manager with four Claude-powered features, built with React, FastAPI and the Anthropic Claude API.

## Features
- Add, edit, delete, complete/reopen tasks; priority (Low/Medium/High), due date, status (Todo/In Progress/Done)
- Search, and filter by status, priority, due date (overdue / today / next 7 days)
- Dashboard: total, completed, pending, overdue + status progress bars
- **AI:** Description → Tasks, Suggest Priority, Summarise, Break Down (all backend endpoints)

## Tech Stack
React (Vite) · FastAPI · SQLAlchemy + SQLite · Pydantic · Anthropic Claude API (`anthropic` SDK)

## Architecture
```
React UI ──fetch──▶ FastAPI (routers/tasks.py, routers/ai.py) ──▶ SQLite
                                   └──▶ ai_service.py ──▶ Claude API
```
The API key lives only in `backend/.env`; the browser never sees it.

## Setup
**Prerequisites:** Python 3.10+, Node.js 18+, and an Anthropic API key (https://console.anthropic.com).

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                 # then put your ANTHROPIC_API_KEY in .env
uvicorn main:app --reload                            # http://localhost:8000/docs
```
**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                                          # http://localhost:5173
```

## Environment Variables
| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | backend | Claude API key |
| `CLAUDE_MODEL` | backend | Model name (default `claude-haiku-4-5-20251001`) |
| `FRONTEND_ORIGINS` | backend | Comma-separated allowed CORS origins |
| `VITE_API_URL` | frontend | Backend base URL |

## API Endpoints
`GET/POST /tasks` · `GET/PUT/DELETE /tasks/{id}` · `PATCH /tasks/{id}/complete` · `GET /tasks?search=&status=&priority=&due=` · `GET /dashboard/stats`
`POST /ai/generate-tasks` · `POST /ai/suggest-priority` · `POST /ai/summarize` · `POST /ai/breakdown`

## AI Tool/API Used
**Anthropic Claude API** via the official Python SDK, default model Claude Haiku 4.5 (fast and cheap; change with `CLAUDE_MODEL`). Every feature has its own prompt in `ai_service.py`, asks for strict JSON, and the reply is validated with Pydantic. Bad output or API failure returns a friendly 503 message.
1. **Description → Tasks:** paragraph in, 3-8 structured tasks out (title, description, priority, due date); user edits/deselects in a preview, then adds.
2. **Suggest Priority:** sends title/description/due date, returns a priority plus one-line reason; "Apply" saves it.
3. **Summarise:** returns a 1-2 sentence summary.
4. **Break Down:** returns 3-7 subtasks; add as separate tasks or as a checklist in the parent's description.

## Deployment
**Backend (Render):** New Web Service → root `backend` → build `pip install -r requirements.txt` → start `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set `ANTHROPIC_API_KEY` and `FRONTEND_ORIGINS=https://your-app.vercel.app`. (Free-tier SQLite resets on redeploy; use a persistent disk or Postgres for real use. Railway works the same way.)
**Frontend (Vercel/Netlify):** import repo → root `frontend` → build `npm run build` → output `dist` → set `VITE_API_URL` to the Render URL.
