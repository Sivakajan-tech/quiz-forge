const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchTopics() {
  const res = await fetch(`${BASE_URL}/api/topics`);
  if (!res.ok) throw new Error("Failed to fetch topics");
  return res.json();
}

export async function startQuiz({ topic, difficulty, num_questions }) {
  const res = await fetch(`${BASE_URL}/api/quiz/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, difficulty, num_questions }),
  });
  if (!res.ok) throw new Error("Failed to start quiz");
  return res.json();
}

export async function submitAnswer({ session_id, question_id, selected_key }) {
  const res = await fetch(`${BASE_URL}/api/quiz/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, question_id, selected_key }),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json();
}
