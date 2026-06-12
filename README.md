# QuizForge — AI-Powered Adaptive Quiz Platform

An intelligent quiz platform that generates real-time questions on any topic using AI, grounded by Microsoft Foundry IQ to ensure accuracy, with adaptive difficulty that evolves based on your performance.

---

## What It Does

QuizForge is an educational game where users can:
- **Choose any topic** or **upload their own content** (PDF/text) to generate a personalized quiz
- Receive AI-generated multiple-choice questions with explanations
- Experience adaptive difficulty that adjusts based on performance
- Chat with an AI Tutor for deeper understanding after wrong answers

---

## Microsoft IQ Integration — Foundry IQ

QuizForge integrates **Microsoft Foundry IQ** as its intelligence layer for grounded knowledge retrieval.

### How Foundry IQ Is Used

1. **Topic-based quizzes** — When a user selects a topic, Foundry IQ retrieves curated, cited facts from the knowledge base. These facts are injected into the AI prompt to ensure questions are accurate and grounded in verified information.

2. **Upload-based quizzes** — When a user uploads a PDF or pastes text, the document is ingested through the Foundry IQ document processing pipeline. The extracted knowledge is used to ground question generation, ensuring all questions are directly based on the user's source material.

3. **Reducing hallucination** — Without Foundry IQ, the AI model might generate plausible but incorrect questions. By providing grounded context before generation, Foundry IQ ensures factual accuracy and provides confidence scores for transparency.

4. **AI Tutor grounding** — When the AI Tutor explains a wrong answer, it draws on the same Foundry IQ context to provide accurate, fact-based explanations rather than generic responses.

### Architecture

```
User Query → Foundry IQ (knowledge retrieval) → Grounded Context → LLM → Accurate Output
```

This mirrors the production Foundry IQ pattern: connect knowledge sources, enforce accuracy, deliver cited answers.

---

## GitHub Copilot Usage

GitHub Copilot was used throughout the development process:

- **Component scaffolding** — Copilot generated React component boilerplate, form handling logic, and state management patterns
- **API route generation** — Used Copilot to write FastAPI endpoint handlers and Pydantic model definitions
- **Prompt engineering** — Copilot Chat helped iterate on the system prompts for quiz generation and tutor responses
- **Debugging** — Used Copilot Chat to diagnose JSON parsing issues with LLM responses and CORS configuration
- **Styling** — Copilot suggested Tailwind CSS classes for responsive layouts and interactive states
- **Document processing** — Copilot assisted in writing the PDF text extraction and chunking logic

---

## Features

### 1. AI-Generated Quizzes
Fresh questions generated every session — no static question bank. Each question includes 4 multiple-choice options and a detailed explanation.

### 2. Upload Your Own Content
Upload a PDF or paste study notes, and the AI generates a quiz from YOUR material. Perfect for exam preparation and self-assessment.

### 3. Adaptive Difficulty
The system monitors your performance and automatically adjusts difficulty after every 3 questions:
- Scoring well → difficulty increases
- Struggling → difficulty decreases

### 4. AI Tutor Chat
Got a question wrong? Click "Ask AI Tutor" to have a conversation about why. The tutor uses the same grounded knowledge to teach the underlying concept, not just repeat the answer.

### 5. Foundry IQ Confidence Badge
Every quiz session displays a confidence score showing how well-grounded the AI's questions are in verified knowledge.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python, FastAPI |
| Frontend | Next.js, React, Tailwind CSS |
| AI Model | LLM API (swappable — currently uses Groq for fast inference) |
| Knowledge Layer | Microsoft Foundry IQ |
| Document Processing | pdfplumber |

---

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- LLM API key (see .env.example for details)

### Backend
```bash
cd quizforge/backend
pip install -r requirements.txt
# Create .env file from the template
cp ../.env.example .env
# Add your LLM API key to the .env file
uvicorn main:app --reload
```

### Frontend
```bash
cd quizforge/frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Project Structure

```
quizforge/
├── backend/
│   ├── main.py                 # API server and routes
│   ├── quiz_engine.py          # AI question generation with grounding
│   ├── foundry_iq_service.py    # Foundry IQ knowledge retrieval
│   ├── tutor_engine.py         # AI Tutor conversation engine
│   ├── document_processor.py   # PDF/text ingestion for Foundry IQ
│   ├── models.py               # Data schemas
│   └── topic_knowledge.json    # Grounded knowledge base
├── frontend/
│   ├── pages/index.js          # Main quiz application
│   ├── components/
│   │   ├── TopicSelector.js    # Topic picker + content upload
│   │   ├── QuizCard.js         # Question display
│   │   ├── ExplanationPanel.js # Answer feedback + AI Tutor
│   │   ├── TutorChat.js        # Conversational tutor interface
│   │   └── ScoreBoard.js       # Final results
│   └── lib/api.js              # API client
└── .env.example                # Environment template
```
