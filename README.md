# 🚀 Job Portal - Complete Setup Guide
# (Beginner Friendly - Step by Step)

---

## 📁 Project Structure

```
job-portal/
├── backend/          ← Node.js + Express + MongoDB
│   ├── models/       ← Database schemas
│   ├── routes/       ← API endpoints
│   ├── middleware/   ← JWT auth
│   ├── uploads/      ← Resume files (auto-created)
│   ├── server.js     ← Main server file
│   ├── .env          ← Config (edit this!)
│   └── package.json
│
└── frontend/         ← React + Redux
    ├── public/
    ├── src/
    │   ├── components/ ← Navbar, JobCard
    │   ├── pages/      ← Home, Jobs, Login, etc.
    │   ├── redux/      ← State management
    │   └── styles/     ← CSS
    └── package.json
```

---

## ✅ STEP 1: Install Required Software

### 1.1 Install Node.js
- Go to: https://nodejs.org
- Download **LTS version** (recommended)
- Install → Next → Next → Finish
- Verify: Open CMD/Terminal → type: `node --version`

### 1.2 Install MongoDB
- Go to: https://www.mongodb.com/try/download/community
- Download **MongoDB Community Server**
- Install → Complete → Finish
- MongoDB runs automatically as a service

### 1.3 Install VS Code (optional but recommended)
- Go to: https://code.visualstudio.com

---

## ✅ STEP 2: Setup Backend

Open **Terminal / Command Prompt** in the `job-portal/backend` folder:

```bash
# Go to backend folder
cd job-portal/backend

# Install all packages
npm install

# Start the backend server
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected
```

### Edit .env file (important!)
Open `backend/.env` and change:
```
JWT_SECRET=make_this_a_long_random_string_123456
```

---

## ✅ STEP 3: Setup Frontend

Open a **NEW** Terminal window in `job-portal/frontend`:

```bash
# Go to frontend folder
cd job-portal/frontend

# Install all packages
npm install

# Start the React app
npm start
```

Browser will open: http://localhost:3000

---

## ✅ STEP 4: Use the App

1. Open http://localhost:3000
2. Click **Sign Up** → Create a Job Seeker account
3. Create another account as **Recruiter**
4. As Recruiter → Dashboard → Post a Job
5. As Job Seeker → Browse Jobs → Apply

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |
| GET | /api/jobs | Get all jobs |
| GET | /api/jobs/:id | Get job by ID |
| POST | /api/jobs | Post a job (recruiter) |
| DELETE | /api/jobs/:id | Delete job |
| POST | /api/applications | Apply for job |
| GET | /api/applications/my | My applications |
| GET | /api/applications/job/:id | Job applicants |
| PUT | /api/applications/:id/status | Update status |
| POST | /api/resume/upload | Upload resume |

---

## ❌ Common Errors & Fixes

**"npm not found"**
→ Node.js install பண்ணல → nodejs.org போய் install பண்ணு

**"MongoDB connection failed"**
→ MongoDB service start ஆகல
→ Windows: Services → MongoDB → Start
→ Mac/Linux: `sudo service mongod start`

**"Port 5000 already in use"**
→ backend/.env-ல PORT=5001 மாத்து

**"CORS error"**
→ Backend running இருக்கா check பண்ணு (port 5000)
→ Frontend-ல proxy: "http://localhost:5000" இருக்கு

---

## 🔥 Tech Stack

- **Frontend**: React 18, Redux Toolkit, React Router, Bootstrap 5, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer
- **Auth**: JWT (JSON Web Tokens)
- **File Upload**: Multer

---

## 📞 Support
Problems? Check the error message carefully. Most issues are:
1. MongoDB not running
2. npm install not done
3. Both servers not running together
