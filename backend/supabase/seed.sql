-- Idempotent seed data (safe to re-run)
-- Run after 001_initial_schema.sql

INSERT INTO public.quizzes (category, title, time_label, rating, image_url, color)
VALUES
    ('Science', 'Astrophysics 101', '15m', '4.9', 'https://picsum.photos/seed/space/200/200', 'primary'),
    ('History', 'Cyber Medieval Era', '10m', '4.7', 'https://picsum.photos/seed/castle/200/200', 'secondary'),
    ('Tech', 'Neural Networks', '20m', '5.0', 'https://picsum.photos/seed/code/200/200', 'tertiary'),
    ('Math', 'Quantum Algebra', '12m', '4.5', 'https://picsum.photos/seed/math/200/200', 'red')
ON CONFLICT (title) DO NOTHING;

-- Bots: unique usernames; no email/password so they cannot authenticate
INSERT INTO public.users (
    username, email, password_hash, level, points,
    games_played, high_score, accuracy_pct, streak_days,
    tier, avatar_url
)
VALUES
    ('VoidMaster', NULL, NULL, 99, 128400, 3200, 250000, 97.5, 45, 'Mythic', 'https://picsum.photos/seed/p1/100/100'),
    ('Astra_Zero', NULL, NULL, 39, 91050, 890, 120000, 91.0, 8, 'Competitor', 'https://picsum.photos/seed/p3/100/100'),
    ('PixelDrifter', NULL, NULL, 35, 88200, 720, 98000, 88.4, 5, 'Rookie+', 'https://picsum.photos/seed/p4/100/100')
ON CONFLICT (username) DO NOTHING;
