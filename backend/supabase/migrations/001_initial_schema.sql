-- StudySmash schema for Supabase (PostgreSQL)
-- Run once in Supabase: SQL Editor → New query → paste → Run

CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    password_hash BYTEA,
    level INTEGER NOT NULL DEFAULT 1,
    points INTEGER NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    high_score INTEGER NOT NULL DEFAULT 0,
    accuracy_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'Explorer',
    avatar_url TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quizzes (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL UNIQUE,
    time_label TEXT NOT NULL,
    rating TEXT NOT NULL,
    image_url TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT 'primary'
);

CREATE INDEX IF NOT EXISTS idx_users_points_desc ON public.users (points DESC, id ASC);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

COMMENT ON TABLE public.users IS 'App accounts; rows with NULL password_hash are leaderboard bots (no login).';
COMMENT ON TABLE public.quizzes IS 'Catalog rows for the Explore Quizzes dashboard section.';
