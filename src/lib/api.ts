const API_BASE = import.meta.env.VITE_API_URL
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL 
const OPENROUTER_BASE_URL = import.meta.env.VITE_OPENROUTER_BASE_URL

function getToken(): string | null {
  return localStorage.getItem("qwizza_token");
}

export function setToken(token: string) {
  localStorage.setItem("qwizza_token", token);
}

export function clearToken() {
  localStorage.removeItem("qwizza_token");
}

export function getStoredUser() {
  const raw = localStorage.getItem("qwizza_user");
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: { id: number; email: string; role: string }) {
  localStorage.setItem("qwizza_user", JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem("qwizza_user");
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

type GeneratedQuestion = {
  content: string;
  correct_answer: string;
  answers: string[];
};

function normalizeGeneratedQuestions(data: unknown): GeneratedQuestion[] {
  const rawQuestions =
    Array.isArray(data) ? data :
    typeof data === "object" && data !== null && Array.isArray((data as { questions?: unknown[] }).questions)
      ? (data as { questions: unknown[] }).questions
      : [];

  return rawQuestions
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const question = item as Partial<GeneratedQuestion>;
      const answers = Array.isArray(question.answers) ? question.answers.filter((answer) => typeof answer === "string") : [];

      if (
        typeof question.content !== "string" ||
        typeof question.correct_answer !== "string" ||
        answers.length !== 4
      ) {
        return null;
      }

      return {
        content: question.content.trim(),
        correct_answer: question.correct_answer.trim(),
        answers: answers.map((answer) => answer.trim()).filter(Boolean),
      };
    })
    .filter((question): question is GeneratedQuestion => Boolean(question && question.content && question.correct_answer && question.answers.length === 4));
}

async function generateQuestionsWithOpenRouter(prompt: string): Promise<GeneratedQuestion[]> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("missing OpenRouter API key. set VITE_OPENROUTER_API_KEY in your env file.");
  }

  const res = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Qwizza Quiz Generator",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            'Return only valid JSON in the exact shape {"questions":[{"content":"string","correct_answer":"string","answers":["string","string","string","string"]}]}. Each question must have exactly 4 answer choices and exactly one correct answer that appears in answers.',
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || body.message || `Request failed: ${res.status}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content || typeof content !== "string") {
    throw new Error("OpenRouter returned no completion.");
  }

  const cleaned = content.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
  const parsed = JSON.parse(cleaned);
  const questions = normalizeGeneratedQuestions(parsed);

  if (questions.length === 0) {
    throw new Error("OpenRouter returned invalid question data.");
  }

  return questions;
}

export const api = {
  signup: (email: string, password: string, role: string) =>
    request("/user/signup", { method: "POST", body: JSON.stringify({ email, password, role }) }),

  login: (email: string, password: string) =>
    request("/user/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  createGame: (name: string, question_duration: number, scheduled_at: string) =>
    request("/games", { method: "POST", body: JSON.stringify({ name, question_duration, scheduled_at }) }),

  // Reschedule an existing game
  rescheduleGame: (gameId: number, scheduled_at: string, question_duration?: number) =>
    request(`/games/${gameId}/reschedule`, { method: "PUT", body: JSON.stringify({ scheduled_at, question_duration }) }),

  getHostGames: () => request("/games/host"),

  getGameById: (id: string) => request(`/games/${id}/quiz`),
  addQuiz: (pin: string, title: string) =>
    request(`/games/${pin}/quiz`, { method: "POST", body: JSON.stringify({ title }) }),

  addQuestions: (quizId: number, questions: { content: string; correct_answer: string }[]) =>
    request(`/quizzes/${quizId}/questions`, { method: "POST", body: JSON.stringify({ "items" : questions }) }),

  generateQuestions: (prompt: string) => generateQuestionsWithOpenRouter(prompt),

  loadQuiz: (quizId: number) =>
    request(`/quizzes/${quizId}`),

  deleteQuiz: (quizId: number) =>
    request(`/quizzes/${quizId}`, { method: "DELETE" }),

  updateQuestion: (questionId: number, content: string, correct_answer: string) =>
    request(`/questions/${questionId}`, { method: "PUT", body: JSON.stringify({ content, correct_answer }) }),

  updateAnswer: (answerId: number, content: string) =>
    request(`/answers/${answerId}`, { method: "PUT", body: JSON.stringify({ content }) }),

  initializeGame: (pin: string) => request(`/game/initialize/${pin}`),

  startGame: (pin: string) => 
    request(`/games/${pin}/start`, { method: "POST" }),

  joinGame: (pin: string, nickname: string) =>
    request(`/game/join/${pin}`, { method: "POST", body: JSON.stringify({ nickname }) }),

  addPlayer: (pin: string, email: string) =>
    request(`/games/${pin}/players`, { method: "POST", body: JSON.stringify({ email }) }),

  getNicknames: (gameId: number) =>
    request(`/games/${gameId}/nicknames`),

  getFinalLeaderboard: (gameId: number) =>
    request(`/games/${gameId}/leaderboard/final`),

  deleteNickname: (gameId: number, nicknameId: number) =>
    request(`/games/${gameId}/nicknames/${nicknameId}`, { method: "DELETE" }),
};
