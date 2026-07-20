# AuraStudy.AI — AI Study Planner & Doubt Solver

A premium, feature-rich Single Page Web Application designed for self-paced student learning. Built with HTML5, modern Javascript, and a highly polished CSS custom design system (Vanilla CSS) featuring glassmorphism, responsive elements, and a deep space dark mode.

---

## 🌟 Key Features

1. **Dashboard & Metrics Control**:
   - Live progress updates on timelines and focus targets.
   - SVG animated circular progress indicators.
   - Dynamic inspirational quotes and scheduling cards.

2. **AI Study Planner**:
   - Interactive wizard form (subjects list, exam dates, daily targets, difficulty, learning style).
   - Generates interactive checklist roadmaps.
   - Tracks exact overall plan completion statistics.
   - Supports timeline exports directly to JSON.

3. **AI Doubt Solver**:
   - Immersive chat interface matching modern AI platforms.
   - Integrates KaTeX for high-performance LaTeX math expression parsing and rendering.
   - Multi-line input supporting code blocks and symbol formatting.
   - Built-in Text-to-Speech (TTS) voice generation to read out complex definitions.

4. **Pomodoro Focus Timer**:
   - Fully customizable focus rounds with visual circular SVG progress meters.
   - Real-time synthesizer sound mixer (Rain noise, 40Hz Binaural focus waves, and Solar Wind sweeps) synthesized programmatically using the browser's Web Audio API.

5. **Spaced Repetition Flashcards**:
   - 3D-flipping flashcard widgets.
   - Active recall review system to grade recall as Easy, Medium, or Hard.
   - Category filtering tags.

6. **Settings Page**:
   - Secure input for Gemini API Key (saved directly to browser `localStorage`).
   - Choose between `gemini-1.5-flash` or `gemini-1.5-pro` models.
   - Application cache reset option.

---

## 🚀 How to Run Locally

You can launch and run the application locally in multiple ways:

### Option A: VS Code Live Server (Recommended)
1. Open the **`AI PROJECT`** folder in VS Code (which has already been launched for you).
2. Install the **Live Server** extension by Ritwick Dey.
3. Click the **Go Live** button in the status bar at the bottom right corner.
4. Your browser will automatically open the application at `http://127.0.0.1:5500/index.html`.

### Option B: Quick Python Static Server
If you have Python installed, run this command in your terminal from inside the project folder:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

### Option C: Node.js (npx) Static Server
If you have Node.js installed, run:
```bash
npx serve .
```
Then navigate to the URL provided in the console.

---

## ⚙️ Configuration

1. Obtain a free Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
2. Open the **Settings** page in **AuraStudy.AI**.
3. Paste the key in the input box, select your preferred model, and click **Save Key Configuration**.
4. You are all set! The AI Planner and Doubt Solver will now generate fully personalized results powered by Gemini. (If no key is configured, AuraStudy automatically provides simulated academic content so all modules remain fully testable).