import { useState, useEffect } from "react";
import TopicSelector from "@/components/TopicSelector";
import QuizCard from "@/components/QuizCard";
import ExplanationPanel from "@/components/ExplanationPanel";
import ScoreBoard from "@/components/ScoreBoard";
import { fetchTopics, startQuiz, submitAnswer } from "@/lib/api";

const PHASE = { SELECT: "select", QUIZ: "quiz", DONE: "done" };

export default function Home() {
  const [phase, setPhase] = useState(PHASE.SELECT);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quiz state
  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState("medium");

  useEffect(() => {
    fetchTopics().then((data) => setTopics(data.topics)).catch(() => {});
  }, []);

  async function handleStart(params) {
    setError(null);
    setLoading(true);
    try {
      const data = await startQuiz(params);
      setSession(data);
      setCurrentIndex(0);
      setResult(null);
      setScore(0);
      setCurrentDifficulty(data.difficulty);
      setPhase(PHASE.QUIZ);
    } catch (e) {
      setError("Failed to generate quiz. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAnswer(selectedKey) {
    const question = session.questions[currentIndex];
    try {
      const data = await submitAnswer({
        session_id: session.session_id,
        question_id: question.id,
        selected_key: selectedKey,
      });
      if (data.correct) setScore((s) => s + 1);
      if (data.difficulty_changed) setCurrentDifficulty(data.new_difficulty);
      setResult({ ...data, selected: selectedKey });
    } catch (e) {
      setError("Failed to submit answer.");
    }
  }

  function handleNext() {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= session.questions.length) {
      setPhase(PHASE.DONE);
    } else {
      setCurrentIndex(nextIndex);
      setResult(null);
    }
  }

  function handleRestart() {
    setPhase(PHASE.SELECT);
    setSession(null);
    setResult(null);
    setScore(0);
  }

  if (phase === PHASE.SELECT) {
    return (
      <>
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm z-50">
            {error}
          </div>
        )}
        <TopicSelector topics={topics} onStart={handleStart} loading={loading} />
      </>
    );
  }

  if (phase === PHASE.DONE) {
    return (
      <ScoreBoard
        score={score}
        total={session.questions.length}
        topic={session.topic}
        difficulty={currentDifficulty}
        grounded={session.grounded}
        confidence={session.foundry_iq_confidence}
        onRestart={handleRestart}
      />
    );
  }

  const question = session.questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 flex flex-col items-center justify-center p-6 gap-5">
      {/* Header bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-1">
        <span className="capitalize font-bold text-indigo-700 text-lg">{session.topic}</span>
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${
          currentDifficulty === "easy" ? "bg-emerald-100 text-emerald-700"
          : currentDifficulty === "medium" ? "bg-amber-100 text-amber-700"
          : "bg-rose-100 text-rose-700"
        }`}>
          {currentDifficulty}
        </span>
        <span className="font-semibold text-gray-600 text-base">Score: <span className="text-indigo-700 font-bold">{score}</span>/{session.questions.length}</span>
      </div>

      <QuizCard
        question={question}
        index={currentIndex}
        total={session.questions.length}
        onAnswer={handleAnswer}
        answered={!!result}
        result={result}
      />

      {result && (
        <ExplanationPanel
          result={result}
          onNext={handleNext}
          isLast={currentIndex === session.questions.length - 1}
          difficultyChanged={result.difficulty_changed}
          newDifficulty={result.new_difficulty}
        />
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}
