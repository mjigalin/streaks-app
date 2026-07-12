# STREAKS — MVP Technical Specification

**Version:** 1.0 (One-Day Build)
**Author:** Matt
**Date:** July 2026
**Stack:** Next.js 14 (App Router) · Railway · SQLite · Tailwind CSS

---

## 1. Product Overview

STREAKS is a daily health and lifestyle tracker inspired by Whoop, built for manual data entry rather than device integration. The MVP serves a single user who logs daily metrics through a clean, minimal, Typeform-inspired interface. Data is stored in an AI-friendly format (exportable CSV) so the full history can be fed to an LLM for trend analysis. A streak system (per-metric tracking flames) encourages daily logging consistency.

**Core philosophy:** Frictionless input. Every screen should feel like tapping through a conversation, not filling out a form. One-tap selections, smart defaults, and minimal typing.

**Day-one user:** `mattjigs@gmail.com` (hardcoded)

**Future vision (out of scope for MVP):** API integrations (Whoop, Apple Health, Garmin), in-app data visualisation and trend charts, multi-user support, metric toggle preferences, AI-powered insights dashboard.

---

## 2. Architecture

### 2.1 Stack Decisions

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + API routes in one project, fast to deploy |
| Hosting | Railway | One-click deploy, managed infra, free tier works for single user |
| Database | SQLite via `better-sqlite3` | Zero config, single-file DB, trivial to back up, fast for single user |
| Auth | Custom minimal (bcrypt + JWT cookie) | No OAuth/third-party complexity for a single hardcoded user |
| Styling | Tailwind CSS + Framer Motion | Rapid UI development, animation primitives out of the box |
| CSV Export | Server-side generation on demand | Flat file export for AI analysis |

### 2.2 Project Structure

```
streaks/
├── app/
│   ├── layout.tsx              # Root layout, font loading, global styles
│   ├── page.tsx                # Landing / redirect to login or dashboard
│   ├── login/
│   │   └── page.tsx            # Login form
│   ├── dashboard/
│   │   └── page.tsx            # Main daily entry + streak view
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts  # POST — validate credentials, set JWT cookie
│       │   └── logout/route.ts # POST — clear cookie
│       ├── entries/
│       │   ├── route.ts        # GET (by date), POST/PUT (upsert daily entry)
│       │   └── [date]/route.ts # GET single day's entry
│       ├── streaks/
│       │   └── route.ts        # GET — calculate current streaks per metric
│       └── export/
│           └── route.ts        # GET — download full history as CSV
├── components/
│   ├── ui/                     # Reusable UI primitives
│   │   ├── BubbleSelect.tsx    # Tap-to-select bubble group (e.g., sleep)
│   │   ├── ToggleChip.tsx      # Yes/No single-tap chip (e.g., alcohol, workout)
│   │   ├── SliderInput.tsx     # 1–10 styled slider (e.g., skin, stress)
│   │   ├── TripleOption.tsx    # Pick-one-of-three (e.g., food, busyness)
│   │   ├── NumberInput.tsx     # Numeric input with unit label (e.g., weight)
│   │   ├── NotesInput.tsx      # Expandable text area
│   │   └── StreakBadge.tsx     # Flame icon + count
│   ├── DailyForm.tsx           # Orchestrates all metric inputs for a day
│   ├── DateNav.tsx             # Top-left date navigator (prev/next day)
│   ├── Header.tsx              # App header with logo, date nav, export button
│   └── SaveBar.tsx             # Bottom sticky bar with save status
├── lib/
│   ├── db.ts                   # SQLite connection + schema init
│   ├── auth.ts                 # JWT helpers (sign, verify, middleware)
│   ├── streaks.ts              # Streak calculation logic
│   └── csv.ts                  # CSV generation from entries table
├── public/
│   └── favicon.ico
├── middleware.ts                # Auth guard — redirect unauthenticated to /login
├── tailwind.config.ts
├── package.json
└── .env                        # JWT_SECRET, hardcoded user hash
```

### 2.3 Database Schema (SQLite)

Single table. One row per date. Upsert on save.

