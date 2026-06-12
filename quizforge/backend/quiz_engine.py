import json
import os
from groq import Groq
from dotenv import load_dotenv
from models import Question, AnswerOption, Difficulty
from foundry_iq_service import get_context

load_dotenv()

_client = Groq(api_key=os.environ["GROQ_API_KEY"])
_MODEL = "llama-3.1-8b-instant"

_DIFFICULTY_INSTRUCTIONS = {
    Difficulty.easy: "Use simple language. Questions should test basic recall and fundamental concepts.",
    Difficulty.medium: "Questions should test understanding and application of concepts, not just recall.",
    Difficulty.hard: "Questions should be challenging — test deep understanding, edge cases, and nuanced distinctions.",
}

_SYSTEM_PROMPT = """You are a quiz question generator. When given a topic and difficulty level, you generate high-quality multiple-choice quiz questions.

Always respond with valid JSON only — no markdown, no explanation outside the JSON.

Response format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": [
        {"key": "A", "text": "Option A text"},
        {"key": "B", "text": "Option B text"},
        {"key": "C", "text": "Option C text"},
        {"key": "D", "text": "Option D text"}
      ],
      "correct_key": "B",
      "explanation": "Brief explanation of why B is correct and others are wrong."
    }
  ]
}"""


def _build_user_prompt(topic: str, difficulty: Difficulty, num_questions: int, context: dict) -> str:
    difficulty_instruction = _DIFFICULTY_INSTRUCTIONS[difficulty]

    if context["grounded"] and context["facts"]:
        facts_block = "\n".join(f"- {fact}" for fact in context["facts"])
        grounding = f"""Use the following grounded knowledge as your source of truth (provided by Foundry IQ, confidence: {context['confidence']:.0%}): {facts_block}
            Base your questions on these facts. Do not contradict them."""
    else:
        grounding = f"No grounded knowledge is available for this topic (Foundry IQ returned no results). Use your general training knowledge but be accurate."

    return f"""
            Generate {num_questions} multiple-choice quiz questions about: {topic}
            Difficulty: {difficulty.value}
            Instructions: {difficulty_instruction} {grounding}
            Each question must have exactly 4 options (A, B, C, D) with only one correct answer.
            Include a clear explanation for why the correct answer is right.
            Respond with valid JSON only.
        """


def generate_questions(topic: str, difficulty: Difficulty, num_questions: int = 5) -> tuple[list[Question], dict]:
    context = get_context(topic)

    prompt = _build_user_prompt(topic, difficulty, num_questions, context)

    raw = _call_llm(prompt)
    questions = _parse_questions(raw, difficulty)

    return questions, context


def generate_questions_from_context(context: dict, difficulty: Difficulty, num_questions: int = 5) -> tuple[list[Question], dict]:
    topic = context.get("topic", "uploaded document")
    prompt = _build_user_prompt(topic, difficulty, num_questions, context)

    raw = _call_llm(prompt)
    questions = _parse_questions(raw, difficulty)

    return questions, context


def _call_llm(user_prompt: str, retries: int = 2) -> str:
    for attempt in range(retries + 1):
        response = _client.chat.completions.create(
            model=_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
        raw = response.choices[0].message.content.strip()

        # Strip markdown code fences if the model wraps JSON in them
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        try:
            json.loads(raw)
            return raw
        except json.JSONDecodeError:
            if attempt < retries:
                user_prompt = f"Your previous response was not valid JSON. Fix it and return only valid JSON:\n\n{raw}"
            else:
                raise ValueError(f"Model returned invalid JSON after {retries + 1} attempts: {raw[:200]}")

    return ""


def _parse_questions(raw_json: str, difficulty: Difficulty) -> list[Question]:
    data = json.loads(raw_json)
    questions = []

    for q in data["questions"]:
        options = [AnswerOption(key=o["key"], text=o["text"]) for o in q["options"]]
        questions.append(
            Question(
                id=q["id"],
                question=q["question"],
                options=options,
                correct_key=q["correct_key"].upper(),
                explanation=q["explanation"],
                difficulty=difficulty,
            )
        )

    return questions
