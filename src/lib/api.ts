const API_BASE = import.meta.env.VITE_API_URL || "https://qwizza-production.up.railway.app";

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

export const api = {
  signup: (email: string, password: string, role: string) =>
    request("/user/signup", { method: "POST", body: JSON.stringify({ email, password, role }) }),

  login: (email: string, password: string) =>
    request("/user/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  createGame: (name: string, question_duration: number, scheduled_at: string) =>
    request("/games", { method: "POST", body: JSON.stringify({ name, question_duration, scheduled_at }) }),

  getHostGames: () => request("/games/host"),

  getGameById: (id: string) => request(`/games/${id}/quiz`),
  addQuiz: (pin: string, title: string) =>
    request(`/games/${pin}/quiz`, { method: "POST", body: JSON.stringify({ title }) }),

  addQuestions: (quizId: number, questions: { content: string; correct_answer: string }[]) =>
    request(`/quizzes/${quizId}/questions`, { method: "POST", body: JSON.stringify({ "items" : questions }) }),

  loadQuiz: (quizId: number) =>
    request(`/quizzes/${quizId}`),

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
