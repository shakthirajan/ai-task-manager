import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import tasks, ai

Base.metadata.create_all(bind=engine)   # create tables on startup
app = FastAPI(title="AI Task Manager")

origins = os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

app.include_router(tasks.router)
app.include_router(ai.router)

@app.get("/")
def health(): return {"status": "ok"}
