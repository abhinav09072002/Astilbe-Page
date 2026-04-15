// ─── Auth API Utilities ───────────────────────────────────────────────────────
// Centralizes all API calls. Uses VITE_API_URL env var (proxied in dev).

const BASE = import.meta.env.VITE_API_URL || '/api'

// ── helpers ───────────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('ap_token')
}

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`)
  return data
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export async function apiSignup({ name, email, password }) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  return handleResponse(res)
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return handleResponse(res)
}

export async function apiGetMe() {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: authHeaders(),
  })
  return handleResponse(res)
}

// ── Ideas endpoints ───────────────────────────────────────────────────────────

export async function apiSaveIdea(text) {
  const res = await fetch(`${BASE}/auth/save-idea`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text }),
  })
  return handleResponse(res)
}

export async function apiDeleteIdea(id) {
  const res = await fetch(`${BASE}/auth/save-idea/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return handleResponse(res)
}

// ── Chat endpoint (reused from ChatWidget) ────────────────────────────────────
export async function apiChat({ message, sessionId }) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message, sessionId }),
  })
  return handleResponse(res)
}