```sql
CREATE TABLE IF NOT EXISTS entries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  date          TEXT NOT NULL UNIQUE,         -- 'YYYY-MM-DD', one entry per day
  
  -- Priority 1: Key health metrics
  skin_score    INTEGER,                      -- 1–10
  stress        INTEGER,                      -- 1–10
  workload      INTEGER,                      -- 1–10
  busyness      TEXT,                         -- 'packed' | 'normal' | 'relaxed'
  
  -- Priority 2: Core daily habits
  sleep         TEXT,                         -- '<8hr' | '8hr' | '8hr+'
  food          TEXT,                         -- 'clean' | 'normal' | 'unhealthy'
  alcohol       INTEGER DEFAULT 0,           -- 0 = no, 1 = yes
  water         INTEGER DEFAULT 0,           -- 0 = no, 1 = yes (good water intake)
  workout       INTEGER DEFAULT 0,           -- 0 = no, 1 = yes
  reading       INTEGER DEFAULT 0,           -- 0 = no, 1 = yes
  
  -- Priority 3: Supplementary
  weight_kg     REAL,                         -- nullable, kg
  notes         TEXT,                         -- free text, nullable
  
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
```

**Why this schema is AI-friendly:** Every column is a named, typed metric. No JSON blobs, no nested structures. The CSV export maps 1:1 to this table — each row is a day, each column is a metric. An LLM can immediately parse column headers and reason about trends across rows.

### 2.4 CSV Export Format

`GET /api/export` returns a CSV file with headers matching the database columns:

```csv
date,skin_score,stress,workload,busyness,sleep,food,alcohol,water,workout,reading,weight_kg,notes
2026-07-12,7,4,6,normal,8hr,clean,0,1,1,1,82.5,"Good day overall"
2026-07-11,5,7,8,packed,<8hr,unhealthy,1,0,0,0,82.8,"Stressful deadline"
```

The file is named `streaks-export-YYYY-MM-DD.csv` and is designed to be dropped directly into an AI conversation with a prompt like: *"Analyse my health tracking data. Look for correlations between stress, skin score, sleep, and alcohol. Identify trends and actionable insights."*

---

## 3. Authentication

### 3.1 Approach

Minimal auth for a single-user MVP. No registration flow. One hardcoded user.

### 3.2 Implementation

**Seeding:** On first server start, the app checks if the user exists. If not, it creates the user record from environment variables.

```
.env:
  JWT_SECRET=<random-32-char-string>
  USER_EMAIL=mattjigs@gmail.com
  USER_PASSWORD_HASH=<bcrypt hash of chosen password>
```

**Login flow:**
1. User visits `/login`, enters email + password.
2. `POST /api/auth/login` validates credentials against the stored bcrypt hash.
3. On success, set an `HttpOnly`, `Secure`, `SameSite=Strict` cookie containing a JWT with `{ email, iat, exp }`. Token expires in 30 days.
4. Redirect to `/dashboard`.

**Middleware:** `middleware.ts` runs on all `/dashboard` and `/api/entries|streaks|export` routes. Verifies JWT. Redirects to `/login` if invalid/missing.

**Logout:** `POST /api/auth/logout` clears the cookie.

### 3.3 Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
```

---

## 4. User Interface Specification

### 4.1 Design Language

**Aesthetic:** Dark, minimal, premium. Inspired by Typeform's conversational flow and Whoop's health-tech aesthetic. Not clinical — warm and encouraging.

**Colour palette:**
- Background: `#0A0A0A` (near-black)
- Card/Surface: `#141414` (elevated surface)
- Border/Divider: `#1E1E1E` (subtle separation)
- Primary text: `#F5F5F5` (off-white)
- Secondary text: `#888888` (muted)
- Accent/Active: `#FF6B35` (warm orange — streak flame colour)
- Success/Selected: `#4ADE80` (green confirmation)
- Destructive/Warning: `#EF4444` (red for negative indicators)

**Typography:**
- Display/Headings: Inter (700 weight) or system sans-serif
- Body: Inter (400/500 weight)
- Data/Metrics: Tabular-nums for alignment

