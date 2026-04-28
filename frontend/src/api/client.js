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
    if (body !== undefined && body !== null && typeof body === "object" && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
        finalBody = JSON.stringify(body);
    }
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;

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

export const loginRequest = (payload) => api("/api/auth/login", { method: "POST", body: payload });
export const registerRequest = (payload) => api("/api/auth/register", { method: "POST", body: payload });
export const fetchMe = () => api("/api/me");
export const fetchDashboard = () => api("/api/dashboard");
export const fetchQuizzes = () => api("/api/quizzes");
export const fetchQuiz = (quizId) => api(`/api/quizzes/${quizId}`);
export const createQuiz = (payload) => api("/api/quizzes", { method: "POST", body: payload });
export const startGameSession = (payload) => api("/api/game-sessions", { method: "POST", body: payload });
export const submitGameAnswer = (sessionId, payload) => api(`/api/game-sessions/${sessionId}/answers`, { method: "POST", body: payload });
export const finishGameSession = (sessionId, payload) => api(`/api/game-sessions/${sessionId}/finish`, { method: "POST", body: payload });
export const fetchLeaderboard = (period = "overall") => api(`/api/leaderboard?period=${period}`);
export const fetchProgress = () => api("/api/my-progress");

export function formatPoints(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "0";
  return n.toLocaleString();
}

export function formatHighScore(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
