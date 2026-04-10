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

To run the application, you need **two separate terminals** running at the same time—one for the frontend, and one for the backend.

### 1. Frontend
Open your first terminal and run:
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend
Open a **second** terminal and run the following based on your Operating System:

**Mac / Linux:** 
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
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

---

## Authentication (Login & Sign Up)
We have a fully functioning custom authentication flow connected to our live Supabase database!

To test it out, open the local frontend URL (usually `http://localhost:5173`) in your browser:
* **Register:** Click "Sign Up" and create a brand new account. It will automatically save to the database.
  * Set the Password to `password123` for testing purposes
* **Log In:** You can log into your newly created account, or use one of our pre-populated test accounts:

**Current Test Account in Database:**

1.
- **Email:** `tester1@example.com`
- **Password:** `password123`
2.
- **Email:** `tester2@example.com`
- **Password:** `password123`
3.
- **Email:** `123456@test.com`
- **Password:** `password123`

---

## Main Files Structure
### Frontend
* `main.jsx`
* `App.jsx`
* `pages/`
  * `Home.jsx`
  * `Login.jsx`
  * `Register.jsx`
  * `Dashboard.jsx`
  * `Gameplay.jsx`
