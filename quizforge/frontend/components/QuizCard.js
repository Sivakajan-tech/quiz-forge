const OPTION_BASE = "w-full text-left border-2 rounded-2xl px-5 py-4 flex items-center gap-4 transition-all font-medium text-lg cursor-pointer";

function getStyle(key, answered, result) {
  if (!answered) return `${OPTION_BASE} border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 text-gray-700`;
  if (key === result?.correct_key) return `${OPTION_BASE} border-emerald-500 bg-emerald-50 text-emerald-800`;
  if (key === result?.selected && !result?.correct) return `${OPTION_BASE} border-rose-400 bg-rose-50 text-rose-700`;
  return `${OPTION_BASE} border-gray-100 bg-gray-50 text-gray-400`;
}

export default function QuizCard({ question, index, total, onAnswer, answered, result }) {
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-auto border border-purple-50">

      {/* Progress bar */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-semibold text-gray-400">Question {index + 1} <span className="text-gray-300">/ {total}</span></span>
        <div className="w-48 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold text-gray-800 mb-7 leading-relaxed">
        {question.question}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => !answered && onAnswer(opt.key)}
            disabled={answered}
            className={getStyle(opt.key, answered, result)}
          >
            <span className="w-9 h-9 rounded-xl border-2 border-current flex items-center justify-center text-sm font-bold shrink-0">
              {opt.key}
            </span>
            <span>{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
