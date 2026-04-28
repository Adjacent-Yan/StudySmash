# StudySmash
CS160 Software Engineering Group Project

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- Two terminals (one backend, one frontend)

## 1) Start and configure MySQL

You need a local MySQL server running before starting the backend.

### macOS (Homebrew)

Install MySQL and start the service:

```bash
brew update
brew install mysql
brew services start mysql
```

Run MySQL security setup (recommended):

```bash
mysql_secure_installation
```

Create the StudySmash database and app user:

```bash
mysql -u root -p
```

Then run this SQL:

```sql
CREATE DATABASE IF NOT EXISTS studysmash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'studysmash_user'@'localhost' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON studysmash.* TO 'studysmash_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Windows

1. Install **MySQL Community Server 8.0** (+ Workbench optional) from [MySQL Downloads](https://dev.mysql.com/downloads/).
2. During installation, set a root password and keep MySQL running as a Windows service.
3. Open **MySQL Command Line Client** (or Workbench query tab) and run:

```sql
CREATE DATABASE IF NOT EXISTS studysmash CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'studysmash_user'@'localhost' IDENTIFIED BY 'StrongPass123!';
GRANT ALL PRIVILEGES ON studysmash.* TO 'studysmash_user'@'localhost';
FLUSH PRIVILEGES;
```

## 2) Configure backend MySQL connection

From the project root:

```bash
cd backend
cp .env.example .env
```

Update `backend/.env` values to match your MySQL setup:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=studysmash_user
MYSQL_PASSWORD=StrongPass123!
MYSQL_DB=studysmash
PORT=5050
AUTO_INIT_DB=1
```

- `AUTO_INIT_DB=1` creates/updates schema and seeds starter data at backend startup.
- Default backend port is `5050` to avoid common macOS conflicts on `5000`.

## 3) Run backend

### macOS / Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask --app app init-db
python app.py
```

### Windows

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
flask --app app init-db
python app.py
```

Backend API: `http://localhost:5050`

## 4) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend app: usually `http://localhost:5173`

If backend host/port differs, set this in `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5050
```

## Seeded test accounts

After `flask --app app init-db`, these accounts are available:

- `tester1@example.com` / `password123`
- `tester2@example.com` / `password123`

## Important backend files

- `backend/app.py` - API routes for auth, quizzes, gameplay, progress, leaderboard
- `backend/db.py` - MySQL connection, schema init, seed logic
- `backend/schema_mysql.sql` - local MySQL schema
- `backend/auth_utils.py` - password hashing and JWT helpers

## Important frontend files

- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Gameplay.jsx`
- `frontend/src/pages/CreateQuizPage.jsx`
- `frontend/src/pages/LeaderboardPage.jsx`
- `frontend/src/api/client.js`

## Notes

- You can disable startup schema checks/seed by setting `AUTO_INIT_DB=0` in `backend/.env`.
# StudySmash
CS160 Software Engineering Group Project

## ⚠️ Important Setup Step (Do this first!)
Before running the backend, you must configure the database connection. We use Supabase as our PostgreSQL database, but **we do not push our database passwords to GitHub for security reasons.**

1. Go to the `backend/` folder on your computer.
2. Manually create a new file named `.env`.
3. Check our **Discord** channel to get the `DATABASE_URL` and `SECRET_KEY`.
4. Paste them into your new `.env` file and save it.

*Note: Without this `.env` file, the backend will crash on startup because it won't be able to talk to our database!*

---

## How to run

To run the application, you need **two separate terminals** running at the same time—one for the frontend, and one for the backend. You will also need a running MySQL instance. 

### 1. Start MySQL
Create a local MySQL database server and make sure you know the host, port, username, and password.

### 2. Backend
**Mac / Linux:** 
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
flask --app app init-db
python app.py
```

**Windows:** 
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Update `backend/.env` if your MySQL credentials differ.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

If the API is not running on the default port, create `frontend/.env` with:
```bash
VITE_API_URL=http://localhost:5050
```

## Seeded test accounts

After `flask --app app init-db`, these accounts are available:

- `tester1@example.com` / `password123`
- `tester2@example.com` / `password123`

## Important backend files

- `backend/app.py` - API routes for auth, quizzes, gameplay, progress, leaderboard
- `backend/db.py` - MySQL connection, schema init, seed logic
- `backend/schema_mysql.sql` - local MySQL schema
- `backend/auth_utils.py` - password hashing and JWT helpers

## Important frontend files

- `frontend/src/pages/Dashboard.jsx`
- `frontend/src/pages/Gameplay.jsx`
- `frontend/src/pages/CreateQuizPage.jsx`
- `frontend/src/pages/LeaderboardPage.jsx`
- `frontend/src/api/client.js`

## Notes

- The backend auto-initializes the schema by default when it starts. You can disable that with `AUTO_INIT_DB=0`.
