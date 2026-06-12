import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import (
    Difficulty,
    QuizStartRequest,
    QuizStartResponse,
    AnswerRequest,
    AnswerResponse,
    SessionState,
)
from quiz_engine import generate_questions
from foundry_iq_mock import list_supported_topics

app = FastAPI(title="QuizForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (keyed by session_id)
_sessions: dict[str, SessionState] = {}

_DIFFICULTY_ORDER = [Difficulty.easy, Difficulty.medium, Difficulty.hard]


@app.get("/health")
def health():
    return {"status": "ok", "service": "QuizForge API"}


@app.get("/api/topics")
def get_topics():
    return {"topics": list_supported_topics()}


@app.post("/api/quiz/start", response_model=QuizStartResponse)
def start_quiz(req: QuizStartRequest):
    if req.num_questions < 1 or req.num_questions > 10:
        raise HTTPException(status_code=400, detail="num_questions must be between 1 and 10")

    questions, context = generate_questions(req.topic, req.difficulty, req.num_questions)

    session_id = str(uuid.uuid4())
    session = SessionState(
        session_id=session_id,
        topic=req.topic,
        difficulty=req.difficulty,
        questions=questions,
    )
    _sessions[session_id] = session

    return QuizStartResponse(
        session_id=session_id,
        topic=req.topic,
        difficulty=req.difficulty,
        questions=questions,
        grounded=context["grounded"],
        foundry_iq_confidence=context["confidence"],
    )


@app.post("/api/quiz/answer", response_model=AnswerResponse)
def submit_answer(req: AnswerRequest):
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    question = next((q for q in session.questions if q.id == req.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if req.question_id in session.answers:
        raise HTTPException(status_code=400, detail="Question already answered")

    selected = req.selected_key.upper()
    correct = selected == question.correct_key

    session.answers[req.question_id] = selected
    session.total_answered += 1
    if correct:
        session.score += 1

    # Adaptive difficulty: re-evaluate after every 3 answers
    new_difficulty = None
    difficulty_changed = False
    if session.total_answered % 3 == 0:
        recent_ids = list(session.answers.keys())[-3:]
        recent_correct = sum(
            1 for qid in recent_ids
            if qid in session.answers
            and next((q for q in session.questions if q.id == qid), None) is not None
            and session.answers[qid] == next(q for q in session.questions if q.id == qid).correct_key
        )

        current_idx = _DIFFICULTY_ORDER.index(session.difficulty)
        if recent_correct >= 2 and current_idx < len(_DIFFICULTY_ORDER) - 1:
            session.difficulty = _DIFFICULTY_ORDER[current_idx + 1]
            new_difficulty = session.difficulty
            difficulty_changed = True
        elif recent_correct <= 1 and current_idx > 0:
            session.difficulty = _DIFFICULTY_ORDER[current_idx - 1]
            new_difficulty = session.difficulty
            difficulty_changed = True

    return AnswerResponse(
        correct=correct,
        correct_key=question.correct_key,
        explanation=question.explanation,
        score=session.score,
        total_answered=session.total_answered,
        new_difficulty=new_difficulty,
        difficulty_changed=difficulty_changed,
    )


@app.get("/api/quiz/session/{session_id}")
def get_session(session_id: str):
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session.session_id,
        "topic": session.topic,
        "difficulty": session.difficulty,
        "score": session.score,
        "total_answered": session.total_answered,
        "total_questions": len(session.questions),
    }
