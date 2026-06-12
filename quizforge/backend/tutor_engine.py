import os
from groq import Groq
from dotenv import load_dotenv
from models import Question

load_dotenv()

_client = Groq(api_key=os.environ["GROQ_API_KEY"])
_MODEL = "llama-3.1-8b-instant"

MAX_EXCHANGES = 4


def _build_tutor_system_prompt(question: Question, user_answer: str, facts: list[str]) -> str:
    user_answer_text = next(
        (opt.text for opt in question.options if opt.key == user_answer), user_answer
    )
    correct_answer_text = next(
        (opt.text for opt in question.options if opt.key == question.correct_key), question.correct_key
    )

    facts_block = "\n".join(f"- {f}" for f in facts) if facts else "No additional facts available."

    return f"""You are a patient, encouraging AI tutor. A student got a quiz question wrong and wants to understand why.

Context:
- Question: {question.question}
- Their answer: {user_answer} ({user_answer_text})
- Correct answer: {question.correct_key} ({correct_answer_text})
- Explanation: {question.explanation}
- Grounding facts:
{facts_block}

Rules:
- Be concise (2-4 sentences per reply)
- Don't just repeat the explanation — teach the underlying concept
- Use analogies or examples when helpful
- Be encouraging, not condescending
- If they seem to understand, congratulate them and suggest moving on"""


def generate_tutor_response(
    question: Question,
    user_answer: str,
    facts: list[str],
    conversation_history: list[dict],
    user_message: str,
) -> str:
    system_prompt = _build_tutor_system_prompt(question, user_answer, facts)

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": user_message})

    response = _client.chat.completions.create(
        model=_MODEL,
        messages=messages,
    )

    return response.choices[0].message.content.strip()
