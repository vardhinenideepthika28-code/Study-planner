# 📚 StudyFlow - Student Study Planner

A full-stack web application designed to help students organize their academic life, track assignments and exams, plan study sessions, and monitor academic progress.

---

## 🌟 Key Features

- **🔐 User Authentication**: Secure student registration and login with encrypted passwords (Argon2 / pwdlib).
- **📝 Task & Assignment Management**: Create, edit, complete, and delete tasks categorized by subject, priority (Low, Medium, High), and deadlines.
- **📅 Study Planner & Scheduler**: Dedicated planner and schedule views to map out study routines.
- **📊 Progress Tracking**: Visual overview of completed vs. pending tasks.
- **⚡ RESTful API**: Built with FastAPI providing high performance and auto-generated Swagger documentation.

---

## 🏗️ Project Architecture

```
Student Study Planner/
├── backend/
│   ├── routers/
│   │   ├── auth.py          # Signup & login endpoints
│   │   └── tasks.py         # Task CRUD operations
│   ├── database.py          # SQLite database connection & session setup
│   ├── main.py              # FastAPI app initialization & CORS middleware
│   ├── models.py            # SQLAlchemy database models (User, Task)
│   ├── schemas.py           # Pydantic validation schemas
│   └── requirements.txt     # Python backend dependencies
├── frontened/
│   ├── index.html           # Landing / Login page
│   ├── signup.html          # Registration page
│   ├── dashboard.html       # Student dashboard overview
│   ├── planner.html         # Study planning interface
│   ├── schedule.html        # Schedule organizer
│   ├── progress.html        # Progress tracking
│   ├── auth.js              # Authentication helper script
│   ├── script.js            # Main frontend application logic
│   └── style.css            # Responsive styling
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Git**
- A modern web browser (Chrome, Edge, Firefox, etc.)

---

### 2. Backend Setup

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```

5. The backend API will be running at:
   - **API Root**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - **Alternative ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### 3. Frontend Setup

1. Open the `frontened` folder.
2. Launch `index.html` either by:
   - Double-clicking `index.html` to open it directly in your browser.
   - Using the **Live Server** extension in VS Code (recommended).
3. Register a new account or log in with your credentials to start managing your study plan!

---

## 🛠️ Tech Stack

- **Backend**: Python, [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy](https://www.sqlalchemy.org/), [Pydantic](https://docs.pydantic.dev/), [pwdlib / Argon2](https://github.com/frankie567/pwdlib)
- **Database**: SQLite (built-in, automatic schema generation)
- **Frontend**: HTML5, CSS3, Modern JavaScript (Fetch API, DOM manipulation)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
