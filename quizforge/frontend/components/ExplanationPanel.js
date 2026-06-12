import { useState } from "react";
import TutorChat from "@/components/TutorChat";

export default function ExplanationPanel({ result, onNext, isLast, difficultyChanged, newDifficulty, sessionId, questionId }) {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className={`rounded-3xl border-2 p-6 w-full max-w-2xl mx-auto shadow-md ${
      result.correct
        ? "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50"
        : "border-rose-300 bg-gradient-to-br from-rose-50 to-red-50"
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{result.correct ? "✅" : "❌"}</span>
        <span className={`text-lg font-bold ${result.correct ? "text-emerald-700" : "text-rose-700"}`}>
          {result.correct ? "Correct!" : `Wrong — correct answer is ${result.correct_key}`}
        </span>
      </div>

      <p className="text-gray-700 text-base leading-relaxed">{result.explanation}</p>

      {difficultyChanged && (
        <div className="mt-4 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3">
          🎯 Difficulty adjusted to <span className="capitalize font-extrabold">{newDifficulty}</span> based on your performance
        </div>
      )}

      {!result.correct && !showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="mt-4 w-full border-2 border-indigo-300 text-indigo-700 py-2.5 rounded-2xl font-semibold text-base hover:bg-indigo-50 transition-colors"
        >
          🤖 Ask AI Tutor — "Why?"
        </button>
      )}

      {showChat && (
        <TutorChat sessionId={sessionId} questionId={questionId} />
      )}

      <button
        onClick={onNext}
        className="mt-5 w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100"
      >
        {isLast ? "See Results →" : "Next Question →"}
      </button>
    </div>
  );
}
