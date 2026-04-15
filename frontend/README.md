# AP Newsletter — Frontend
Premium black & white landing page with real logo.png integration.

---

## 🚀 Quick Start (3 commands)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
ap-newsletter/
├── public/
│   └── logo.png              ← Your real logo (used as favicon)
├── src/
│   ├── assets/
│   │   └── logo.png          ← Your real logo (used in components)
│   ├── components/
│   │   ├── APLogo.jsx        ← Logo component (uses logo.png)
│   │   ├── LoadingScreen.jsx ← Animated intro screen
│   │   ├── Navbar.jsx        ← Fixed top navigation
│   │   ├── Hero.jsx          ← Hero section + typing animation
│   │   ├── Ticker.jsx        ← Scrolling marquee strips
│   │   ├── About.jsx         ← About section
│   │   ├── Features.jsx      ← 4 feature cards
│   │   ├── Waitlist.jsx      ← Email capture (white section)
│   │   ├── Social.jsx        ← Instagram / LinkedIn / X
│   │   ├── Results.jsx       ← Live subscriber list display
│   │   ├── Footer.jsx        ← Footer
│   │   └── useReveal.js      ← Scroll reveal hook
│   ├── App.jsx               ← Root component + state management
│   ├── main.jsx              ← React entry point
│   └── index.css             ← Global styles + animations
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🖼 Logo Usage

The logo is `logo.png` saved in two places:
- `public/logo.png` — used as the browser favicon
- `src/assets/logo.png` — used by `APLogo.jsx` in all sections

The `APLogo` component accepts two props:

| Prop | Default | Description |
|---|---|---|
| `size` | `60` | Width & height in pixels |
| `inverted` | `false` | `true` = CSS invert (white logo on dark bg) |

Usage examples:
```jsx
// On dark background (hero, loading, footer)
<APLogo size={108} inverted={true} />

// On white background (waitlist section)
<APLogo size={72} inverted={false} />
```

To replace the logo later, just swap out:
- `public/logo.png`
- `src/assets/logo.png`

---

## 🔌 Connect Your Backend

In `src/App.jsx`, find this comment:

```js
// TODO: replace with real API call when backend is ready:
// fetch('/api/waitlist', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ email: normalized }),
// })
```

Uncomment and wire to your backend. The endpoint should accept `{ email: string }`.

---

## 📝 Where to Edit Content

| Section | File | What to change |
|---|---|---|
| Hero headline phrases | `src/components/Hero.jsx` | `PHRASES` array |
| About copy | `src/components/About.jsx` | paragraph text |
| Feature cards | `src/components/Features.jsx` | `CARDS` array |
| Waitlist headline | `src/components/Waitlist.jsx` | h2 text |
| Social links | `src/components/Social.jsx` | `href` values |
| Footer links | `src/components/Footer.jsx` | Privacy / Terms hrefs |

---

## ☁️ Deploy (handles 200k+ users)

**Vercel (recommended):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Drag dist/ folder to app.netlify.com/drop
```

**Build output:**
```bash
npm run build   # outputs to dist/
npm run preview # preview production build locally
```

---

Built with React 18 + Vite 5 + Tailwind CSS 3
