# AP Newsletter AI — Complete Platform

Premium newsletter website with AI chatbot, full authentication, and user dashboard.

## What's included

- Landing page (Hero, Features, Waitlist, Social proof)
- AI chatbot widget (HuggingFace LLM + RAG)
- Auth system (Signup / Login / JWT / bcrypt)
- User Dashboard (AI chat, ideas generator, saved ideas library)

---

## Project Structure

```
ap-newsletter-ai/
├── backend/
│   ├── server.js
│   ├── .env.example          ← copy to .env and fill in
│   ├── models/
│   │   ├── User.js           ← Auth user model (bcrypt)
│   │   └── Subscriber.js     ← Waitlist subscriber model
│   ├── controllers/
│   │   ├── authController.js ← signup/login/getMe/saveIdea
│   │   └── waitlistController.js
│   ├── routes/
│   │   ├── auth.js           ← /api/auth/*
│   │   ├── chat.js           ← /api/chat, /api/add-data
│   │   └── index.js          ← /api/waitlist/*
│   ├── middleware/
│   │   ├── authMiddleware.js ← JWT protect + token generator
│   │   └── rateLimiter.js
│   └── services/
│       ├── huggingface.js
│       ├── intentRouter.js
│       ├── memory.js
│       └── vectorStore.js
│
└── frontend/
    └── src/
        ├── App.jsx            ← React Router routes
        ├── main.jsx           ← BrowserRouter + AuthProvider
        ├── context/
        │   └── AuthContext.jsx ← Global auth state
        ├── utils/
        │   └── api.js         ← All API fetch calls
        └── components/
            ├── Navbar.jsx     ← Login/Signup/Dashboard buttons
            ├── Login.jsx      ← Login page
            ├── Signup.jsx     ← Signup page
            ├── Dashboard.jsx  ← User dashboard (4 sections)
            ├── ProtectedRoute.jsx
            └── ChatWidget.jsx ← Floating AI chat
```

---

## Quick Setup

### Step 1: Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/ap-newsletter
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-very-long-random-secret-min-32-chars
JWT_EXPIRES_IN=7d
ADMIN_SECRET=any-long-admin-secret
HUGGINGFACE_API_KEY=hf_your_key_here
```

```bash
npm run dev
```

### Step 2: Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000

---

## Auth API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/signup | Create account (name, email, password) |
| POST | /api/auth/login | Login (email, password) → JWT token |
| GET | /api/auth/me | Get current user (Bearer token) |
| POST | /api/auth/save-idea | Save idea to user library |
| DELETE | /api/auth/save-idea/:id | Remove saved idea |

---

## MongoDB Setup (Free)

1. Go to mongodb.com/atlas and sign up
2. Create a free cluster
3. Database Access → Add user → copy credentials
4. Network Access → Add IP → 0.0.0.0/0
5. Clusters → Connect → Drivers → copy URI
6. Paste URI into backend/.env as MONGODB_URI

---

## Free Deployment

**Frontend → Vercel:**
- Push to GitHub, import at vercel.com
- Add env var: `VITE_API_URL=https://your-backend.railway.app/api`

**Backend → Railway:**
- railway.app → New Project → Deploy from GitHub
- Set root directory to `backend`
- Add all env vars from .env.example

---

## Security Notes

- Passwords are bcrypt-hashed (cost factor 12)
- JWTs expire in 7 days by default
- Auth endpoints are rate-limited (10 req/15min)
- JWT_SECRET must be long and random (32+ chars)
- Never commit .env files
