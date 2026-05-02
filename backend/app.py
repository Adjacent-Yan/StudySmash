import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
import requests

load_dotenv(Path(__file__).resolve().parent / ".env")
from flask_cors import CORS
from psycopg import errors

from auth_utils import create_access_token, decode_token, hash_password, verify_password
from db import (
    get_db,
    init_app as init_db_cli,
    password_hash_bytes,
    user_row_to_public,
)

DEFAULT_AVATAR = "https://picsum.photos/seed/avatar/100/100"


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY=os.environ.get(
            "SECRET_KEY",
            "dev-only-change-me-use-env-in-production-32b!",
        ),
        DATABASE_URL=(os.environ.get("DATABASE_URL") or "").strip() or None,
    )

    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
    )

    init_db_cli(app)

    @app.get("/")
    def home():
        return jsonify({"message": "StudySmash API is running", "docs": "/api/health"})

    @app.get("/api/hello")
    def hello():
        return jsonify({"message": "Hello from Flask!"})

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    def require_user_id():
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return None
        token = auth[7:].strip()
        if not token:
            return None
        return decode_token(token, app.config["SECRET_KEY"])

    @app.post("/api/auth/register")
    def register():
        data = request.get_json(silent=True) or {}
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not username or not email or not password:
            return jsonify({"error": "username, email, and password are required"}), 400
        if len(password) < 8:
            return jsonify({"error": "password must be at least 8 characters"}), 400

        conn = get_db()
        try:
            row = conn.execute(
                """
                INSERT INTO users (username, email, password_hash, avatar_url)
                VALUES (%s, %s, %s, %s)
                RETURNING *
                """,
                (username, email, hash_password(password), DEFAULT_AVATAR),
            ).fetchone()
        except errors.UniqueViolation:
            return jsonify({"error": "username or email already taken"}), 409

        user_id = row["id"]
        token = create_access_token(user_id, app.config["SECRET_KEY"])
        return jsonify({"token": token, "user": user_row_to_public(row)}), 201

    @app.post("/api/auth/login")
    def login():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400

        conn = get_db()
        row = conn.execute(
            """
            SELECT * FROM users
            WHERE email = %s AND password_hash IS NOT NULL
            """,
            (email,),
        ).fetchone()
        stored = password_hash_bytes(row) if row else None
        if row is None or stored is None or not verify_password(password, stored):
            return jsonify({"error": "invalid email or password"}), 401

        token = create_access_token(row["id"], app.config["SECRET_KEY"])
        return jsonify({"token": token, "user": user_row_to_public(row)})

    @app.get("/api/me")
    def me():
        user_id = require_user_id()
        if user_id is None:
            return jsonify({"error": "unauthorized"}), 401
        conn = get_db()
        row = conn.execute("SELECT * FROM users WHERE id = %s", (user_id,)).fetchone()
        if row is None:
            return jsonify({"error": "user not found"}), 404

        rank_row = conn.execute(
            """
            SELECT COUNT(*) + 1 AS r FROM users
            WHERE points > (SELECT points FROM users WHERE id = %s)
            """,
            (user_id,),
        ).fetchone()
        rank = rank_row["r"] if rank_row else 1
        return jsonify({"user": user_row_to_public(row, rank=rank)})

    @app.get("/api/quizzes")
    def quizzes():
        conn = get_db()
        rows = conn.execute(
            """
            SELECT id, category, title, time_label AS time, rating, image_url AS image, color
            FROM quizzes ORDER BY id
            """
        ).fetchall()
        return jsonify(
            {
                "quizzes": [
                    {
                        "id": r["id"],
                        "category": r["category"],
                        "title": r["title"],
                        "time": r["time"],
                        "rating": r["rating"],
                        "image": r["image"],
                        "color": r["color"],
                    }
                    for r in rows
                ]
            }
        )

    @app.get("/api/leaderboard")
    def leaderboard():
        conn = get_db()
        rows = conn.execute(
            """
            SELECT id, username, level, points, avatar_url
            FROM users
            ORDER BY points DESC, id ASC
            LIMIT 50
            """
        ).fetchall()

        current_id = require_user_id()
        out = []
        for i, r in enumerate(rows, start=1):
            item = {
                "rank": i,
                "name": r["username"],
                "lvl": r["level"],
                "pts": r["points"],
                "image": r["avatar_url"] or DEFAULT_AVATAR,
                "is_user": current_id is not None and r["id"] == current_id,
            }
            out.append(item)

        return jsonify({"leaderboard": out})

    @app.get("/api/dashboard")
    def dashboard():
        """Aggregate payload for the dashboard page (optional single round-trip)."""
        user_id = require_user_id()
        conn = get_db()

        user_payload = None
        if user_id is not None:
            row = conn.execute("SELECT * FROM users WHERE id = %s", (user_id,)).fetchone()
            if row:
                rr = conn.execute(
                    """
                    SELECT COUNT(*) + 1 AS r FROM users
                    WHERE points > (SELECT points FROM users WHERE id = %s)
                    """,
                    (user_id,),
                ).fetchone()
                user_rank = rr["r"] if rr else 1
                user_payload = user_row_to_public(row, rank=user_rank)

        if user_id is not None:
            qrows = conn.execute(
                """
                SELECT q.id, q.category, q.title, q.time_label AS time, q.rating, q.image_url AS image, q.color
                FROM quizzes q
                JOIN saved_quizzes sq ON q.id = sq.quiz_id
                WHERE sq.user_id = %s
                ORDER BY sq.created_at DESC
                """,
                (user_id,)
            ).fetchall()
        else:
            qrows = []

        quizzes_list = [
            {
                "id": r["id"],
                "category": r["category"],
                "title": r["title"],
                "time": r["time"],
                "rating": r["rating"],
                "image": r["image"],
                "color": r["color"],
            }
            for r in qrows
        ]

        lrows = conn.execute(
            """
            SELECT id, username, level, points, avatar_url
            FROM users
            ORDER BY points DESC, id ASC
            LIMIT 10
            """
        ).fetchall()
        lb = []
        for i, r in enumerate(lrows, start=1):
            lb.append(
                {
                    "rank": i,
                    "name": r["username"],
                    "lvl": r["level"],
                    "pts": r["points"],
                    "image": r["avatar_url"] or DEFAULT_AVATAR,
                    "is_user": user_id is not None and r["id"] == user_id,
                }
            )

        return jsonify(
            {
                "user": user_payload,
                "quizzes": quizzes_list,
                "leaderboard": lb,
            }
        )

    opentdb_sessions = {}

    @app.post("/api/gameplay/generate")
    def generate_quiz():
        user_id = require_user_id()
        data = request.get_json(silent=True) or {}
        amount = data.get("amount", 10)
        category_id = data.get("categoryId")
        difficulty = data.get("difficulty", "easy")

        token = None
        if user_id:
            token = opentdb_sessions.get(user_id)

        # Helper to fetch OpenTDB
        def fetch_opentdb(t):
            url = f"https://opentdb.com/api.php?amount={amount}&difficulty={difficulty}&type=multiple&encode=base64"
            if category_id:
                url += f"&category={category_id}"
            if t:
                url += f"&token={t}"
            return requests.get(url).json()

        res = fetch_opentdb(token)

        # Code 3 means Token Not Found, Code 4 means Token Empty. Both require new/reset token.
        if res.get("response_code") in [3, 4] or not token:
            if token and res.get("response_code") == 4:
                # Reset
                requests.get(f"https://opentdb.com/api_token.php?command=reset&token={token}")
            else:
                # Request new token
                t_res = requests.get("https://opentdb.com/api_token.php?command=request").json()
                token = t_res.get("token")
                if user_id and token:
                    opentdb_sessions[user_id] = token
            # Refetch
            res = fetch_opentdb(token)

        return jsonify(res)

    @app.post("/api/quizzes/<int:quiz_id>/toggle-save")
    def toggle_save_quiz(quiz_id):
        user_id = require_user_id()
        if not user_id:
            return jsonify({"error": "unauthorized"}), 401
        conn = get_db()
        q = conn.execute("SELECT id FROM quizzes WHERE id = %s", (quiz_id,)).fetchone()
        if not q:
            return jsonify({"error": "Quiz not found"}), 404
            
        existing = conn.execute(
            "SELECT id FROM saved_quizzes WHERE user_id = %s AND quiz_id = %s", 
            (user_id, quiz_id)
        ).fetchone()
        
        if existing:
            conn.execute(
                "DELETE FROM saved_quizzes WHERE user_id = %s AND quiz_id = %s", 
                (user_id, quiz_id)
            )
            saved = False
        else:
            conn.execute(
                "INSERT INTO saved_quizzes (user_id, quiz_id) VALUES (%s, %s)", 
                (user_id, quiz_id)
            )
            saved = True
            
        return jsonify({"saved": saved})

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))
