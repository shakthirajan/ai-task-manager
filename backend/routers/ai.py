from fastapi import APIRouter, HTTPException
import ai_service, schemas

router = APIRouter(prefix="/ai", tags=["ai"])

def run(fn, *args):
    try:
        return fn(*args)
    except ai_service.AIError as e:
        raise HTTPException(503, str(e))

@router.post("/generate-tasks", response_model=schemas.TasksOut)
def generate(body: schemas.GenerateIn): return run(ai_service.generate_tasks, body.text)

@router.post("/suggest-priority", response_model=schemas.PriorityOut)
def priority(body: schemas.TaskIn): return run(ai_service.suggest_priority, body)

@router.post("/summarize", response_model=schemas.SummaryOut)
def summary(body: schemas.TaskIn): return run(ai_service.summarize, body)

@router.post("/breakdown", response_model=schemas.TasksOut)
def breakdown(body: schemas.TaskIn): return run(ai_service.breakdown, body)