**Spacing:** 8px base grid. Generous whitespace. Each metric group has clear breathing room.

**Border radius:** 12px on cards, 24px (full-round) on bubble/chip selects.

**Animations (Framer Motion):**
- Page load: Metrics fade in sequentially with 50ms stagger, sliding up 12px (Typeform-inspired reveal)
- Tap selection: Scale pulse (1.0 → 1.08 → 1.0 over 200ms) + colour transition (200ms ease)
- Deselection: Gentle fade of colour (150ms)
- Streak badge: Flame icon has a subtle 2s CSS pulse/glow animation loop
- Save confirmation: Bottom bar slides up with a checkmark, fades after 2s
- Date navigation: Cross-fade between days (200ms)

### 4.2 Layout — Dashboard Page (`/dashboard`)

The entire entry experience is a single scrollable page. No modals, no multi-step wizard (for MVP). The page structure from top to bottom:

```
┌──────────────────────────────────────────┐
│  ← prev    📅 Today, 12 Jul 2026    ⬇ Export │  ← Header / DateNav
├──────────────────────────────────────────┤
│                                          │
│  🔥 3-day streak                         │  ← Overall streak banner
│                                          │
│  ── PRIORITY METRICS ──────────────────  │
│                                          │
│  Skin Score              🔥4             │
│  ○ 1  ○ 2  ○ 3  ○ 4  ● 5  ○ 6  ...    │  ← Slider (1–10)
│                                          │
│  Stress Level            🔥7             │
│  ○ 1  ○ 2  ○ 3  ● 4  ○ 5  ○ 6  ...    │  ← Slider (1–10)
│                                          │
│  Workload                🔥7             │
│  ○ 1  ○ 2  ○ 3  ○ 4  ○ 5  ● 6  ...    │  ← Slider (1–10)
│                                          │
│  Today's Busyness        🔥3             │
│  [ Packed ] [ Normal ] [ Relaxed ]       │  ← TripleOption
│                                          │
│  ── DAILY HABITS ──────────────────────  │
│                                          │
│  Sleep Last Night        🔥12            │
│  ( <8hr )  ( 8hr )  ( 8hr+ )            │  ← BubbleSelect (3 bubbles)
│                                          │
│  Food Today              🔥5             │
│  [ Clean ] [ Normal ] [ Unhealthy ]      │  ← TripleOption
│                                          │
│  ┌─────────┐ ┌─────────┐                │
│  │ 🍺 No   │ │ 💧 Yes  │  ...           │  ← ToggleChips row
│  │ Alcohol  │ │ Water   │                │
│  └─────────┘ └─────────┘                │
│  ┌─────────┐ ┌─────────┐                │
│  │ 🏋️ No   │ │ 📖 No   │                │
│  │ Workout  │ │ Reading │                │
│  └─────────┘ └─────────┘                │
│                                          │
│  ── SUPPLEMENTARY ─────────────────────  │
│                                          │
│  Weight   [ 82.5 ] kg                    │  ← NumberInput
│                                          │
│  Notes                                   │
│  ┌──────────────────────────────────┐    │
│  │ Optional notes for the day...    │    │  ← NotesInput (expandable)
│  └──────────────────────────────────┘    │
│                                          │
├──────────────────────────────────────────┤
│          ✓ Saved · 12 of 12 tracked      │  ← SaveBar (sticky bottom)
└──────────────────────────────────────────┘
```

### 4.3 Component Specifications

#### DateNav (Top-Left Navigation)

- Left arrow (`←`) navigates to previous day. Tapping loads that day's saved data (or blank form if no entry).
- Centre shows the current viewing date in human-friendly format: "Today, 12 Jul" or "Yesterday" or "Thu 10 Jul".
- Right arrow (`→`) navigates forward. Disabled/hidden when viewing today.
- On date change: fetch `GET /api/entries/YYYY-MM-DD` and populate form. Cross-fade animation.

#### BubbleSelect (Sleep)

