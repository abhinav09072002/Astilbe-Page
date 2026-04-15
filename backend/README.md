# AP Newsletter — Backend API
Node.js + Express + MongoDB backend for the AP Newsletter waitlist.

---

## 🗂 Folder Structure

```
ap-backend/
├── server.js                  ← Entry point — start here
├── package.json
├── .env.example               ← Copy to .env and fill in values
├── .gitignore
├── config/
│   ├── db.js                  ← MongoDB connection
│   └── email.js               ← Nodemailer (sends confirmation emails)
├── models/
│   └── Subscriber.js          ← MongoDB schema for subscribers
├── controllers/
│   └── waitlistController.js  ← All business logic
├── middleware/
│   ├── rateLimiter.js         ← Prevents spam/abuse
│   └── adminAuth.js           ← Protects admin routes
└── routes/
    └── index.js               ← All API routes
```

---

## 🚀 Setup From Scratch

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version)

### Step 2 — Install dependencies
```powershell
cd ap-backend
npm install
```

### Step 3 — Create MongoDB database (free)

1. Go to https://cloud.mongodb.com
2. Click **"Try Free"** → sign up
3. Create a **Free Cluster** (M0 Sandbox)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string. It looks like:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/
   ```
6. Replace `<password>` with your actual password

### Step 4 — Create .env file
```powershell
# In the ap-backend folder, create a file called .env
# Copy from .env.example and fill in your values:
```

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ap-newsletter
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=AP Newsletter <your-email@gmail.com>
ADMIN_SECRET=make-this-a-long-random-string-nobody-can-guess
```

### Step 5 — Gmail App Password (for confirmation emails)
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Search for **"App passwords"**
4. Create one → select "Mail" → copy the 16-character password
5. Paste it as `EMAIL_PASS` in your .env

### Step 6 — Run the backend
```powershell
npm run dev
```

You should see:
```
  ▓▓ AP Newsletter Backend
  ✅ Server running on http://localhost:5000
  ✅ MongoDB connected: cluster0.xxxxx.mongodb.net
```

---

## 🔗 API Endpoints

| Method | URL | Description | Auth |
|---|---|---|---|
| POST | `/api/waitlist` | Subscribe email | Public |
| GET | `/api/waitlist/count` | Get subscriber count | Public |
| GET | `/api/health` | Health check | Public |
| GET | `/api/admin/subscribers` | List all subscribers | Admin |
| DELETE | `/api/admin/subscribers/:email` | Remove subscriber | Admin |
| GET | `/api/admin/export` | Download CSV | Admin |

### Subscribe (POST /api/waitlist)
```json
// Request body:
{ "email": "user@example.com", "source": "hero" }

// Success response:
{
  "success": true,
  "message": "You're on the list!",
  "data": {
    "email": "user@example.com",
    "joinedAt": "2026-03-27T...",
    "totalSubscribers": 142
  }
}
```

### Admin — List subscribers
```powershell
# Add header: x-admin-secret: your-secret-from-.env
curl -H "x-admin-secret: your-secret" http://localhost:5000/api/admin/subscribers
```

### Admin — Export CSV
Open in browser:
```
http://localhost:5000/api/admin/export?secret=your-secret
```

---

## 🔌 Frontend Integration (already done)

The frontend (`ap-newsletter2/src/App.jsx`) already calls the backend.
It reads the API URL from an environment variable.

In `ap-newsletter2/` create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

For production, change it to your deployed backend URL:
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## ☁️ Deploy Backend (free options)

### Option A — Railway (recommended, easiest)
1. Go to https://railway.app → sign up free
2. Click **New Project** → **Deploy from GitHub**
3. Push your `ap-backend` folder to GitHub
4. Railway auto-detects Node.js and deploys
5. Go to **Variables** tab → add all your .env variables
6. Railway gives you a URL like `https://ap-backend.railway.app`
7. Update `VITE_API_URL` in your frontend `.env`

### Option B — Render (free tier)
1. Go to https://render.com → sign up
2. New → **Web Service** → connect GitHub
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables in the dashboard

### Option C — Run both locally (development)
Open **two PowerShell windows**:

Window 1 (backend):
```powershell
cd ap-backend
npm run dev
```

Window 2 (frontend):
```powershell
cd ap-newsletter2
npm run dev
```

Frontend: http://localhost:3000
Backend:  http://localhost:5000

---

## 🧪 Test the API

Once backend is running, test in PowerShell:
```powershell
# Subscribe an email
Invoke-WebRequest -Uri "http://localhost:5000/api/waitlist" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com"}'

# Get count
Invoke-WebRequest -Uri "http://localhost:5000/api/waitlist/count"
```

Or visit http://localhost:5000 in your browser to see the API docs.
