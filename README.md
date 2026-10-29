# Ledgerly — animated expense tracker

Track daily spending, understand it with animated analytics, and export statements.

Built with **Next.js 14 (App Router, TypeScript)**, **MongoDB / Mongoose**, **Framer Motion**, **Three.js (React Three Fiber)**, **Recharts** and **Tailwind CSS**. Light premium UI mixing neumorphism and glassmorphism.

## Features

- **Auth** — sign up / log in with email + password (bcrypt, JWT in an HTTP-only cookie, 7-day sessions). All data is scoped per user.
- **Expenses** — add, edit and delete expenses with amount, category, note ("what was it for"), date and payment mode (Cash, UPI, Debit Card, Credit Card, Net Banking, Wallet).
- **Ledger** — range presets or custom dates, search, category / mode filters, sorting, day-grouped list.
- **Analytics** — daily, monthly and yearly views with totals, change vs previous period, averages, biggest spend, top recurring notes, category split, payment modes, weekday rhythm, category trend and a spending heatmap.
- **Statements** — any date range, downloadable as PDF or CSV, or printable.

## Getting started

Requirements: Node.js 20+, a MongoDB instance (local or Atlas).

```bash
npm install
cp .env.example .env.local   # set MONGODB_URI and JWT_SECRET
npm run seed                 # optional, local dev only: demo account with ~800 expenses
npm run dev                  # http://localhost:3000
```

New accounts always start empty. The seed script is only for local development (demo login: `demo@ledgerly.app` / `demo1234`) — don't run it against a production database.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run test` | Analytics unit tests |
| `npm run seed` | Seed the demo account |

## Project layout

- `src/app/(auth)` — login & signup pages
- `src/app/(app)` — dashboard, expenses, analytics, statements
- `src/app/api` — auth, expenses, analytics and statements route handlers
- `src/lib` — DB, auth, validation, analytics engine, statement export
- `src/components` — UI primitives, charts, 3D scene, layout
