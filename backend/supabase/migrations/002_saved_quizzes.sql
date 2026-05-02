-- Supabase SQL Migration
CREATE TABLE IF NOT EXISTS public.saved_quizzes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, quiz_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_quizzes_user ON public.saved_quizzes (user_id);
