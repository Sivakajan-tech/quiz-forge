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

export async function chatWithTutor({ session_id, question_id, message }) {
  const res = await fetch(`${BASE_URL}/api/quiz/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id, question_id, message }),
  });
  if (!res.ok) throw new Error("Failed to send chat message");
  return res.json();
}

export async function startQuizFromUpload({ file, content_text, difficulty, num_questions }) {
  const formData = new FormData();
  if (file) formData.append("file", file);
  if (content_text) formData.append("content_text", content_text);
  formData.append("difficulty", difficulty);
  formData.append("num_questions", String(num_questions));

  const res = await fetch(`${BASE_URL}/api/quiz/start-from-upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to start quiz from upload");
  return res.json();
}
