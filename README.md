# AKUL BROs

Production-ready dairy milk accounting web application for dairy farm owners. The app is mobile-first and covers village management, customer-wise daily milk entry (AM/PM), and cycle-based customer summaries.

## Technology Stack

- Frontend: Next.js + TypeScript
- Styling: Tailwind CSS with a centralized MilkLedger colour and typography system
- Backend / database: Supabase PostgreSQL
- Authentication: 4-digit password (PIN) issued by admin, no username
- Hosting: Vercel
- Version control: GitHub

## Local Development

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a Supabase project at [https://supabase.com](https://supabase.com).
4. Configure the database:
   - Open the Supabase SQL editor.
   - Run the migration file `supabase/migrations/0001_init.sql`.
   - Or, if you use the Supabase CLI: `supabase db push`.
5. Copy environment variables:

```bash
cp .env.example .env.local
```

6. Fill `.env.local` with values from the Supabase project (Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
SESSION_SECRET=a-long-random-string
INITIAL_ADMIN_PIN=1234
```

7. Run the development server:

```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000) and sign in with the 4-digit `INITIAL_ADMIN_PIN`. The first login creates the admin user if no users exist yet.

## Required Environment Variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Local `.env.local` and Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Local `.env.local` and Vercel | Supabase anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Local `.env.local` and Vercel (sensitive) | Server-only admin operations such as PIN verification and user creation |
| `SUPABASE_JWT_SECRET` | Local `.env.local` and Vercel (sensitive) | Signs user-scoped JWTs used with Row Level Security |
| `SESSION_SECRET` | Local `.env.local` and Vercel (sensitive) | Signs the HTTP-only login cookie |
| `INITIAL_ADMIN_PIN` | Local `.env.local` and Vercel (sensitive) | 4-digit PIN used only to create the first admin user |

Never commit `.env`, `.env.local`, service role keys, JWT secrets, database passwords, or other secrets.

## Supabase Setup Notes

- All business data is stored in PostgreSQL: users, villages, customers, daily milk entries, and customer cycle parameters.
- Row Level Security is enabled. Authenticated dairy owners can only access their own rows. `app_users` has no client policies; PIN hashes are read only through server-side service-role code.
- Village codes are unique per dairy owner. Customer IDs start at 1001 and are unique across that dairy.
- Daily AM and PM entries are stored as separate rows and are the source data for customer summaries.

## Database Setup

The canonical schema lives in:

```
supabase/migrations/0001_init.sql
```

A new developer can recreate the database by applying that file. Do not rely on undocumented manual table changes.

## Formulas

These formulas are implemented in `lib/calculations.ts` and must not be changed:

- In/Out Wt = Fixed Number × (Fat − Fixed Fat) × Weight
- Final Wt = Weight + In/Out Wt
- Amount = Final Wt × Rate

Default parameters when none are saved yet: Fixed Fat = 60, Rate = 54, Fixed Number = 0.015.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # run production build
npm run lint     # lint
```

## GitHub

The repository is ready to push:

```bash
git add .
git commit -m "Add AKUL BROs dairy accounting application"
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

Do not commit secrets, `node_modules`, or `.next` build output.

## Vercel Deployment

1. Push the project to GitHub.
2. Import the GitHub repository in Vercel.
3. Add the same environment variables listed above in the Vercel project settings.
4. Deploy. Vercel should run `npm run build`.
5. After deploy, open the production URL, log in with the admin PIN, create an owner PIN if needed, then verify villages, daily entry, and customer summary.
6. Later pushes to the production branch will rebuild and redeploy automatically.

## Application Flow

Login → Villages → Select Village → Daily Entry or Customer Summary.

- Daily Entry: select month → Day 1 AM/PM cards through the last day of the month.
- Customer Summary: customer list → customer monthly summary → Cycle 1 (1–10), Cycle 2 (11–20), Cycle 3 (21–end).

## Security

- 4-digit passwords are stored as bcrypt hashes, never in plain text.
- Admin PIN management runs on the server.
- Service-role keys are never sent to the browser.
- User-facing errors do not include database stack traces or secrets.
