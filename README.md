# STREAKS

September 2026 one-month challenge tracker — 16 daily habits in linear order, weekly goals, and month rules.

**Live app:** https://streaks-app-production.up.railway.app

## Login

| Field    | Value                |
|----------|----------------------|
| Email    | `mattjigs@gmail.com` |
| Password | `Hello123`           |

## How to Use

1. **Log in** and work through today's habits top to bottom (Morning → Work → Afternoon → Evening).
2. **Tap a habit** (number circle or text) to mark it done — it fades and moves to the "Done" section at the top.
3. **Scroll up** anytime to see completed items.
4. **Weigh-in (#2)** — enter today's kg; the 7-day average shows beside it.
5. **Rules menu (☰)** — slide-out panel with "Out for the month" and "In place all month" rules.
6. **Weekly popups** — Friday prompts for date night; Sunday prompts for the 45-min review.
7. **← →** in the header to view or complete past days.

## Daily Habits (16)

Morning: wake, weigh-in, water, outdoors, cyclic sighing, protein breakfast, espresso  
Work: 90-min focus block, outreach (Mon–Fri, label varies by day)  
Afternoon: meaningful chore, 2L water  
Evening: workout (label varies by day), shutdown ritual, shower, reading, bed

## Local Dev

```bash
npm install
cp .env.example .env.local   # set USER_PASSWORD_HASH for Hello123
npm run dev
```

## Legacy Data

Previous health metrics (skin score, alcohol, etc.) remain in the SQLite `entries` table but are no longer shown in the UI.
