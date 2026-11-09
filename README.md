# 📚 StudyFlow - Student Study Planner

A full-stack web application designed to help students organize their academic life, track assignments and exams, plan study sessions, and monitor academic progress.

---

## 🌐 Live Deployments

- **Live Backend API**: [https://study-planner-ng92.onrender.com](https://study-planner-ng92.onrender.com)
- **Interactive Swagger Docs**: [https://study-planner-ng92.onrender.com/docs](https://study-planner-ng92.onrender.com/docs)
- **Frontend App**: [https://vardhinenideepthika28-code.github.io/Study-planner/](https://vardhinenideepthika28-code.github.io/Study-planner/)

---

## 🌟 Key Features

- **🔐 User Authentication**: Secure student registration and login with encrypted passwords (Argon2 / pwdlib).
- **📝 Task & Assignment Management**: Create, edit, complete, and delete tasks categorized by subject, priority (Low, Medium, High), and deadlines.
- **📅 Study Planner & Scheduler**: Dedicated planner and schedule views to map out study routines.
- **📊 Progress Tracking**: Visual overview of completed vs. pending tasks.
- **🍃 MongoDB & SQLite Support**: Cloud persistence with MongoDB Atlas, or instant local testing with SQLite.
- **⚡ RESTful API**: Built with FastAPI providing high performance and auto-generated Swagger documentation.

---

## 🏗️ Project Architecture

```
Student Study Planner/
├── backend/
│   ├── routers/
│   │   ├── auth.py          # Signup & login endpoints (MongoDB + SQLite)
│   │   └── tasks.py         # Task CRUD operations (MongoDB + SQLite)
│   ├── database.py          # Dual database engine (MongoDB Atlas & SQLite)
│   ├── main.py              # FastAPI app initialization & CORS middleware
│   ├── models.py            # SQLAlchemy database models
│   ├── schemas.py           # Pydantic validation schemas
│   ├── Procfile             # Render / Cloud start configuration
│   └── requirements.txt     # Python backend dependencies (FastAPI, PyMongo, etc.)
├── frontened/
│   ├── index.html           # Landing / Login page
│   ├── signup.html          # Registration page
│   ├── dashboard.html       # Student dashboard overview
│   ├── planner.html         # Study planning interface
│   ├── schedule.html        # Schedule organizer
│   ├── progress.html        # Progress tracking
│   ├── auth.js              # Authentication helper script (dynamic API URL)
│   ├── script.js            # Main frontend application logic (dynamic API URL)
│   └── style.css            # Responsive styling
├── .gitignore
├── index.html               # Root redirect for GitHub Pages
└── README.md
```

---

## 🍃 MongoDB Configuration

StudyFlow supports both **MongoDB Atlas** and **SQLite**:
- If `MONGODB_URL` (or `MONGO_URI`) environment variable is set, StudyFlow will connect to your MongoDB cluster and store users and tasks in MongoDB.
- If not set, it automatically falls back to local SQLite (`studyflow.db`).

To connect MongoDB on Render:
1. Go to your Web Service on [Render Dashboard](https://dashboard.render.com).
2. Go to **Environment** tab.
3. Add a new Environment Variable:
   - **Key**: `MONGODB_URL`
   - **Value**: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/studyflow?retryWrites=true&w=majority`
4. Render will automatically redeploy and switch to MongoDB!

---

## 🚀 Running Locally

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### 2. Frontend Setup
Open `frontened/index.html` directly in your browser or with Live Server.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
