CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    role ENUM('user','admin','bot') NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    level INT NOT NULL DEFAULT 1,
    points INT NOT NULL DEFAULT 0,
    games_played INT NOT NULL DEFAULT 0,
    high_score INT NOT NULL DEFAULT 0,
    accuracy_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    tier VARCHAR(32) NOT NULL DEFAULT 'Explorer',
    avatar_url VARCHAR(512) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at DATETIME NULL
);

CREATE TABLE IF NOT EXISTS quiz_sets (
    quiz_set_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    subject VARCHAR(128),
    topic VARCHAR(128),
    visibility ENUM('public','private') NOT NULL DEFAULT 'public',
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    image_url VARCHAR(512) NOT NULL DEFAULT '',
    estimated_time_minutes INT NOT NULL DEFAULT 5,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_sets_owner FOREIGN KEY (owner_user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS questions (
    question_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    quiz_set_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice','text') NOT NULL DEFAULT 'multiple_choice',
    time_limit_seconds INT NOT NULL DEFAULT 15,
    points_base INT NOT NULL DEFAULT 100,
    display_order INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_quiz FOREIGN KEY (quiz_set_id) REFERENCES quiz_sets(quiz_set_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_choices (
    choice_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    choice_text VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_choices_question FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_answers (
    answer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    accepted_answer VARCHAR(255) NOT NULL,
    is_case_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS game_sessions (
    session_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_set_id BIGINT NOT NULL,
    mode ENUM('solo','practice') NOT NULL DEFAULT 'solo',
    status ENUM('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
    total_score INT NOT NULL DEFAULT 0,
    correct_count INT NOT NULL DEFAULT 0,
    wrong_count INT NOT NULL DEFAULT 0,
    streak_max INT NOT NULL DEFAULT 0,
    duration_ms INT NOT NULL DEFAULT 0,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME NULL,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_sessions_quiz FOREIGN KEY (quiz_set_id) REFERENCES quiz_sets(quiz_set_id)
);

CREATE TABLE IF NOT EXISTS session_answers (
    session_answer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_choice_id BIGINT NULL,
    submitted_text TEXT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    response_time_ms INT NOT NULL DEFAULT 0,
    points_awarded INT NOT NULL DEFAULT 0,
    answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_session_question (session_id, question_id),
    CONSTRAINT fk_session_answers_session FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT fk_session_answers_question FOREIGN KEY (question_id) REFERENCES questions(question_id),
    CONSTRAINT fk_session_answers_choice FOREIGN KEY (selected_choice_id) REFERENCES question_choices(choice_id)
);

CREATE TABLE IF NOT EXISTS user_quiz_progress (
    progress_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_set_id BIGINT NOT NULL,
    times_played INT NOT NULL DEFAULT 0,
    best_score INT NOT NULL DEFAULT 0,
    last_score INT NOT NULL DEFAULT 0,
    mastery_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    last_played_at DATETIME NULL,
    UNIQUE KEY uniq_user_quiz_progress (user_id, quiz_set_id),
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_progress_quiz FOREIGN KEY (quiz_set_id) REFERENCES quiz_sets(quiz_set_id)
);

CREATE TABLE IF NOT EXISTS reports (
    report_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reporter_user_id BIGINT NOT NULL,
    target_type ENUM('quiz','question','user') NOT NULL,
    target_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status ENUM('open','reviewed','dismissed') NOT NULL DEFAULT 'open',
    reviewed_by BIGINT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME NULL,
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_user_id) REFERENCES users(user_id),
    CONSTRAINT fk_reports_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

CREATE INDEX idx_users_points ON users(points DESC, user_id ASC);
CREATE INDEX idx_sessions_user_date ON game_sessions(user_id, started_at);
CREATE INDEX idx_sessions_quiz_date ON game_sessions(quiz_set_id, started_at);
CREATE INDEX idx_questions_quiz_order ON questions(quiz_set_id, display_order);
