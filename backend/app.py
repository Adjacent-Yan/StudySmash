import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
# from psycopg import errors
from pymysql import IntegrityError

from auth_utils import create_access_token, decode_token, hash_password, verify_password
from db import (
    DEFAULT_AVATAR,
    execute,
    fetch_user_public,
    get_db,
    init_app as init_db_cli,
    initialize_database,
    password_hash_bytes,
    query_all,
    query_one,
    user_row_to_public,
)

load_dotenv(Path(__file__).resolve().parent / ".env")


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    
    # MYSQL CONFIG
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev-only-change-me-use-env-in-production-32b!"),
        MYSQL_HOST=os.environ.get("MYSQL_HOST", "127.0.0.1"),
        MYSQL_PORT=int(os.environ.get("MYSQL_PORT", "3306")),
        MYSQL_USER=os.environ.get("MYSQL_USER", "root"),
        MYSQL_PASSWORD=os.environ.get("MYSQL_PASSWORD", ""),
        MYSQL_DB=os.environ.get("MYSQL_DB", "studysmash"),
        AUTO_INIT_DB=os.environ.get("AUTO_INIT_DB", "1") == "1",
    )

    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
    )
    
    init_db_cli(app)
    if app.config["AUTO_INIT_DB"]:
        initialize_database(app)

    # -------------USER AUTH----------------

    def require_user_id(optional=False):
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            if optional:
                return None
            return None
        token = auth[7:].strip()
        if not token:
            return None
        return decode_token(token, app.config["SECRET_KEY"])

    def get_current_user_id():
        user_id = require_user_id()
        return user_id

    def unauthorized():
        return jsonify({"error": "unauthorized"}), 401

    def serialize_quiz_summary(row):
        return {
            "id": row["quiz_set_id"],
            "title": row["title"],
            "description": row["description"],
            "subject": row["subject"],
            "topic": row["topic"],
            "category": row["subject"] or row["topic"] or "General",
            "time": f'{row.get("estimated_time_minutes") or 5}m',
            "rating": f'{float(row.get("rating") or 4.8):.1f}',
            "image": row.get("image_url") or f'https://picsum.photos/seed/quiz{row["quiz_set_id"]}/300/200',
            "color": row.get("color") or "primary",
            "question_count": row.get("question_count") or 0,
            "owner_username": row.get("owner_username"),
            "visibility": row.get("visibility"),
        }

    # -------------QUIZ CATALOG----------------
    def fetch_quiz_rows(limit=None):
        sql = """
            SELECT
                qs.quiz_set_id, qs.title, qs.description, qs.subject, qs.topic, qs.visibility,
                qs.image_url, qs.estimated_time_minutes,
                u.username AS owner_username,
                COUNT(q.question_id) AS question_count,
                COALESCE(AVG(CASE WHEN gs.status = 'completed' THEN 4.8 ELSE NULL END), 4.8) AS rating,
                CASE MOD(qs.quiz_set_id, 4)
                    WHEN 0 THEN 'primary'
                    WHEN 1 THEN 'secondary'
                    WHEN 2 THEN 'tertiary'
                    ELSE 'red'
                END AS color
            FROM quiz_sets qs
            JOIN users u ON u.user_id = qs.owner_user_id
            LEFT JOIN questions q ON q.quiz_set_id = qs.quiz_set_id
            LEFT JOIN game_sessions gs ON gs.quiz_set_id = qs.quiz_set_id
            WHERE qs.is_deleted = FALSE AND qs.visibility = 'public'
            GROUP BY qs.quiz_set_id, qs.title, qs.description, qs.subject, qs.topic,
                        qs.visibility, qs.image_url, qs.estimated_time_minutes, u.username
            ORDER BY qs.updated_at DESC
        """
        if limit:
            sql += " LIMIT %s"
            return query_all(get_db(), sql, (limit,))
        return query_all(get_db(), sql)

    # -------------LEADERBOARD----------------
    def build_leaderboard(period):
        filters = {
            "daily": "AND gs.started_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)",
            "weekly": "AND gs.started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)",
            "overall": "",
        }
        period = period if period in filters else "overall"
        rows = query_all(
            get_db(),
            f"""
            SELECT
                u.user_id, u.username, u.level, u.avatar_url,
                COALESCE(SUM(gs.total_score), 0) AS score,
                COUNT(CASE WHEN gs.status = 'completed' THEN 1 END) AS games_played
            FROM users u
            LEFT JOIN game_sessions gs ON gs.user_id = u.user_id {filters[period]}
            WHERE u.is_active = TRUE
            GROUP BY u.user_id, u.username, u.level, u.avatar_url
            ORDER BY score DESC, games_played DESC, u.user_id ASC
            LIMIT 50
            """,
        )
        current_id = require_user_id(optional=True)
        out = []
        for i, r in enumerate(rows, start=1):
            out.append(
                {
                    "rank": i,
                    "name": r["username"],
                    "lvl": r["level"],
                    "pts": int(r["score"] or 0),
                    "games_played": int(r["games_played"] or 0),
                    "image": r["avatar_url"] or DEFAULT_AVATAR,
                    "is_user": current_id is not None and r["user_id"] == current_id,
                }
            )
        return out

    # -------------API ENDPOINTS----------------
    @app.get("/")
    def home():
        return jsonify({"message": "StudySmash API is running", "docs": "/api/health"})

    @app.get("/api/hello")
    def hello():
        return jsonify({"message": "Hello from Flask!"})

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.post("/api/auth/register")
    def register():
        data = request.get_json(silent=True) or {}
        username = (data.get("username") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if len(username) < 3:
            return jsonify({"error": "username must be at least 3 characters"}), 400
        if "@" not in email:
            return jsonify({"error": "valid email is required"}), 400
        if len(password) < 8:
            return jsonify({"error": "password must be at least 8 characters"}), 400
        try:
            user_id = execute(
                get_db(),
                """
                INSERT INTO users (username, email, password_hash, avatar_url)
                VALUES (%s, %s, %s, %s)
                """,
                (username, email, hash_password(password).decode("utf-8"), DEFAULT_AVATAR),
            )
        except IntegrityError:
            return jsonify({"error": "username or email already taken"}), 409
        token = create_access_token(user_id, app.config["SECRET_KEY"])
        return jsonify({"token": token, "user": fetch_user_public(get_db(), user_id)}), 201

    @app.post("/api/auth/login")
    def login():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        if not email or not password:
            return jsonify({"error": "email and password are required"}), 400

        row = query_one(
            get_db(),
            "SELECT * FROM users WHERE email = %s AND password_hash IS NOT NULL AND is_active = TRUE",
            (email,),
        )
        stored = password_hash_bytes(row)
        if row is None or stored is None or not verify_password(password, stored):
            return jsonify({"error": "invalid email or password"}), 401
        execute(get_db(), "UPDATE users SET last_login_at = NOW() WHERE user_id = %s", (row["user_id"],))
        token = create_access_token(row["user_id"], app.config["SECRET_KEY"])
        return jsonify({"token": token, "user": fetch_user_public(get_db(), row["user_id"])})

    @app.get("/api/me")
    def me():
        user_id = get_current_user_id()
        if not user_id:
            return unauthorized()
        user = fetch_user_public(get_db(), user_id)
        if not user:
            return jsonify({"error": "user not found"}), 404
        return jsonify({"user": user})

    @app.get("/api/quizzes")
    def quizzes():
        return jsonify({"quizzes": [serialize_quiz_summary(r) for r in fetch_quiz_rows()]})

    @app.get("/api/quizzes/<int:quiz_set_id>")
    def quiz_detail(quiz_set_id):
        quiz = query_one(
            get_db(),
            """
            SELECT qs.*, u.username AS owner_username
            FROM quiz_sets qs JOIN users u ON u.user_id = qs.owner_user_id
            WHERE qs.quiz_set_id = %s AND qs.is_deleted = FALSE
            """,
            (quiz_set_id,),
        )
        if not quiz:
            return jsonify({"error": "quiz not found"}), 404
        questions = query_all(
            get_db(),
            "SELECT * FROM questions WHERE quiz_set_id = %s ORDER BY display_order, question_id",
            (quiz_set_id,),
        )
        question_ids = [q["question_id"] for q in questions]
        choices = query_all(
            get_db(),
            f"SELECT choice_id, question_id, choice_text, display_order FROM question_choices WHERE question_id IN ({','.join(['%s'] * len(question_ids))}) ORDER BY display_order, choice_id",
            question_ids,
        ) if question_ids else []
        choices_by_question = {}
        for choice in choices:
            choices_by_question.setdefault(choice["question_id"], []).append(choice)
        return jsonify(
            {
                "quiz": {
                    "id": quiz["quiz_set_id"],
                    "title": quiz["title"],
                    "description": quiz["description"],
                    "subject": quiz["subject"],
                    "topic": quiz["topic"],
                    "visibility": quiz["visibility"],
                    "estimated_time_minutes": quiz["estimated_time_minutes"],
                    "owner_username": quiz["owner_username"],
                    "questions": [
                        {
                            "id": q["question_id"],
                            "question_text": q["question_text"],
                            "question_type": q["question_type"],
                            "time_limit_seconds": q["time_limit_seconds"],
                            "points_base": q["points_base"],
                            "display_order": q["display_order"],
                            "choices": choices_by_question.get(q["question_id"], []),
                        }
                        for q in questions
                    ],
                }
            }
        )

    @app.post("/api/quizzes")
    def create_quiz():
        user_id = get_current_user_id()
        if not user_id:
            return unauthorized()
        data = request.get_json(silent=True) or {}
        title = (data.get("title") or "").strip()
        description = (data.get("description") or "").strip()
        subject = (data.get("subject") or "").strip()
        topic = (data.get("topic") or "").strip()
        visibility = (data.get("visibility") or "public").strip().lower()
        questions = data.get("questions") or []
        if not title or not questions:
            return jsonify({"error": "title and at least one question are required"}), 400
        if visibility not in {"public", "private"}:
            return jsonify({"error": "invalid visibility"}), 400
        conn = get_db()
        try:
            quiz_set_id = execute(
                conn,
                """
                INSERT INTO quiz_sets (owner_user_id, title, description, subject, topic, visibility, estimated_time_minutes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (user_id, title, description, subject, topic, visibility, max(1, len(questions) * 1)),
            )
            for index, question in enumerate(questions, start=1):
                q_text = (question.get("question_text") or "").strip()
                q_type = (question.get("question_type") or "multiple_choice").strip()
                time_limit_seconds = int(question.get("time_limit_seconds") or 15)
                points_base = int(question.get("points_base") or 100)
                if not q_text:
                    continue
                question_id = execute(
                    conn,
                    """
                    INSERT INTO questions (quiz_set_id, question_text, question_type, time_limit_seconds, points_base, display_order)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (quiz_set_id, q_text, q_type, time_limit_seconds, points_base, index),
                )
                if q_type == "multiple_choice":
                    choices = question.get("choices") or []
                    correct_index = int(question.get("correct_choice_index") or 0)
                    for choice_index, choice_text in enumerate(choices, start=0):
                        execute(
                            conn,
                            "INSERT INTO question_choices (question_id, choice_text, is_correct, display_order) VALUES (%s, %s, %s, %s)",
                            (question_id, str(choice_text).strip(), choice_index == correct_index, choice_index + 1),
                        )
                else:
                    accepted_answer = (question.get("accepted_answer") or "").strip()
                    if accepted_answer:
                        execute(
                            conn,
                            "INSERT INTO question_answers (question_id, accepted_answer, is_case_sensitive) VALUES (%s, %s, %s)",
                            (question_id, accepted_answer, False),
                        )
        except IntegrityError:
            return jsonify({"error": "quiz title already exists"}), 409
        return jsonify({"quiz_id": quiz_set_id}), 201

    @app.post("/api/game-sessions")
    def start_game_session():
        user_id = get_current_user_id()
        if not user_id:
            return unauthorized()
        data = request.get_json(silent=True) or {}
        quiz_set_id = data.get("quiz_set_id")
        mode = (data.get("mode") or "solo").strip().lower()
        quiz = query_one(get_db(), "SELECT quiz_set_id FROM quiz_sets WHERE quiz_set_id = %s AND is_deleted = FALSE", (quiz_set_id,))
        if not quiz:
            return jsonify({"error": "quiz not found"}), 404
        session_id = execute(
            get_db(),
            "INSERT INTO game_sessions (user_id, quiz_set_id, mode, status) VALUES (%s, %s, %s, 'in_progress')",
            (user_id, quiz_set_id, mode),
        )
        return jsonify({"session_id": session_id}), 201

    @app.post("/api/game-sessions/<int:session_id>/answers")
    def submit_answer(session_id):
        user_id = get_current_user_id()
        if not user_id:
            return unauthorized()
        data = request.get_json(silent=True) or {}
        question_id = data.get("question_id")
        selected_choice_id = data.get("selected_choice_id")
        submitted_text = (data.get("submitted_text") or "").strip()
        response_time_ms = max(0, int(data.get("response_time_ms") or 0))
        session = query_one(get_db(), "SELECT * FROM game_sessions WHERE session_id = %s AND user_id = %s", (session_id, user_id))
        if not session:
            return jsonify({"error": "session not found"}), 404
        if session["status"] != "in_progress":
            return jsonify({"error": "session already finished"}), 400
        question = query_one(get_db(), "SELECT * FROM questions WHERE question_id = %s AND quiz_set_id = %s", (question_id, session["quiz_set_id"]))
        if not question:
            return jsonify({"error": "question not found"}), 404
        existing = query_one(get_db(), "SELECT session_answer_id FROM session_answers WHERE session_id = %s AND question_id = %s", (session_id, question_id))
        if existing:
            return jsonify({"error": "question already answered"}), 409
        is_correct = False
        correct_choice_id = None
        correct_answer = None
        if question["question_type"] == "multiple_choice":
            choice = query_one(get_db(), "SELECT * FROM question_choices WHERE choice_id = %s AND question_id = %s", (selected_choice_id, question_id))
            correct = query_one(get_db(), "SELECT * FROM question_choices WHERE question_id = %s AND is_correct = TRUE LIMIT 1", (question_id,))
            is_correct = bool(choice and choice["is_correct"])
            correct_choice_id = correct["choice_id"] if correct else None
            correct_answer = correct["choice_text"] if correct else None
        else:
            accepted = query_one(get_db(), "SELECT * FROM question_answers WHERE question_id = %s LIMIT 1", (question_id,))
            if accepted:
                expected = accepted["accepted_answer"]
                is_correct = submitted_text == expected if accepted["is_case_sensitive"] else submitted_text.lower() == expected.lower()
                correct_answer = expected
        time_limit_ms = int(question["time_limit_seconds"] or 15) * 1000
        time_bonus = max(0, int(question["points_base"] * max(0, time_limit_ms - response_time_ms) / max(time_limit_ms, 1) * 0.5))
        points_awarded = int(question["points_base"] + time_bonus) if is_correct else 0
        execute(
            get_db(),
            """
            INSERT INTO session_answers (session_id, question_id, selected_choice_id, submitted_text, is_correct, response_time_ms, points_awarded)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (session_id, question_id, selected_choice_id, submitted_text or None, is_correct, response_time_ms, points_awarded),
        )
        return jsonify({
            "is_correct": is_correct,
            "points_awarded": points_awarded,
            "correct_choice_id": correct_choice_id,
            "correct_answer": correct_answer,
        })

    @app.post("/api/game-sessions/<int:session_id>/finish")
    def finish_game_session(session_id):
        user_id = get_current_user_id()
        if not user_id:
            return unauthorized()
        data = request.get_json(silent=True) or {}
        duration_ms = max(0, int(data.get("duration_ms") or 0))
        session = query_one(get_db(), "SELECT * FROM game_sessions WHERE session_id = %s AND user_id = %s", (session_id, user_id))
        if not session:
            return jsonify({"error": "session not found"}), 404
        answers = query_all(get_db(), "SELECT * FROM session_answers WHERE session_id = %s ORDER BY answered_at", (session_id,))
        total_score = sum(int(a["points_awarded"] or 0) for a in answers)
        correct_count = sum(1 for a in answers if a["is_correct"])
        wrong_count = len(answers) - correct_count
        streak = 0
        streak_max = 0
        for answer in answers:
            if answer["is_correct"]:
                streak += 1
                streak_max = max(streak_max, streak)
            else:
                streak = 0
        execute(
            get_db(),
            """
            UPDATE game_sessions
            SET status = 'completed', total_score = %s, correct_count = %s, wrong_count = %s,
                streak_max = %s, duration_ms = %s, ended_at = NOW()
            WHERE session_id = %s
            """,
            (total_score, correct_count, wrong_count, streak_max, duration_ms, session_id),
        )
        question_count_row = query_one(get_db(), "SELECT COUNT(*) AS c FROM questions WHERE quiz_set_id = %s", (session["quiz_set_id"],))
        question_count = int(question_count_row["c"] or 0)
        mastery_percent = round((correct_count / question_count) * 100, 2) if question_count else 0
        user = query_one(get_db(), "SELECT * FROM users WHERE user_id = %s", (user_id,))
        games_played = int(user["games_played"] or 0) + 1
        total_correct_hist = (float(user["accuracy_pct"] or 0) * max(int(user["games_played"] or 0), 0) + mastery_percent) / games_played
        points = int(user["points"] or 0) + total_score
        high_score = max(int(user["high_score"] or 0), total_score)
        level = max(1, points // 1000 + 1)
        tier = "Novice" if points < 2000 else "Explorer" if points < 5000 else "Competitor" if points < 15000 else "Mythic"
        execute(
            get_db(),
            """
            UPDATE users
            SET points = %s, games_played = %s, high_score = %s, accuracy_pct = %s,
                level = %s, tier = %s
            WHERE user_id = %s
            """,
            (points, games_played, high_score, round(total_correct_hist, 2), level, tier, user_id),
        )
        execute(
            get_db(),
            """
            INSERT INTO user_quiz_progress (user_id, quiz_set_id, times_played, best_score, last_score, mastery_percent, last_played_at)
            VALUES (%s, %s, 1, %s, %s, %s, NOW())
            ON DUPLICATE KEY UPDATE
                times_played = times_played + 1,
                best_score = GREATEST(best_score, VALUES(best_score)),
                last_score = VALUES(last_score),
                mastery_percent = VALUES(mastery_percent),
                last_played_at = VALUES(last_played_at)
            """,
            (user_id, session["quiz_set_id"], total_score, total_score, mastery_percent),
        )
        return jsonify({
            "session_id": session_id,
            "total_score": total_score,
            "correct_count": correct_count,
            "wrong_count": wrong_count,
            "streak_max": streak_max,
            "mastery_percent": mastery_percent,
            "user": fetch_user_public(get_db(), user_id),
        })

    @app.get("/api/leaderboard")
    def leaderboard():
        period = (request.args.get("period") or "overall").lower()
        return jsonify({"period": period, "leaderboard": build_leaderboard(period)})

    @app.get("/api/dashboard")
    def dashboard():
        user_id = get_current_user_id()
        if not user_id:
            return unauthorized()
        return jsonify(
            {
                "user": fetch_user_public(get_db(), user_id),
                "quizzes": [serialize_quiz_summary(r) for r in fetch_quiz_rows(limit=8)],
                "leaderboard": build_leaderboard("overall")[:10],
            }
        )

    @app.get("/api/my-progress")
    def my_progress():
        user_id = get_current_user_id()
        if not user_id:
            return unauthorized()
        rows = query_all(
            get_db(),
            """
            SELECT uqp.*, qs.title, qs.subject, qs.topic
            FROM user_quiz_progress uqp
            JOIN quiz_sets qs ON qs.quiz_set_id = uqp.quiz_set_id
            WHERE uqp.user_id = %s
            ORDER BY uqp.last_played_at DESC
            """,
            (user_id,),
        )
        return jsonify({"progress": rows})

    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=int(os.environ.get("PORT", 5050)))