- Exactly 3 evenly spaced circular bubbles in a row.
- Each bubble: ~56px diameter, border `1px solid #1E1E1E`, transparent fill.
- Label text centred below or inside each bubble.
- On tap: selected bubble fills with accent colour (`#4ADE80`), gentle scale pulse animation. Text turns white.
- Only one can be selected. Tapping another deselects the previous.
- Tapping the already-selected bubble deselects it (value becomes null).

#### ToggleChip (Alcohol, Water, Workout, Reading)

- Rectangular chip, rounded-full corners (pill shape).
- Default state: dark surface `#141414`, muted text, subtle border.
- Tapped/Active state: fills with `#4ADE80` (positive actions like water, workout, reading) or `#EF4444` (negative like alcohol = yes). Text goes white. Emoji stays.
- Single tap toggles. No confirmation needed.
- Displays as a 2×2 grid on mobile, 4×1 row on wider screens.
- Default state represents the "negative" or "didn't do it" — e.g., Alcohol defaults to "No" (not tapped), Water defaults to "No" (not tapped). Tapping Alcohol means "Yes, I drank" (turns red). Tapping Water means "Yes, I drank enough water" (turns green).

#### TripleOption (Food, Busyness)

- Three evenly spaced rectangular buttons in a row.
- Similar to BubbleSelect but rectangular with rounded corners (12px).
- Mutually exclusive — one selected at a time.
- Selected state: filled accent colour, white text, scale pulse.

#### SliderInput (Skin Score, Stress, Workload)

- Horizontal slider track with discrete stops at integers 1–10.
- Current value shown as a large number above or beside the slider.
- Thumb styled as a filled circle in accent colour.
- Labels at extremes: Skin "Ouch" (1) → "Perfect" (10). Stress "Bliss" (1) → "Overwhelmed" (10). Workload "Light" (1) → "Maxed" (10).
- Tapping anywhere on the track jumps to that value (no drag required, but drag also works).
- Optional: show discrete dot markers at each integer along the track.

#### NumberInput (Weight)

- Simple numeric input field with `type="number"` and `step="0.1"`.
- Suffix label "kg" shown inside or beside the field.
- Styled as a minimal underline or bordered input matching the dark theme.
- Optional: up/down stepper arrows, or just rely on the keyboard.

#### NotesInput

- Expandable textarea. Single line by default, grows as the user types.
- Placeholder: "Anything to note about today..."
- Monospace or standard font, muted placeholder colour.
- No character limit for MVP.

#### StreakBadge

- Small flame emoji (🔥) or custom SVG flame icon.
- Number beside it showing consecutive days tracked for that specific metric.
- Positioned top-right of each metric's card/section.
- If streak = 0 (not tracked yesterday), badge is hidden for that metric.
- Flame has a subtle orange glow/pulse CSS animation (2s loop, very subtle).

#### SaveBar (Sticky Bottom)

- Fixed to viewport bottom. Thin bar (48px height).
- Background: slightly elevated from page background with a top border or blur backdrop.
- Shows: save status ("Saved ✓", "Saving...", "Unsaved changes") + metric completion count ("8 of 12 tracked").
- Auto-saves 1 second after last interaction (debounced). No manual save button needed.
- On successful save: brief green checkmark flash animation.

### 4.4 Mobile Responsiveness

The primary use case is mobile (quick daily logging on phone). Design mobile-first.

- Max content width: 480px (centred on desktop).
- Touch targets: minimum 44×44px for all tappable elements.
- Toggle chips: 2×2 grid on mobile.
- Sliders: full-width with large thumb (24px) for easy touch.
- Bottom save bar: respects safe area insets (env(safe-area-inset-bottom)).
- No horizontal scrolling ever.

### 4.5 Login Page

Minimal, centred card on the dark background.

- App name "STREAKS" in large display type with a subtle flame accent.
- Email input field.
- Password input field.
- "Log in" button (accent colour).
- No "register" link, no "forgot password" — single user MVP.
- On error: subtle red shake animation on the card + error message below button.
- On success: fade transition to dashboard.

---

## 5. API Specification

