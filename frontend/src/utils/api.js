// ─── API Utilities ────────────────────────────────────────────────────────────
// All API calls go through here.
//
// In DEVELOPMENT: VITE_API_URL is empty → BASE resolves to '/api'
//   → Vite proxy rewrites to http://localhost:5000/api (no CORS issues)
//
// In PRODUCTION:  VITE_API_URL=https://your-backend.onrender.com/api
//   → BASE resolves to that full URL

// ✅ FIX: was `API_URL` but all fetch calls used `BASE` — now properly defined
const BASE = import.meta.env.VITE_API_URL || '/api';

console.log("API BASE:", BASE); // ✅ DEBUG

// ── Helpers ───────────────────────────────────────────────────────────────────

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
  let data
  try {
    data = await res.json()
  } catch {
    throw new Error(`Server returned non-JSON response (status ${res.status})`)
  }
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

// ── Chat endpoint ─────────────────────────────────────────────────────────────

export async function apiChat({ message, sessionId }) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ message, sessionId }),
  })
  return handleResponse(res)
}

// ── Waitlist endpoint ─────────────────────────────────────────────────────────

export async function apiSubscribe({ email, source = 'waitlist' }) {
  const res = await fetch(`${BASE}/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source }),
  })
  return handleResponse(res)
}

export async function apiGetCount() {
  const res = await fetch(`${BASE}/waitlist/count`)
  return handleResponse(res)
}