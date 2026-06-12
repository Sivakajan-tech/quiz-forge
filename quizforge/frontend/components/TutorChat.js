import { useState, useRef, useEffect } from "react";
import { chatWithTutor } from "@/lib/api";

export default function TutorChat({ sessionId, questionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const data = await chatWithTutor({
        session_id: sessionId,
        question_id: questionId,
        message: userMsg,
      });
      setMessages(data.messages);
    } catch (err) {
      if (err.message.includes("Maximum")) {
        setLimitReached(true);
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I think we've covered this well! Try the next question." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const userCount = messages.filter((m) => m.role === "user").length;
  if (limitReached || userCount >= 4) {
    return (
      <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-center">
        <p className="text-sm text-indigo-700 font-medium">Great chat! Move on to the next question.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 px-4 py-2">
        <span className="text-white text-sm font-semibold">AI Tutor</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="p-4 max-h-60 overflow-y-auto space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center">Ask me anything about this question...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-sm">
              <span className="animate-pulse text-gray-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Why is my answer wrong?"
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400 text-gray-700"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