### 5.1 `POST /api/auth/login`

**Request body:**
```json
{
  "email": "mattjigs@gmail.com",
  "password": "string"
}
```

**Success (200):**
```json
{ "ok": true }
```
Sets `HttpOnly` cookie `streaks_token` with JWT.

**Failure (401):**
```json
{ "error": "Invalid credentials" }
```

### 5.2 `POST /api/auth/logout`

Clears the `streaks_token` cookie. Returns `{ "ok": true }`.

### 5.3 `GET /api/entries?date=YYYY-MM-DD`

Returns the entry for the given date, or `null` if none exists.

**Response (200):**
```json
{
  "entry": {
    "date": "2026-07-12",
    "skin_score": 7,
    "stress": 4,
    "workload": 6,
    "busyness": "normal",
    "sleep": "8hr",
    "food": "clean",
    "alcohol": 0,
    "water": 1,
    "workout": 1,
    "reading": 1,
    "weight_kg": 82.5,
    "notes": "Good day overall"
  }
}
```

Or `{ "entry": null }` if no entry for that date.

### 5.4 `POST /api/entries`

Creates or updates (upserts) the entry for a given date. Partial updates are fine — only provided fields are updated, others retain existing values or remain null.

**Request body:**
```json
{
  "date": "2026-07-12",
  "skin_score": 7,
  "stress": 4,
  "workload": 6,
  "busyness": "normal",
  "sleep": "8hr",
  "food": "clean",
  "alcohol": 0,
  "water": 1,
  "workout": 1,
  "reading": 1,
  "weight_kg": 82.5,
  "notes": "Good day overall"
}
```

**Response (200):**
```json
{ "ok": true, "date": "2026-07-12" }
```

Upsert logic: `INSERT ... ON CONFLICT(date) DO UPDATE SET ...`, updating `updated_at` timestamp.

### 5.5 `GET /api/streaks`

Calculates the current consecutive-day streak for each trackable metric.

**Logic:** For each metric column, walk backwards from yesterday (or today if today has an entry). Count consecutive days where that column is not null (for scored/choice metrics) or is 1 (for boolean metrics). The streak count represents "how many consecutive days you've tracked this metric."

**Response (200):**
```json
{
  "overall": 5,
  "metrics": {
    "skin_score": 5,
    "stress": 5,
    "workload": 3,
    "busyness": 5,
    "sleep": 12,
    "food": 5,
    "alcohol": 5,
    "water": 5,
    "workout": 5,
    "reading": 2,
    "weight_kg": 1,
    "notes": 4
  }
}
```

`overall` = the minimum streak across all metrics (i.e., how many days in a row you tracked everything).

### 5.6 `GET /api/export`

Returns the full entries table as a downloadable CSV file.

**Response headers:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="streaks-export-2026-07-12.csv"
```

**Body:** CSV content as defined in section 2.4.

---

## 6. Streak System

### 6.1 Rules

- A streak for a metric increments when that metric has a non-null value for consecutive days.
- The streak counts days tracked, not the value. Logging skin_score as 2 and skin_score as 9 are both valid streak days.
- For boolean metrics (alcohol, water, workout, reading): the streak counts days where the field was explicitly set (even if set to 0/no) — the point is that you logged it.
- Streaks reset to 0 if a day is missed entirely (no entry for that date, or that metric is null in the entry).
- The "overall" streak is the longest unbroken run of days where every single metric was tracked.

### 6.2 Display

- Each metric section shows a `StreakBadge` in the top-right corner if the streak is ≥ 1.
- The overall streak shows as a banner at the top of the page: "🔥 5-day streak" with the flame icon animating.
- If overall streak = 0, show encouraging copy: "Start your streak today" instead.

### 6.3 Streak Calculation (Performance)

Since this is single-user with modest data volume (365 rows/year), streaks are calculated on-the-fly via SQL:

```sql
-- For each metric, walk backwards from today counting consecutive non-null days
SELECT date, skin_score, stress, ... FROM entries
ORDER BY date DESC
LIMIT 365;
```

Then iterate in application code, stopping at the first gap for each metric. Cache result in memory for the session; recalculate on save.

---

## 7. Data Flow

### 7.1 Daily Entry Flow

```
User opens app
    → middleware checks JWT cookie
    → valid: redirect to /dashboard
    → invalid: redirect to /login

