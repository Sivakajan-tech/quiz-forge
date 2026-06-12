# QuizForge — Project Plan

## What We're Building

An AI-powered adaptive quiz game for the "Creative Apps" hackathon track.

- User picks any topic → AI generates fresh questions on the fly
- Difficulty adjusts automatically based on your score
- A mock Microsoft Foundry IQ module grounds the AI's knowledge before generating questions

---

## Hackathon Requirements

| Requirement | How We Meet It |
|---|---|
| **GitHub Copilot** | Used throughout development to write components, prompts, and routes — document Copilot suggestions as you go |
| **Microsoft IQ Integration** | Mock Foundry IQ module: retrieves curated facts about a topic from a local JSON file before calling the AI. Same architecture as real Foundry IQ, just offline |
| **Creative Application** | AI generates unique questions every session, adaptive difficulty, per-question explanations |

---

## Why Mock Foundry IQ?

Real Foundry IQ (Azure AI Foundry) works like this:
1. You send a topic/query
2. It retrieves grounded, cited facts from enterprise knowledge sources
3. Those facts are injected into your AI prompt to reduce hallucination

Our mock does the same thing but locally:
1. You send a topic
2. It looks up that topic in `topic_knowledge.json`
3. Returns curated facts that get injected into the Claude prompt

The architecture is identical — and that's what judges evaluate.

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React (Vite) | Fast setup, component-based UI |
| Backend | Python + FastAPI | Simple async API, easy AI integration |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) | Best for creative, nuanced question generation |
| Mock IQ | Python module + JSON file | Simulates Foundry IQ grounding locally |

---

## Architecture

```
[React Frontend]
      |
      | HTTP (fetch)
      v
[FastAPI Backend]
      |
      |--- foundry_iq_mock.py     ← Mock Microsoft Foundry IQ
      |         |
      |         v
      |    topic_knowledge.json   ← Curated facts per topic
      |
      |--- quiz_engine.py         ← Builds prompt + calls Claude API
      |
      v
[Anthropic Claude API]  →  returns JSON quiz questions
```

**One quiz session, step by step:**
1. User enters topic + difficulty → `POST /api/quiz/start`
2. Backend calls `foundry_iq_mock.get_context(topic)` → returns grounded facts
3. Backend builds prompt: `"Using this context: {facts}, generate 5 quiz questions about {topic} at {difficulty} level. Return JSON."`
4. Claude returns structured questions with choices, correct answer, and explanation
5. Frontend renders interactive quiz
6. On each answer → `POST /api/quiz/answer` → check result + get explanation
7. After every 3 questions, difficulty auto-adjusts based on score

---

## File Structure

```
quizforge/
├── backend/
│   ├── main.py                   # FastAPI app and route definitions
│   ├── quiz_engine.py            # Claude API calls and prompt construction
│   ├── foundry_iq_mock.py        # Mock Microsoft Foundry IQ service
│   ├── topic_knowledge.json      # Seed knowledge chunks (~10-15 topics)
│   ├── models.py                 # Pydantic models for request/response
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── TopicSelector.jsx     # Topic input + difficulty picker
│   │   │   ├── QuizCard.jsx          # Single question + answer buttons
│   │   │   ├── ScoreBoard.jsx        # Live score + progress bar
│   │   │   └── ExplanationPanel.jsx  # AI explanation after each answer
│   │   └── api.js                # All fetch calls to backend
│   └── package.json
├── .env.example                  # ANTHROPIC_API_KEY placeholder
├── PLAN.md                       # This file
└── README.md
```

---

## Adaptive Difficulty Logic

- User picks starting difficulty: easy / medium / hard
- After every 3 questions:
  - Score ≥ 2/3 → bump difficulty up
  - Score ≤ 1/3 → bump difficulty down
- Backend tracks state per session (in-memory, keyed by `session_id`)

---

## Build Order (when ready to implement)

1. Backend skeleton — `main.py` with `/health` route, FastAPI + CORS setup
2. `foundry_iq_mock.py` — write `topic_knowledge.json`, implement `get_context()`
3. `quiz_engine.py` — Claude API integration, prompt template, JSON parsing
4. API routes — `/api/quiz/start`, `/api/quiz/answer`, `/api/quiz/session/{id}`
5. Frontend scaffold — Vite React app, `api.js` fetch wrapper
6. UI components — TopicSelector → QuizCard → ExplanationPanel → ScoreBoard
7. Adaptive difficulty — wire into session state
8. Polish — loading states, error handling, responsive CSS

---

## Environment Setup (when ready)

```bash
# Backend
cd backend
pip install fastapi uvicorn anthropic python-dotenv pydantic
cp ../.env.example .env    # then add your ANTHROPIC_API_KEY

# Frontend
cd frontend
npm create vite@latest . -- --template react
npm install
npm run dev
```

---

## How to Verify It Works

- Backend health: `curl localhost:8000/health` → `{"status":"ok"}`
- Mock IQ test: `python -c "from foundry_iq_mock import get_context; print(get_context('python'))"`
- Quiz generation: `curl -X POST localhost:8000/api/quiz/start -d '{"topic":"python","difficulty":"easy"}'`
- Full flow: open frontend in browser, play a quiz end-to-end
- Adaptive difficulty: answer all correctly → difficulty should increase after 3 questions
