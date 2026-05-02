const API_BASE = import.meta.env.VITE_API_URL ?? "";

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

export function loginRequest(payload) {
    return api("/api/auth/login", { method: "POST", body: payload });
}

export function registerRequest(payload) {
    return api("/api/auth/register", { method: "POST", body: payload });
}

export function fetchDashboard() {
    return api("/api/dashboard", { method: "GET" });
}

export function fetchCategories() {
    return fetch("https://opentdb.com/api_category.php").then(res => res.json());
}

export function generateQuiz(payload) {
    return api("/api/gameplay/generate", { method: "POST", body: payload });
}

export function toggleSaveQuiz(quizId) {
    return api(`/api/quizzes/${quizId}/toggle-save`, { method: "POST" });
}

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
