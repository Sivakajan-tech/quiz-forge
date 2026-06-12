import { useState } from "react";

const DIFFICULTIES = ["easy", "medium", "hard"];

const DIFFICULTY_COLORS = {
  easy: "bg-emerald-100 border-emerald-400 text-emerald-800",
  medium: "bg-amber-100 border-amber-400 text-amber-800",
  hard: "bg-rose-100 border-rose-400 text-rose-800",
};

export default function TopicSelector({ topics, onStart, loading }) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);

  function handleSubmit(e) {
    e.preventDefault();
    if (!topic.trim()) return;
    onStart({ topic: topic.trim(), difficulty, num_questions: numQuestions });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg border border-purple-100">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-5xl font-extrabold text-indigo-700 tracking-tight mb-2">QuizForge</h1>
          <p className="text-gray-400 text-base">AI-powered quizzes · grounded by Foundry IQ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Topic input */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. python, space, mathematics..."
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-3.5 text-lg focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-gray-800 transition-all placeholder-gray-300"
            />
            {topics?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTopic(t)}
                    className="text-sm bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-4 py-1.5 hover:bg-indigo-100 capitalize font-medium transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Difficulty</label>
            <div className="flex gap-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-3 rounded-2xl border-2 text-base font-semibold capitalize transition-all ${
                    difficulty === d
                      ? DIFFICULTY_COLORS[d]
                      : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Number of questions */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Questions: <span className="text-indigo-600 font-bold text-lg">{numQuestions}</span>
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
              <span>3</span><span>10</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full" />
                Generating Quiz...
              </span>
            ) : (
              "Start Quiz →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
