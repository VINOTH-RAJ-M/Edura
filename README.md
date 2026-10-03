# Edura

**AI-powered student support, academy management and complaint resolution.**

Built for the NEXORA 2026 Tech Innovation Hackathon (Skillonex Academy).

**Live demo:** https://edura-roan.vercel.app

---

## What it does

Students manage their academy life from one dashboard and raise issues in plain language. AI reads each message, works out the category, priority and department, drafts a reply and opens a tracked ticket. Staff work from a prioritised queue and see live analytics.

```
Student: "I paid for the Data Analytics course yesterday, but my enrollment is still not showing."

AI: Category Payment / Enrollment | Priority High | Department Accounts
    Action: Verify payment and update enrollment | Status: Ticket created
```

## Features

**Student**
- Dashboard: profile, courses, progress, schedule, attendance, payments, certificates, internships, announcements
- Raise a ticket in English, Tamil or Tanglish and get an instant AI result
- Ticket history with a full status timeline, then rate and close when resolved
- AI assistant that answers from the student's own data

**Admin**
- Overview: students, enrollments, revenue, pending and resolved complaints, high-priority issues, average resolution time, satisfaction
- Charts: common issues, tickets by department, sentiment, enrollments by course
- Ticket queue with filters, status changes, replies and AI-suggested responses

**AI**
- Classification, priority detection, department routing, sentiment, language detection
- Duplicate detection and auto escalation when the SLA is missed
- Keyword fallback keeps tickets working if the AI service is unavailable

## How it works

`Student message` → `AI understanding` → `Classification` → `Priority` → `Department routing` → `Reply` → `Ticket tracking` → `Resolution`

**Status flow:** New → Assigned → In Progress → Waiting → Resolved → Closed

| Priority | Auto-escalates after |
|---|---|
| High | 4 hours |
| Medium | 24 hours |
| Low | 72 hours |

## Tech stack

| Layer | Tool |
|---|---|
| App | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Database and auth | Supabase (PostgreSQL, Row Level Security) |
| AI | Google Gemini API |
| Charts | Recharts |
| Hosting | Vercel |

## Run it locally

```bash
git clone <ADD: repo URL>
cd <ADD: folder name>
npm install
cp .env.example .env.local     # fill in the values below
npm run dev                    # http://localhost:3000
```

1. In Supabase, run `supabase/schema.sql` once in the SQL Editor.
2. Turn off "Confirm email" under Authentication > Providers > Email (demo only).
3. Sign up, then make yourself admin:
   ```sql
   update profiles set role = 'admin' where email = 'your-email@example.com';
   ```
4. Optional demo data: `npm run seed` (14 students, 26 tickets). Use `npm run seed:reset` to rebuild.

**Environment variables**

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret key (server only) |
| `GEMINI_API_KEY` | Google AI Studio key |
| `GEMINI_MODEL` | Optional, default `gemini-flash-latest` |
| `CRON_SECRET` | Protects the escalation job |

## Demo login

| Role | Email | Password |
|---|---|---|
| Admin | `<ADD>` | `<ADD>` |
| Student | `arun.kumar@demo.skillonex.test` | `Demo@12345` |

## Project structure

```
app/            pages (student, admin, login) and API routes
components/     shared UI
lib/ai/         Gemini client, classifier, chat, duplicate detection
lib/            Supabase clients, types
supabase/       schema.sql (tables, security rules, seed data)
scripts/        demo data seeder
```

## Team

`<ADD: team name, members, college>`