/dashboard loads:
    1. GET /api/entries?date=today → populate form (or blank)
    2. GET /api/streaks → render streak badges

User interacts with form:
    → each change updates local React state
    → debounced auto-save (1s after last change)
    → POST /api/entries with current form state
    → SaveBar shows "Saving..." → "Saved ✓"
    → Streaks re-fetched after save

User taps ← (previous day):
    → GET /api/entries?date=yesterday → populate form
    → user can edit and save (same POST endpoint)
    → date shown in header updates

User taps Export:
    → GET /api/export → browser downloads CSV
```

### 7.2 Auto-Save Behaviour

- Debounce: 1000ms after the last input change.
- On save: send the full current form state (all metrics) as a POST.
- Server upserts — if an entry for that date exists, it updates; otherwise, it creates.
- No "dirty form" warnings on navigation — auto-save handles it.
- If save fails (network error): SaveBar shows "Save failed — retrying..." and retries once after 3s.

---

## 8. Metric Ordering and Grouping

The form is divided into three visual sections with subtle dividers.

**Section 1 — Priority Metrics** (what you care about most):
1. Skin Score (slider 1–10)
2. Stress Level (slider 1–10)
3. Workload (slider 1–10)
4. Busyness (packed / normal / relaxed)

**Section 2 — Daily Habits** (quick yes/no or simple picks):
5. Sleep Last Night (<8hr / 8hr / 8hr+)
6. Food Today (clean / normal / unhealthy)
7. Alcohol (toggle — yes/no)
8. Water (toggle — yes/no)
9. Workout (toggle — yes/no)
10. Reading (toggle — yes/no)

**Section 3 — Supplementary** (optional, lower priority):
11. Weight (number input, kg)
12. Notes (free text)

---

## 9. Technical Implementation Notes

### 9.1 Auto-Save with Debounce

```typescript
// Simplified — use a useCallback + useRef pattern
const saveTimeout = useRef<NodeJS.Timeout>();

const handleChange = (field: string, value: any) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  
  if (saveTimeout.current) clearTimeout(saveTimeout.current);
  saveTimeout.current = setTimeout(() => {
    saveToDB({ ...formData, [field]: value, date: currentDate });
  }, 1000);
};
```

### 9.2 Framer Motion Stagger Reveal

```tsx
// Each metric section wraps in this:
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05, duration: 0.3 }}
>
  {/* metric content */}
