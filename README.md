# AuraStudy.AI — Full-Stack AI Study Planner & Doubt Solver

A modern full-stack web application designed to help students generate optimized study timetables, log task completion, track progress metrics, and solve academic doubts using OpenRouter's `gpt-4o-mini` model.

---

## 🏗️ Technology Stack

- **Frontend**: React (Vite) styled with **Tailwind CSS v3**, supporting Light/Dark mode toggling and mobile responsive layouts.
- **Backend**: Node.js & Express API with CORS capabilities.
- **Database**: Firebase Firestore for tracking study plan task completion states.
- **AI Integration**: OpenRouter API (`openai/gpt-4o-mini`).

---

## 📂 Project Directory Layout

```
AI PROJECT/
├── backend/
│   ├── config/firebase.js          # Firestore admin configuration
│   ├── controllers/
│   │   ├── chatController.js       # Doubt solver chat agent
│   │   ├── plannerController.js    # AI timetable generator
│   │   └── progressController.js   # Progress logging
│   ├── routes/                     # Router endpoints mapping
│   ├── server.js                   # Express main server
│   └── .env.example                # Backend variable templates
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx       # Stats metrics & uncompleted tasks
│   │   │   ├── DoubtSolver.jsx     # ChatGPT-like chat viewport
│   │   │   └── Planner.jsx         # Study plan questionnaire & timeline
│   │   ├── App.jsx                 # Routing tabs, theme toggle hook
│   │   └── main.jsx
│   ├── index.html                  # KaTeX math CDN script additions
│   ├── tailwind.config.js          # Tailwind v3 configurations
│   └── package.json                # Frontend packages
└── README.md                       # Documentation manual
```

---

## 🚀 Setup & Local Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Firebase Project**: Create a project in [Firebase Console](https://console.firebase.google.com/) and create a Firestore Database.
- **OpenRouter Account**: Get an API Key from [OpenRouter](https://openrouter.ai/).

---

### Step 1: Backend Setup
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```
   Configure your keys:
   - `OPENROUTER_API_KEY`: Get from OpenRouter settings.
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`: Get by creating a new Private Key in **Firebase Project Settings -> Service Accounts**. (Note: If Firebase variables are left empty, the server automatically defaults to a local JSON file database `local_db.json` so you can test it locally without setup!).
4. Run the development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### Step 2: Frontend Setup
1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:3000` in your browser.

---

## 🌐 Deployment Instructions

### 1. Backend Deployment (Render)
1. Commit your codebase to a GitHub repository.
2. Sign in to [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure these fields:
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
5. Under **Environment Variables**, add the keys defined in your `.env` file (`OPENROUTER_API_KEY`, `FIREBASE_PROJECT_ID`, etc.).
6. Click **Deploy Web Service**. Render will output a URL (e.g., `https://aurastudy-api.onrender.com`).

---

### 2. Frontend Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com/) and click **Add New -> Project**.
2. Connect your GitHub repository.
3. Configure these fields:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Point to your deployed Render backend API URL (e.g., `https://aurastudy-api.onrender.com/api`).
5. Click **Deploy**. Vercel will host your client-side assets automatically.