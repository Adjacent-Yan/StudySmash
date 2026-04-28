import os
from pathlib import Path

import click
import pymysql
from flask import current_app, g
from pymysql.cursors import DictCursor
from pymysql.err import OperationalError

from auth_utils import hash_password

DEFAULT_AVATAR = "https://picsum.photos/seed/avatar/100/100"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema_mysql.sql"


def connect_app(app, database=None):
    host = app.config.get("MYSQL_HOST") or "127.0.0.1"
    port = int(app.config.get("MYSQL_PORT") or 3306)
    user = app.config.get("MYSQL_USER") or "root"
    password = app.config.get("MYSQL_PASSWORD") or ""
    db_name = database if database is not None else app.config.get("MYSQL_DB")
    if not db_name:
        raise RuntimeError("MYSQL_DB is not configured.")
    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=db_name,
        cursorclass=DictCursor,
        autocommit=True,
        charset="utf8mb4",
    )
    return conn


def get_db():
    if "db_conn" not in g:
        g.db_conn = connect_app(current_app)
    return g.db_conn


def close_db(_e=None):
    conn = g.pop("db_conn", None)
    if conn is not None:
        conn.close()


def query_one(conn, sql, params=None):
    with conn.cursor() as cur:
        cur.execute(sql, params or ())
        return cur.fetchone()


def query_all(conn, sql, params=None):
    with conn.cursor() as cur:
        cur.execute(sql, params or ())
        return cur.fetchall()


def execute(conn, sql, params=None):
    with conn.cursor() as cur:
        cur.execute(sql, params or ())
        return cur.lastrowid


def execute_script(conn, script: str):
    with conn.cursor() as cur:
        for statement in [s.strip() for s in script.split(";") if s.strip()]:
            try:
                cur.execute(statement)
            except OperationalError as exc:
                # Keep schema bootstrap idempotent when app restarts:
                # MySQL raises 1061 if a CREATE INDEX target already exists.
                if exc.args and exc.args[0] == 1061 and statement.upper().startswith("CREATE INDEX"):
                    continue
                raise


