import { useState } from "react";

const DIFFICULTIES = ["easy", "medium", "hard"];

const DIFFICULTY_COLORS = {
  easy: "bg-emerald-100 border-emerald-400 text-emerald-800",
  medium: "bg-amber-100 border-amber-400 text-amber-800",
  hard: "bg-rose-100 border-rose-400 text-rose-800",
};

export default function TopicSelector({ topics, onStart, onStartFromUpload, loading }) {
  const [mode, setMode] = useState("topic");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pastedText, setPastedText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (mode === "topic") {
      if (!topic.trim()) return;
      onStart({ topic: topic.trim(), difficulty, num_questions: numQuestions });
    } else {
      if (!uploadedFile && !pastedText.trim()) return;
      onStartFromUpload({ file: uploadedFile, content_text: pastedText.trim(), difficulty, num_questions: numQuestions });
    }
  }

  const canSubmit = mode === "topic" ? topic.trim() : (uploadedFile || pastedText.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg border border-purple-100">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧠</div>
          <h1 className="text-5xl font-extrabold text-indigo-700 tracking-tight mb-2">QuizForge</h1>
          <p className="text-gray-400 text-base">AI-powered quizzes · grounded by Foundry IQ</p>
        </div>

        {/* Mode toggle */}
        <div className="flex mb-7 bg-gray-100 rounded-2xl p-1">
          <button
            type="button"
            onClick={() => setMode("topic")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "topic" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Choose Topic
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === "upload" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Upload Content
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {mode === "topic" ? (
            /* Topic input */
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
          ) : (
            /* Upload content */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Upload PDF or Text File</label>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => setUploadedFile(e.target.files[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-x-0 top-0 flex items-center justify-center">
                  <span className="bg-white px-3 text-xs text-gray-400 font-medium -translate-y-1/2">OR paste text</span>
                </div>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your study notes, article, or any text here..."
                  rows={5}
                  className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-gray-800 transition-all placeholder-gray-300 resize-none mt-3"
                />
              </div>
              {(uploadedFile || pastedText.trim()) && (
                <div className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  ✓ {uploadedFile ? `File: ${uploadedFile.name}` : `${pastedText.trim().split(/\s+/).length} words pasted`}
                </div>
              )}
            </div>
          )}

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
            disabled={loading || !canSubmit}
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
