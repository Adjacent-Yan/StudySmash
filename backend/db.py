import click
import psycopg
from psycopg import errors
from psycopg.rows import dict_row
from flask import current_app, g

from auth_utils import hash_password

QUIZ_SEED_ROWS = [
    (
        "Science",
        "Astrophysics 101",
        "15m",
        "4.9",
        "https://picsum.photos/seed/space/200/200",
        "primary",
    ),
    (
        "History",
        "Cyber Medieval Era",
        "10m",
        "4.7",
        "https://picsum.photos/seed/castle/200/200",
        "secondary",
    ),
    (
        "Tech",
        "Neural Networks",
        "20m",
        "5.0",
        "https://picsum.photos/seed/code/200/200",
        "tertiary",
    ),
    (
        "Math",
        "Quantum Algebra",
        "12m",
        "4.5",
        "https://picsum.photos/seed/math/200/200",
        "red",
    ),
]

BOT_SEED_ROWS = [
    (
        "VoidMaster",
        99,
        128_400,
        3_200,
        250_000,
        97.5,
        45,
        "Mythic",
        "https://picsum.photos/seed/p1/100/100",
    ),
    (
        "Astra_Zero",
        39,
        91_050,
        890,
        120_000,
        91.0,
        8,
        "Competitor",
        "https://picsum.photos/seed/p3/100/100",
    ),
    (
        "PixelDrifter",
        35,
        88_200,
        720,
        98_000,
        88.4,
        5,
        "Rookie+",
        "https://picsum.photos/seed/p4/100/100",
    ),
]

TEST_USER_SEED_ROWS = [
    (
        "tester1",
        "tester1@example.com",
        "password123",
        10,
        1500,
        10,
        500,
        85.5,
        3,
        "Explorer",
        "https://picsum.photos/seed/t1/100/100",
    ),
    (
        "tester2",
        "tester2@example.com",
        "password123",
        5,
        800,
        5,
        400,
        70.2,
        1,
        "Novice",
        "https://picsum.photos/seed/t2/100/100",
    ),
]



def normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def connect_app(app):
    url = app.config.get("DATABASE_URL")
    if not url:
        raise RuntimeError(
            "DATABASE_URL is not set. Add it to your environment (see supabase/README.md)."
        )
    conn = psycopg.connect(normalize_database_url(url), row_factory=dict_row)
    conn.autocommit = True
    return conn


def get_db():
    if "db_conn" not in g:
        g.db_conn = connect_app(current_app)
    return g.db_conn


def close_db(_e=None):
    conn = g.pop("db_conn", None)
    if conn is not None:
        conn.close()


def seed_reference_data(conn):
    """Idempotent inserts for catalog quizzes and leaderboard bots."""
    for row in QUIZ_SEED_ROWS:
        conn.execute(
            """
            INSERT INTO quizzes (category, title, time_label, rating, image_url, color)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (title) DO NOTHING
            """,
            row,
        )
    for row in BOT_SEED_ROWS:
        username, level, points, gp, hs, acc, streak, tier, avatar = row
        conn.execute(
            """
            INSERT INTO users (
                username, email, password_hash, level, points,
                games_played, high_score, accuracy_pct, streak_days,
                tier, avatar_url
            )
            VALUES (%s, NULL, NULL, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (username) DO NOTHING
            """,
            (username, level, points, gp, hs, acc, streak, tier, avatar),
        )
    for row in TEST_USER_SEED_ROWS:
        username, email, password, level, points, gp, hs, acc, streak, tier, avatar = row
        conn.execute(
            """
            INSERT INTO users (
                username, email, password_hash, level, points,
                games_played, high_score, accuracy_pct, streak_days,
                tier, avatar_url
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (username) DO NOTHING
            """,
            (username, email, hash_password(password), level, points, gp, hs, acc, streak, tier, avatar),
        )



def user_row_to_public(row, rank=None):
    if row is None:
        return None
    d = {
        "id": row["id"],
        "username": row["username"],
        "level": row["level"],
        "points": row["points"],
        "games_played": row["games_played"],
        "high_score": row["high_score"],
        "accuracy_pct": float(row["accuracy_pct"])
        if row["accuracy_pct"] is not None
        else 0.0,
        "streak_days": row["streak_days"],
        "tier": row["tier"],
        "avatar_url": row["avatar_url"] or "https://picsum.photos/seed/avatar/100/100",
    }
    if rank is not None:
        d["rank"] = rank
    return d


def password_hash_bytes(row):
    raw = row["password_hash"]
    if raw is None:
        return None
    if isinstance(raw, memoryview):
        return bytes(raw)
    return raw


def init_app(app):
    app.teardown_appcontext(close_db)

    @app.cli.command("seed")
    def seed_command():
        """Insert reference quizzes and bot users (idempotent)."""
        with app.app_context():
            conn = connect_app(current_app)
            try:
                seed_reference_data(conn)
            finally:
                conn.close()
        click.echo("Seed completed (quizzes + leaderboard bots).")

    @app.cli.command("check-db")
    def check_db_command():
        """Verify DATABASE_URL connects to Postgres."""
        verify_database_connection(app)
        click.echo("Database connection OK.")

    @app.cli.command("init-db")
    def init_db_legacy_command():
        click.echo(
            "Tables are created in Supabase. Run supabase/migrations/001_initial_schema.sql "
            "in the SQL Editor, then: flask --app app seed"
        )


def verify_database_connection(app):
    if not app.config.get("DATABASE_URL"):
        raise RuntimeError("DATABASE_URL is not set.")
    try:
        conn = connect_app(app)
        try:
            conn.execute("SELECT 1")
        finally:
            conn.close()
    except Exception as e:
        raise RuntimeError(
            f"Could not connect to DATABASE_URL. Check Supabase credentials and network. ({e})"
        ) from e