def create_database_if_missing(app):
    host = app.config.get("MYSQL_HOST") or "127.0.0.1"
    port = int(app.config.get("MYSQL_PORT") or 3306)
    user = app.config.get("MYSQL_USER") or "root"
    password = app.config.get("MYSQL_PASSWORD") or ""
    db_name = app.config.get("MYSQL_DB")
    if not db_name:
        raise RuntimeError("MYSQL_DB is not configured.")
    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        cursorclass=DictCursor,
        autocommit=True,
        charset="utf8mb4",
    )
    try:
        execute(conn, f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    finally:
        conn.close()


QUIZ_SEED_ROWS = [
    {
        "title": "Solar System Speed Run",
        "description": "Timed astronomy fundamentals with fast scoring.",
        "subject": "Science",
        "topic": "Astronomy",
        "image_url": "https://picsum.photos/seed/space/300/200",
        "estimated_time_minutes": 3,
        "questions": [
            {
                "question_text": "Which planet is known as the Red Planet?",
                "question_type": "multiple_choice",
                "time_limit_seconds": 15,
                "points_base": 100,
                "choices": [
                    ("Earth", 0),
                    ("Mars", 1),
                    ("Jupiter", 0),
                    ("Venus", 0),
                ],
            },
            {
                "question_text": "The Sun is a...",
                "question_type": "multiple_choice",
                "time_limit_seconds": 15,
                "points_base": 100,
                "choices": [
                    ("Planet", 0),
                    ("Comet", 0),
                    ("Star", 1),
                    ("Galaxy", 0),
                ],
            },
            {
                "question_text": "What force keeps planets in orbit around the Sun?",
                "question_type": "multiple_choice",
                "time_limit_seconds": 20,
                "points_base": 150,
                "choices": [
                    ("Friction", 0),
                    ("Magnetism", 0),
                    ("Gravity", 1),
                    ("Radiation", 0),
                ],
            },
        ],
    },
    {
        "title": "US History Blitz",
        "description": "Compete on major U.S. history facts and dates.",
        "subject": "History",
        "topic": "United States",
        "image_url": "https://picsum.photos/seed/history/300/200",
        "estimated_time_minutes": 4,
        "questions": [
            {
                "question_text": "Who wrote the Declaration of Independence?",
                "question_type": "multiple_choice",
                "time_limit_seconds": 15,
                "points_base": 100,
                "choices": [
                    ("George Washington", 0),
                    ("Benjamin Franklin", 0),
                    ("Thomas Jefferson", 1),
                    ("John Adams", 0),
                ],
            },
            {
                "question_text": "In what year did World War II end?",
                "question_type": "multiple_choice",
                "time_limit_seconds": 15,
                "points_base": 100,
                "choices": [("1942", 0), ("1945", 1), ("1948", 0), ("1950", 0)],
            },
            {
                "question_text": "The Civil War was primarily fought between which regions?",
                "question_type": "multiple_choice",
                "time_limit_seconds": 20,
                "points_base": 150,
                "choices": [
                    ("North and South", 1),
                    ("East and West", 0),
                    ("Urban and Rural", 0),
                    ("Coastal and Inland", 0),
                ],
            },
        ],
    },
]

BOT_SEED_ROWS = [
    ("VoidMaster", "voidmaster@bot.local", 99, 128400, 3200, 250000, 97.5, 45, "Mythic", "https://picsum.photos/seed/p1/100/100"),
    ("Astra_Zero", "astrazero@bot.local", 39, 91050, 890, 120000, 91.0, 8, "Competitor", "https://picsum.photos/seed/p3/100/100"),
    ("PixelDrifter", "pixeldrifter@bot.local", 35, 88200, 720, 98000, 88.4, 5, "Rookie+", "https://picsum.photos/seed/p4/100/100"),
]

TEST_USER_SEED_ROWS = [
    ("tester1", "tester1@example.com", "password123", 10, 1500, 10, 500, 85.5, 3, "Explorer", "https://picsum.photos/seed/t1/100/100"),
    ("tester2", "tester2@example.com", "password123", 5, 800, 5, 400, 70.2, 1, "Novice", "https://picsum.photos/seed/t2/100/100"),
]


def fetch_user_public(conn, user_id):
    row = query_one(conn, "SELECT * FROM users WHERE user_id = %s", (user_id,))
    if not row:
        return None
    rank_row = query_one(
        conn,
        "SELECT COUNT(*) + 1 AS rank_position FROM users WHERE points > %s",
        (row["points"],),
    )
    return user_row_to_public(row, rank=rank_row["rank_position"] if rank_row else 1)



def user_row_to_public(row, rank=None):
    if row is None:
        return None
    d = {
        "id": row["user_id"],
        "username": row["username"],
        "email": row.get("email"),
        "level": row.get("level", 1),
        "points": row.get("points", 0),
        "games_played": row.get("games_played", 0),
        "high_score": row.get("high_score", 0),
        "accuracy_pct": float(row.get("accuracy_pct") or 0),
        "streak_days": row.get("streak_days", 0),
        "tier": row.get("tier") or "Explorer",
        "avatar_url": row.get("avatar_url") or DEFAULT_AVATAR,
        "role": row.get("role") or "user",
    }
    if rank is not None:
        d["rank"] = rank
    return d



def password_hash_bytes(row):
    raw = row.get("password_hash") if row else None
    if raw is None:
        return None
    if isinstance(raw, str):
        return raw.encode("utf-8")
    return raw



def seed_reference_data(conn):
    for row in BOT_SEED_ROWS:
        username, email, level, points, gp, hs, acc, streak, tier, avatar = row
        execute(
            conn,
            """
            INSERT INTO users (
                username, email, password_hash, role, is_active, level, points,
                games_played, high_score, accuracy_pct, streak_days, tier, avatar_url
            )
            VALUES (%s, %s, NULL, 'bot', TRUE, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE username = VALUES(username)
            """,
            (username, email, level, points, gp, hs, acc, streak, tier, avatar),
        )
    for row in TEST_USER_SEED_ROWS:
        username, email, password, level, points, gp, hs, acc, streak, tier, avatar = row
        execute(
            conn,
            """
            INSERT INTO users (
                username, email, password_hash, role, is_active, level, points,
                games_played, high_score, accuracy_pct, streak_days, tier, avatar_url
            )
            VALUES (%s, %s, %s, 'user', TRUE, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE username = VALUES(username)
            """,
            (username, email, hash_password(password).decode("utf-8"), level, points, gp, hs, acc, streak, tier, avatar),
        )

    owner = query_one(conn, "SELECT user_id FROM users WHERE email = %s", (TEST_USER_SEED_ROWS[0][1],))
    if not owner:
        return

    for quiz in QUIZ_SEED_ROWS:
        existing = query_one(conn, "SELECT quiz_set_id FROM quiz_sets WHERE title = %s", (quiz["title"],))
        if existing:
            continue
        quiz_set_id = execute(
            conn,
            """
            INSERT INTO quiz_sets (
                owner_user_id, title, description, subject, topic, visibility,
                image_url, estimated_time_minutes
            )
            VALUES (%s, %s, %s, %s, %s, 'public', %s, %s)
            """,
            (
                owner["user_id"],
                quiz["title"],
                quiz["description"],
                quiz["subject"],
                quiz["topic"],
                quiz["image_url"],
                quiz["estimated_time_minutes"],
            ),
        )
        for order_index, question in enumerate(quiz["questions"], start=1):
            question_id = execute(
                conn,
                """
                INSERT INTO questions (
                    quiz_set_id, question_text, question_type, time_limit_seconds,
                    points_base, display_order
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    quiz_set_id,
                    question["question_text"],
                    question["question_type"],
                    question["time_limit_seconds"],
                    question["points_base"],
                    order_index,
                ),
            )
            for choice_order, (choice_text, is_correct) in enumerate(question["choices"], start=1):
                execute(
                    conn,
                    """
                    INSERT INTO question_choices (question_id, choice_text, is_correct, display_order)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (question_id, choice_text, is_correct, choice_order),
                )


def initialize_database(app):
    create_database_if_missing(app)
    conn = connect_app(app)
    try:
        execute_script(conn, SCHEMA_PATH.read_text())
        seed_reference_data(conn)
    finally:
        conn.close()



def verify_database_connection(app):
    conn = connect_app(app)
    try:
        query_one(conn, "SELECT 1 AS ok")
    finally:
        conn.close()



def init_app(app):
    app.teardown_appcontext(close_db)

    @app.cli.command("init-db")
    def init_db_command():
        initialize_database(app)
        click.echo("MySQL database initialized and seeded.")

    @app.cli.command("seed")
    def seed_command():
        conn = connect_app(app)
        try:
            seed_reference_data(conn)
        finally:
            conn.close()
        click.echo("Seed completed.")

    @app.cli.command("check-db")
    def check_db_command():
        verify_database_connection(app)
        click.echo("Database connection OK.")