</motion.div>
```

### 9.3 SQLite Upsert

```sql
INSERT INTO entries (date, skin_score, stress, workload, busyness, sleep, food, alcohol, water, workout, reading, weight_kg, notes, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
ON CONFLICT(date) DO UPDATE SET
  skin_score = COALESCE(excluded.skin_score, entries.skin_score),
  stress = COALESCE(excluded.stress, entries.stress),
  workload = COALESCE(excluded.workload, entries.workload),
  busyness = COALESCE(excluded.busyness, entries.busyness),
  sleep = COALESCE(excluded.sleep, entries.sleep),
  food = COALESCE(excluded.food, entries.food),
  alcohol = COALESCE(excluded.alcohol, entries.alcohol),
  water = COALESCE(excluded.water, entries.water),
  workout = COALESCE(excluded.workout, entries.workout),
  reading = COALESCE(excluded.reading, entries.reading),
  weight_kg = COALESCE(excluded.weight_kg, entries.weight_kg),
  notes = COALESCE(excluded.notes, entries.notes),
  updated_at = datetime('now');
```

### 9.4 Railway Deployment

- Single `Dockerfile` or Nixpacks auto-detect for Next.js.
- SQLite file stored at a persistent volume path (e.g., `/data/streaks.db`).
- Environment variables set in Railway dashboard: `JWT_SECRET`, `USER_EMAIL`, `USER_PASSWORD_HASH`, `DATABASE_PATH=/data/streaks.db`.
- Important: Railway's ephemeral filesystem means SQLite needs a persistent volume attached. Configure a volume mounted at `/data`.

### 9.5 Timezone Handling

- All dates stored as `YYYY-MM-DD` strings representing the user's local date.
- "Today" is determined client-side using the user's browser timezone.
- The client sends the date string in API requests; the server does not infer dates from timestamps.
- This avoids all timezone bugs for a single-user app.

---

## 10. Environment Variables

```env
# Auth
JWT_SECRET=<generate-a-random-32-character-string>
USER_EMAIL=mattjigs@gmail.com
USER_PASSWORD_HASH=<bcrypt-hash-of-your-password>

# Database
DATABASE_PATH=/data/streaks.db

# App
NEXT_PUBLIC_APP_NAME=STREAKS
NODE_ENV=production
```

To generate the password hash before first deploy:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 10).then(h => console.log(h))"
```

---

## 11. Dependencies (package.json)

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "better-sqlite3": "^11",
    "bcryptjs": "^2.4",
    "jsonwebtoken": "^9",
    "framer-motion": "^11",
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7",
    "@types/bcryptjs": "^2",
    "@types/jsonwebtoken": "^9",
    "@types/react": "^18",
    "@types/node": "^20",
    "typescript": "^5"
  }
}
```

---

## 12. MVP Scope Boundaries

### In Scope (Build Today)

- [x] Login page with hardcoded single user
- [x] Daily entry form with all 12 metrics
- [x] Auto-save with debounce
- [x] Date navigation (previous day viewing and editing)
- [x] Per-metric streak badges
- [x] Overall streak banner
- [x] CSV export endpoint
- [x] Dark theme, mobile-first responsive design
- [x] Framer Motion animations (stagger reveal, tap feedback)
- [x] SQLite storage on Railway with persistent volume

### Out of Scope (Future Versions)

- [ ] User registration / multi-user
- [ ] Metric toggle preferences (choose which to show/hide)
- [ ] In-app charts and data visualisation
- [ ] API integrations (Whoop, Apple Health, Garmin, etc.)
- [ ] AI-powered insights and trend analysis in-app
- [ ] Push notifications / reminders
- [ ] Weekly/monthly summary views
- [ ] Photo attachments to daily entries
- [ ] Social/sharing features
- [ ] PWA / offline support
- [ ] Data import from other apps

---

## 13. Success Criteria

The MVP is complete when:

1. A user can log in at the deployed Railway URL with `mattjigs@gmail.com`.
2. All 12 metrics can be entered for today's date with the UI components described.
3. Data auto-saves within 1 second of the last interaction.
4. Navigating to a previous day loads saved data and allows editing.
5. Streak badges appear correctly for consecutively tracked metrics.
6. The CSV export downloads a well-formed file with all historical entries.
7. The UI is responsive and usable on a mobile phone screen.
8. Animations feel smooth and polished (no jank on 60fps devices).
9. The app loads in under 2 seconds on a reasonable connection.

---

## 14. Build Sequence (Recommended Order)

For an AI agent building this in one session, the suggested order minimises backtracking:

1. **Scaffold:** `npx create-next-app` with TypeScript + Tailwind. Install dependencies.
2. **Database:** Set up SQLite connection (`lib/db.ts`), create tables on init.
3. **Auth:** Build login API route, JWT helpers, middleware, login page.
4. **API routes:** Entries CRUD (upsert + fetch by date), streaks endpoint, export endpoint.
5. **UI components:** Build the atomic components (BubbleSelect, ToggleChip, SliderInput, TripleOption, NumberInput, NotesInput, StreakBadge) in isolation.
6. **Dashboard page:** Compose components into the DailyForm, wire up state management and auto-save.
7. **Date navigation:** DateNav component, fetching entries for other dates.
8. **Streaks:** Wire streak calculation to badges in the UI.
9. **Polish:** Framer Motion animations, responsive tweaks, SaveBar.
10. **Deploy:** Railway config, persistent volume, environment variables.
