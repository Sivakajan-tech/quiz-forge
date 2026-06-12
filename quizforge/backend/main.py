import uuid
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from models import (
    Difficulty,
    QuizStartRequest,
    QuizStartResponse,
    AnswerRequest,
    AnswerResponse,
    SessionState,
    ChatRequest,
    ChatResponse,
    ChatMessage,
)
from quiz_engine import generate_questions, generate_questions_from_context
from foundry_iq_service import list_supported_topics, ingest_and_get_context
from tutor_engine import generate_tutor_response, MAX_EXCHANGES
from document_processor import extract_text_from_pdf

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
        context=context,
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


@app.post("/api/quiz/start-from-upload", response_model=QuizStartResponse)
async def start_quiz_from_upload(
    file: Optional[UploadFile] = File(None),
    content_text: Optional[str] = Form(None),
    difficulty: str = Form("medium"),
    num_questions: int = Form(5),
):
    if not file and not content_text:
        raise HTTPException(status_code=400, detail="Provide either a file or content_text")

    if num_questions < 1 or num_questions > 10:
        raise HTTPException(status_code=400, detail="num_questions must be between 1 and 10")

    raw_text = ""
    source_name = "uploaded document"

    if file:
        file_bytes = await file.read()
        if file.filename.lower().endswith(".pdf"):
            raw_text = extract_text_from_pdf(file_bytes)
        else:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        source_name = file.filename or "uploaded document"
    elif content_text:
        raw_text = content_text
        source_name = "pasted content"

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from the provided content")

    context = ingest_and_get_context(raw_text, source_name)
    if not context["grounded"]:
        raise HTTPException(status_code=422, detail=context.get("warning", "No content extracted"))

    diff = Difficulty(difficulty)
    questions, context = generate_questions_from_context(context, diff, num_questions)

    session_id = str(uuid.uuid4())
    session = SessionState(
        session_id=session_id,
        topic=source_name,
        difficulty=diff,
        questions=questions,
        context=context,
    )
    _sessions[session_id] = session

    return QuizStartResponse(
        session_id=session_id,
        topic=source_name,
        difficulty=diff,
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


@app.post("/api/quiz/chat", response_model=ChatResponse)
def chat_with_tutor(req: ChatRequest):
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    question = next((q for q in session.questions if q.id == req.question_id), None)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if req.question_id not in session.answers:
        raise HTTPException(status_code=400, detail="Question not yet answered")

    if session.answers[req.question_id] == question.correct_key:
        raise HTTPException(status_code=400, detail="Tutor is only available for incorrect answers")

    qid_key = str(req.question_id)
    history = session.chat_histories.get(qid_key, [])

    num_exchanges = len([m for m in history if m["role"] == "user"])
    if num_exchanges >= MAX_EXCHANGES:
        raise HTTPException(status_code=400, detail="Maximum conversation length reached")

    facts = session.context.get("facts", [])
    user_answer = session.answers[req.question_id]

    reply = generate_tutor_response(
        question=question,
        user_answer=user_answer,
        facts=facts,
        conversation_history=history,
        user_message=req.message,
    )

    history.append({"role": "user", "content": req.message})
    history.append({"role": "assistant", "content": reply})
    session.chat_histories[qid_key] = history

    return ChatResponse(
        reply=reply,
        messages=[ChatMessage(role=m["role"], content=m["content"]) for m in history],
    )
