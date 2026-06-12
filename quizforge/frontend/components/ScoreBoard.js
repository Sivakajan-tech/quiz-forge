export default function ScoreBoard({ score, total, topic, difficulty, grounded, confidence, onRestart }) {
  const percent = Math.round((score / total) * 100);

  const grade =
    percent >= 80 ? { label: "Excellent!", color: "text-emerald-600", emoji: "🏆", bg: "from-emerald-50 to-green-100" }
    : percent >= 60 ? { label: "Good job!", color: "text-indigo-600", emoji: "👍", bg: "from-indigo-50 to-purple-100" }
    : percent >= 40 ? { label: "Keep practicing!", color: "text-amber-600", emoji: "📚", bg: "from-amber-50 to-yellow-100" }
    : { label: "Try again!", color: "text-rose-500", emoji: "💪", bg: "from-rose-50 to-red-100" };

  const circumference = 2 * Math.PI * 15.9;
  const dash = (percent / 100) * circumference;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${grade.bg} flex items-center justify-center p-6`}>
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center border border-purple-100">

        <div className="text-6xl mb-4">{grade.emoji}</div>
        <h2 className={`text-4xl font-extrabold mb-1 ${grade.color}`}>{grade.label}</h2>
        <p className="text-gray-400 text-base capitalize mb-8">
          {topic} · <span className="font-semibold">{difficulty}</span>
        </p>

        {/* Score circle */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-indigo-700">{score}<span className="text-2xl text-gray-300">/{total}</span></span>
              <span className="text-sm font-semibold text-gray-400">{percent}% correct</span>
            </div>
          </div>
        </div>

        {/* Foundry IQ badge */}
        <div className={`inline-flex items-center gap-2 text-sm rounded-2xl px-4 py-2 mb-8 font-medium ${
          grounded
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "bg-gray-100 text-gray-500 border border-gray-200"
        }`}>
          <span>{grounded ? "🔵" : "⚪"}</span>
          <span>
            {grounded
              ? `Foundry IQ grounded · ${Math.round(confidence * 100)}% confidence`
              : "Foundry IQ: no grounded data for this topic"}
          </span>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
