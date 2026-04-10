# Supabase database setup (StudySmash)

## 1. Create a Supabase project

1. Open [Supabase](https://supabase.com/dashboard) and create a project.
2. Wait until the database is ready.

## 2. Apply schema (tables and indexes)

1. In the Supabase dashboard go to **SQL Editor**.
2. Open `migrations/001_initial_schema.sql` from this repo, paste the full file, and **Run**.

If `quizzes` already existed without `UNIQUE (title)`, add it once:

```sql
ALTER TABLE public.quizzes ADD CONSTRAINT quizzes_title_key UNIQUE (title);
```

(Only if the constraint is missing; skip on a fresh project.)

## 3. Verify connection and load seed data

From the `backend` folder (use a venv and install deps first):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # then edit DATABASE_URL and SECRET_KEY
flask --app app check-db
```

**Seed data — Option A (SQL, one-off)**

Paste and run `supabase/seed.sql` in the SQL Editor.

**Seed data — Option B (Python, idempotent, same rows)**

With `DATABASE_URL` in `.env` (loaded automatically) or exported:

```bash
flask --app app seed
```

Or:

```bash
python scripts/seed_supabase.py
```

## 3b. Tests

Smoke test (no database):

```bash
pytest tests/test_smoke.py -v
```

Integration tests (requires `DATABASE_URL`, schema applied, and seed recommended):

```bash
export DATABASE_URL="postgresql://..."
pytest tests/test_supabase_integration.py -v
```

## 4. Connection string for the Flask API

1. **Project Settings → Database**.
2. Copy the **URI** under *Connection string* (use **Session mode** or **Transaction** pooler; port `6543` is typical for the pooler).
3. If the URI starts with `postgres://`, keep it — the app normalizes it to `postgresql://`.

Set in your shell or `backend/.env`:

```bash
DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
SECRET_KEY=your-long-random-secret
```

**Security:** use the **database password** from Supabase, not the `anon` key. Run the Flask API only on a trusted server; never commit `.env`.

## 5. Row Level Security (RLS)

This API connects with the **database user** from `DATABASE_URL` and runs SQL directly, so **RLS does not apply** the same way as the Supabase JS client with the `anon` key. If you later expose tables via PostgREST to the browser, add RLS policies in the dashboard for those use cases.
