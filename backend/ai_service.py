"""All AI logic lives here: one prompt per feature, strict JSON, Pydantic validation."""
import os, json, re
from datetime import date
from anthropic import Anthropic
from dotenv import load_dotenv
import schemas as S

load_dotenv()
MODEL = os.getenv("CLAUDE_MODEL", "claude-haiku-4-5-20251001")

class AIError(Exception):
    """Raised for any AI problem; routers turn it into a friendly 503."""

def _call(system: str, user: str, schema):
    key = os.getenv("ANTHROPIC_API_KEY")
    if not key:
        raise AIError("AI is not configured: add ANTHROPIC_API_KEY to backend/.env")
    try:
        resp = Anthropic(api_key=key).messages.create(
            model=MODEL, max_tokens=1200,
            system=system + " Respond with ONLY valid JSON. No markdown, no commentary.",
            messages=[{"role": "user", "content": user}],
        )
        raw = resp.content[0].text
        match = re.search(r"\{.*\}", raw, re.S)          # tolerate stray text around the JSON
        return schema.model_validate(json.loads(match.group(0)))
    except (ValueError, AttributeError):                  # bad JSON / failed validation
        raise AIError("The AI returned an unexpected format. Please try again.")
    except Exception as e:                                # network, auth, rate limit...
        raise AIError(f"AI service unavailable: {e}")

def _today(): return f"Today is {date.today().isoformat()}."

# ---- Prompts (one per feature) ----
TASKS_SHAPE = '{"tasks":[{"title":str,"description":str,"priority":"Low"|"Medium"|"High","due_date":"YYYY-MM-DD"|null}]}'

def generate_tasks(text):
    return _call(f"Turn the user's description into 3-8 concrete, actionable tasks. {_today()} "
                 f"Suggest realistic due dates. JSON shape: {TASKS_SHAPE}", text, S.TasksOut)

def suggest_priority(t):
    return _call(f"Decide a priority for this task using urgency, due date and impact. {_today()} "
                 'JSON shape: {"priority":"Low"|"Medium"|"High","reason":"one short sentence"}',
                 t.model_dump_json(), S.PriorityOut)

def summarize(t):
    return _call('Summarise the task in 1-2 clear sentences. JSON shape: {"summary":str}',
                 t.model_dump_json(), S.SummaryOut)

def breakdown(t):
    return _call(f"Break this large task into 3-7 smaller ordered subtasks. {_today()} "
                 f"Keep due dates on or before the parent's. JSON shape: {TASKS_SHAPE}",
                 t.model_dump_json(), S.TasksOut)
