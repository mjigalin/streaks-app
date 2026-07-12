# STREAKS

A daily health and lifestyle tracker with a minimal, Typeform-inspired interface. Log 12 metrics per day, track streaks, and export your full history as CSV for AI analysis.

**Live app:** _(URL will be added after Railway deploy)_

## Login Credentials

| Field    | Value                |
|----------|----------------------|
| Email    | `mattjigs@gmail.com` |
| Password | `Streaks2026!`       |

## Quick Start (Local)

```bash
# Install dependencies
npm install

# Copy environment file and adjust if needed
cp .env.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the credentials above.

## How to Use

1. **Log in** at `/login` with your email and password.
2. **Track today's metrics** on the dashboard — tap sliders, bubbles, and chips to log each metric.
3. **Auto-save** — changes save automatically 1 second after your last interaction. The bottom bar shows save status and completion count (e.g. "8 of 12 tracked").
4. **Navigate dates** — use ← → arrows in the header to view or edit previous days.
5. **Streaks** — each metric shows a 🔥 badge with consecutive days tracked. The banner at top shows your overall streak (all 12 metrics logged).
6. **Export** — tap **Export** in the header to download a CSV of your full history for LLM analysis.

## Metrics Tracked

**Priority:** Skin Score, Stress, Workload, Busyness  
**Habits:** Sleep, Food, Alcohol, Water, Workout, Reading  
**Supplementary:** Weight (kg), Notes

## Tech Stack

- Next.js 14 (App Router)
- SQLite via `better-sqlite3`
- Tailwind CSS + Framer Motion
- JWT cookie auth
- Deployed on Railway

## Environment Variables

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `JWT_SECRET`        | Random 32+ char string for JWT signing |
| `USER_EMAIL`        | Login email                          |
| `USER_PASSWORD_HASH`| bcrypt hash of password              |
| `DATABASE_PATH`     | Path to SQLite file (`/data/streaks.db` on Railway) |

Generate a password hash:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 10).then(h => console.log(h))"
```

## Railway Deployment

The app uses a persistent volume at `/data` for SQLite storage. Set these env vars in Railway:

```
JWT_SECRET=<your-secret>
USER_EMAIL=mattjigs@gmail.com
USER_PASSWORD_HASH=<bcrypt-hash>
DATABASE_PATH=/data/streaks.db
NODE_ENV=production
```

Attach a volume mounted at `/data` in the Railway dashboard.

## CSV Export

Downloaded files are named `streaks-export-YYYY-MM-DD.csv` with one row per day. Drop into ChatGPT or Claude with a prompt like:

> Analyse my health tracking data. Look for correlations between stress, skin score, sleep, and alcohol. Identify trends and actionable insights.

## License

Private — single-user MVP.
