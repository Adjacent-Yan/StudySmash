const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5050";

function parseError(res, body) {
  const msg =
    (body && typeof body === "object" && body.error) ||
    res.statusText ||
    "Request failed";

  const err = new Error(msg);
  err.status = res.status;
  return err;
}

export function getToken() {
  return localStorage.getItem("edugame_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("edugame_token", token);
  else localStorage.removeItem("edugame_token");
}

export function getStoredUser() {
  const raw = localStorage.getItem("edugame_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem("edugame_user", JSON.stringify(user));
  else localStorage.removeItem("edugame_user");
}

export function clearSession() {
  setToken(null);
  setStoredUser(null);
}

export async function api(path, options = {}) {
  const { body, headers: hdr = {}, ...rest } = options;
  const headers = { ...hdr };

  let finalBody = body;

  if (
    body !== undefined &&
    body !== null &&
    typeof body === "object" &&
    !(body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
    finalBody = JSON.stringify(body);
  }

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: finalBody,
  });

  const text = await res.text();

  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    throw parseError(res, data);
  }

  return data;
}

/* Auth */
export function loginRequest(payload) {
  return api("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function registerRequest(payload) {
  return api("/api/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function fetchMe() {
  return api("/api/me", {
    method: "GET",
  });
}

/* Dashboard */
export function fetchDashboard() {
  return api("/api/dashboard", {
    method: "GET",
  });
}

/* Quiz browse / quiz detail */
export function fetchQuizzes() {
  return api("/api/quizzes", {
    method: "GET",
  });
}

export function fetchQuiz(quizId) {
  return api(`/api/quizzes/${quizId}`, {
    method: "GET",
  });
}

export function createQuiz(payload) {
  return api("/api/quizzes", {
    method: "POST",
    body: payload,
  });
}

/* OpenTDB API quiz mode */
export function fetchCategories() {
  return fetch("https://opentdb.com/api_category.php").then((res) =>
    res.json()
  );
}

export function generateQuiz(payload) {
  return api("/api/gameplay/generate", {
    method: "POST",
    body: payload,
  });
}

/* Saved quizzes */
export function toggleSaveQuiz(quizId) {
  return api(`/api/quizzes/${quizId}/toggle-save`, {
    method: "POST",
  });
}

/* Game sessions for custom quizzes */
export function startGameSession(payload) {
  return api("/api/game-sessions", {
    method: "POST",
    body: payload,
  });
}

export function submitGameAnswer(sessionId, payload) {
  return api(`/api/game-sessions/${sessionId}/answers`, {
    method: "POST",
    body: payload,
  });
}

export function finishGameSession(sessionId, payload) {
  return api(`/api/game-sessions/${sessionId}/finish`, {
    method: "POST",
    body: payload,
  });
}

/* Leaderboard / progress */
export function fetchLeaderboard(period = "overall") {
  return api(`/api/leaderboard?period=${period}`, {
    method: "GET",
  });
}

export function fetchProgress() {
  return api("/api/my-progress", {
    method: "GET",
  });
}

/* Formatting helpers */
export function formatPoints(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "0";
  return n.toLocaleString();
}

export function formatHighScore(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}