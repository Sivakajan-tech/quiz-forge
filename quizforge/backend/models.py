from pydantic import BaseModel
from typing import Optional
from enum import Enum


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class QuizStartRequest(BaseModel):
    topic: str
    difficulty: Difficulty = Difficulty.medium
    num_questions: int = 5


class AnswerOption(BaseModel):
    key: str
    text: str


class Question(BaseModel):
    id: int
    question: str
    options: list[AnswerOption]
    correct_key: str
    explanation: str
    difficulty: Difficulty


class QuizStartResponse(BaseModel):
    session_id: str
    topic: str
    difficulty: Difficulty
    questions: list[Question]
    grounded: bool
    foundry_iq_confidence: float


class AnswerRequest(BaseModel):
    session_id: str
    question_id: int
    selected_key: str


class AnswerResponse(BaseModel):
    correct: bool
    correct_key: str
    explanation: str
    score: int
    total_answered: int
    new_difficulty: Optional[Difficulty] = None
    difficulty_changed: bool = False


class SessionState(BaseModel):
    session_id: str
    topic: str
    difficulty: Difficulty
    questions: list[Question]
    answers: dict = {}
    score: int = 0
    total_answered: int = 0
