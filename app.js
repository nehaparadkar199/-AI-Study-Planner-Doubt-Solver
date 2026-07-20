// AuraStudy AI - Application Engine

// Global State
const state = {
    apiKey: localStorage.getItem('aurastudy_api_key') || '',
    model: localStorage.getItem('aurastudy_model') || 'gemini-1.5-flash',
    activeSection: 'dashboard',
    studyPlan: JSON.parse(localStorage.getItem('aurastudy_active_plan')) || null,
    chatHistory: JSON.parse(localStorage.getItem('aurastudy_chat_history')) || [],
    flashcards: JSON.parse(localStorage.getItem('aurastudy_flashcards')) || [],
    pomodoro: {
        duration: 1500, // 25 minutes default
        timeLeft: 1500,
        timerId: null,
        isRunning: false,
        completedSessions: 0
    },
    audio: {
        context: null,
        rainNode: null,
        binauralNodes: [],
        windNode: null,
        gainNodes: {}
    }
};

// Cosmic Quotes
const quotes = [
    { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "Real knowledge is to know the extent of one's ignorance.", author: "Confucius" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", author: "Dr. Seuss" }
];

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// App Initialization
function initApp() {
    setupNavigation();
    setupSettings();
    setupPlanner();
    setupDoubtSolver();
    setupPomodoro();
    setupFlashcards();
    updateUIStates();
    displayRandomQuote();
}

// Update UI badges and settings input states
function updateUIStates() {
    // Update API Key Status
    const apiBadge = document.getElementById('api-status-badge');
    const badgeText = apiBadge.querySelector('.badge-text');
    const badgeDot = apiBadge.querySelector('.badge-dot');
    
    if (state.apiKey) {
        apiBadge.classList.add('connected');
        badgeText.textContent = 'API Connected';
        badgeDot.className = 'badge-dot green';
    } else {
        apiBadge.classList.remove('connected');
        badgeText.textContent = 'API Key Missing';
        badgeDot.className = 'badge-dot red';
    }

    // Set header date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', dateOptions);

    // Sync Settings Form fields
    document.getElementById('settings-api-key').value = state.apiKey;
    document.getElementById('settings-model').value = state.model;

    // Update Stats counters on Dashboard
    updateDashboardStats();
}

// 1. Navigation & Routing
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            navigateToSection(target);
        });
    });

    // Update navigation selection on load from URL hash
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
        navigateToSection(hash);
    }
}

function navigateToSection(targetId) {
    state.activeSection = targetId;
    
    // Update sidebar links active status
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Hide all sections, show target with animation
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');
        // Update top header page title
        const titles = {
            'dashboard': 'Dashboard',
            'planner': 'AI Study Planner',
            'doubt-solver': 'AI Doubt Solver',
            'pomodoro': 'Focus Timer',
            'flashcards': 'Spaced Flashcards',
            'settings': 'Settings'
        };
        document.getElementById('page-title').textContent = titles[targetId] || 'Dashboard';
        
        // Custom transitions or loaders on tab switch
        if (targetId === 'dashboard') {
            updateDashboardStats();
            displayRandomQuote();
        }
    }
}

// Display Random Quote on Dashboard
function displayRandomQuote() {
    const quoteIndex = Math.floor(Math.random() * quotes.length);
    document.getElementById('quote-content').textContent = `"${quotes[quoteIndex].text}"`;
    document.getElementById('quote-author').textContent = `— ${quotes[quoteIndex].author}`;
}

// 2. Settings Management
function setupSettings() {
    const btnSave = document.getElementById('btn-save-settings');
    const btnToggleVisibility = document.getElementById('btn-toggle-key-visibility');
    const btnResetCache = document.getElementById('btn-reset-cache');
    const apiKeyInput = document.getElementById('settings-api-key');
    const modelSelect = document.getElementById('settings-model');

    btnSave.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        const model = modelSelect.value;
        
        state.apiKey = key;
        state.model = model;
        
        localStorage.setItem('aurastudy_api_key', key);
        localStorage.setItem('aurastudy_model', model);
        
        alert('Configurations saved successfully!');
        updateUIStates();
    });

    btnToggleVisibility.addEventListener('click', () => {
        const isPassword = apiKeyInput.type === 'password';
        apiKeyInput.type = isPassword ? 'text' : 'password';
        btnToggleVisibility.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });

    btnResetCache.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all local timelines, flashcards, and cache? This cannot be undone.')) {
            localStorage.clear();
            state.apiKey = '';
            state.model = 'gemini-1.5-flash';
            state.studyPlan = null;
            state.chatHistory = [];
            state.flashcards = [];
            state.pomodoro.completedSessions = 0;
            
            updateUIStates();
            initApp();
            alert('All application caches cleared.');
            navigateToSection('dashboard');
        }
    });
}

// Update Dashboard Statistics & Task lists
function updateDashboardStats() {
    // 1. Study Plan Completion Circle
    let planPercent = 0;
    let totalTasksCount = 0;
    let completedTasksCount = 0;

    if (state.studyPlan && state.studyPlan.weeks) {
        state.studyPlan.weeks.forEach(week => {
            week.tasks.forEach(task => {
                totalTasksCount++;
                if (task.completed) completedTasksCount++;
            });
        });
        planPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
        document.getElementById('stats-plan-info').textContent = `${completedTasksCount} of ${totalTasksCount} tasks completed`;
    } else {
        document.getElementById('stats-plan-info').textContent = 'No active study plan generated';
    }

    const studyProgressCircle = document.getElementById('study-progress-circle');
    const studyProgressText = document.getElementById('study-progress-text');
    studyProgressText.textContent = `${planPercent}%`;
    setProgressRing(studyProgressCircle, planPercent);

    // 2. Focus Time Today
    const totalFocusMinutes = state.pomodoro.completedSessions * 25;
    const focusProgressCircle = document.getElementById('focus-progress-circle');
    const focusProgressText = document.getElementById('focus-progress-text');
    focusProgressText.textContent = `${totalFocusMinutes}m`;
    const focusPercent = Math.min(Math.round((totalFocusMinutes / 60) * 100), 100);
    setProgressRing(focusProgressCircle, focusPercent);

    // 3. Doubts Solved count
    const doubtCount = state.chatHistory.filter(m => m.role === 'user').length;
    document.getElementById('doubt-solved-count').textContent = doubtCount;

    // 4. Flashcards Mastered count
    const masteredCount = state.flashcards.filter(c => c.mastered).length;
    document.getElementById('flashcard-mastered-count').textContent = `${masteredCount}/${state.flashcards.length}`;

    // 5. Dashboard Todo schedule
    const todoContainer = document.getElementById('dashboard-todo-list');
    todoContainer.innerHTML = '';
    
    if (state.studyPlan && state.studyPlan.weeks) {
        let tasksAdded = 0;
        // Grab the first few uncompleted tasks to display on Dashboard
        for (let w = 0; w < state.studyPlan.weeks.length; w++) {
            const week = state.studyPlan.weeks[w];
            for (let t = 0; t < week.tasks.length; t++) {
                const task = week.tasks[t];
                if (!task.completed && tasksAdded < 4) {
                    const itemHtml = document.createElement('div');
                    itemHtml.className = 'todo-item';
                    itemHtml.innerHTML = `
                        <div class="todo-checkbox" onclick="togglePlanTask(${w}, ${t}, true)">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div class="todo-content">
                            <span class="todo-title">${task.name}</span>
                            <span class="todo-meta">${week.title}</span>
                        </div>
                    `;
                    todoContainer.appendChild(itemHtml);
                    tasksAdded++;
                }
            }
        }
        if (tasksAdded === 0) {
            todoContainer.innerHTML = `
                <div class="empty-state">
                    <p><i class="fa-solid fa-face-smile"></i> You are all caught up! Great work.</p>
                </div>
            `;
        }
    } else {
        todoContainer.innerHTML = `
            <div class="empty-state">
                <p>Your timeline tasks will appear here once you generate a study plan!</p>
            </div>
        `;
    }
}

// Set SVG progress ring dashoffset
function setProgressRing(circleElement, percent) {
    const radius = circleElement.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circleElement.style.strokeDasharray = `${circumference} ${circumference}`;
    const offset = circumference - (percent / 100) * circumference;
    circleElement.style.strokeDashoffset = offset;
}

// 3. AI Planner Engine
function setupPlanner() {
    const form = document.getElementById('study-planner-form');
    const hoursInput = document.getElementById('planner-hours');
    const hoursVal = document.getElementById('hours-val');
    const resultsPanel = document.getElementById('planner-results-panel');
    const resultsContent = document.getElementById('planner-results-content');
    const emptyState = document.getElementById('planner-empty-state');
    const btnDownload = document.getElementById('btn-download-plan');
    const btnReset = document.getElementById('btn-reset-plan');

    // Sync hours range slider val
    hoursInput.addEventListener('input', () => {
        hoursVal.textContent = `${hoursInput.value} hours`;
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnGen = document.getElementById('btn-generate-plan');
        btnGen.disabled = true;
        btnGen.innerHTML = '<i class="fa-solid fa-atom animate-spin"></i> Synthesizing Roadmap...';

        const subjects = document.getElementById('planner-subjects').value;
        const examDate = document.getElementById('planner-exam-date').value;
        const hours = hoursInput.value;
        const style = document.getElementById('planner-style').value;
        const difficulty = document.getElementById('planner-difficulty').value;

        try {
            let planData;
            
            if (state.apiKey) {
                // Actual API generation
                planData = await generatePlannerAPI(subjects, examDate, hours, style, difficulty);
            } else {
                // Premium simulated planner when API key is not supplied
                planData = simulatePlannerGeneration(subjects, examDate, hours, style, difficulty);
            }

            state.studyPlan = planData;
            localStorage.setItem('aurastudy_active_plan', JSON.stringify(planData));
            
            renderTimeline();
            updateDashboardStats();
            
            // Switch panels
            emptyState.classList.add('hidden');
            resultsPanel.classList.remove('empty');
            resultsContent.classList.remove('hidden');
        } catch (err) {
            console.error(err);
            alert('Failed to generate study plan: ' + err.message);
        } finally {
            btnGen.disabled = false;
            btnGen.innerHTML = '<i class="fa-solid fa-atom"></i> Generate AI Plan';
        }
    });

    btnReset.addEventListener('click', () => {
        if (confirm('Are you sure you want to discard this study plan?')) {
            state.studyPlan = null;
            localStorage.removeItem('aurastudy_active_plan');
            emptyState.classList.remove('hidden');
            resultsPanel.classList.add('empty');
            resultsContent.classList.add('hidden');
            updateDashboardStats();
        }
    });

    btnDownload.addEventListener('click', () => {
        if (!state.studyPlan) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.studyPlan, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `AuraStudy_Plan_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    // Check if timeline is already present in state on load
    if (state.studyPlan) {
        renderTimeline();
        emptyState.classList.add('hidden');
        resultsPanel.classList.remove('empty');
        resultsContent.classList.remove('hidden');
    }
}

// Call Gemini API for Study Plan Generation
async function generatePlannerAPI(subjects, examDate, hours, style, difficulty) {
    const modelName = state.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${state.apiKey}`;
    
    const prompt = `You are AuraStudy AI. Generate a customized, structured study plan in JSON format.
Inputs:
- Subjects: ${subjects}
- Exam Date: ${examDate} (Today's date is July 20, 2026)
- Study Hours / Day: ${hours}
- Learning Style: ${style}
- Starting Level: ${difficulty}

You MUST return a JSON object exactly matching this schema:
{
  "weeks": [
    {
      "title": "Week 1: [Topic Area Title]",
      "tasks": [
        {
          "name": "[Task Action Name]",
          "desc": "[Specific actions, resources to study, what to practice for 2-3 sentences. Tailor to learning style.]"
        }
      ]
    }
  ]
}
Structure the plan reasonably spanning from today (July 20, 2026) until the target exam date. Provide 2-4 key tasks per week. Return ONLY valid JSON, do not include markdown symbols.`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json"
            }
        })
    });

    if (!response.ok) {
        const errDetails = await response.text();
        throw new Error(errDetails || 'Failed connection to Google API');
    }

    const data = await response.json();
    const rawJson = data.candidates[0].content.parts[0].text;
    
    // Parse JSON
    const parsedPlan = JSON.parse(rawJson.trim());
    
    // Inject completion state to tasks
    if (parsedPlan && parsedPlan.weeks) {
        parsedPlan.weeks.forEach(week => {
            week.tasks.forEach(task => {
                task.completed = false;
            });
        });
    }
    return parsedPlan;
}

// Simulated plan generator for out of the box experience
function simulatePlannerGeneration(subjects, examDate, hours, style, difficulty) {
    const list = subjects.split(',').map(s => s.trim());
    const weekCount = Math.max(2, Math.min(8, Math.round((new Date(examDate) - new Date('2026-07-20')) / (1000 * 60 * 60 * 24 * 7))));
    
    const simulatedWeeks = [];
    for (let w = 1; w <= weekCount; w++) {
        const weekSubject = list[(w - 1) % list.length];
        
        let tasks = [];
        if (w === weekCount) {
            tasks = [
                {
                    name: `Final Review of ${list.join(' & ')}`,
                    desc: `Solve mock practice exams and clarify remaining weak spots. Optimize recall patterns.`,
                    completed: false
                },
                {
                    name: `Active Recall Warmup`,
                    desc: `Use flashcards to test formulas, basic core definitions and code logic. Ensure 8+ hours of sleep.`,
                    completed: false
                }
            ];
        } else {
            tasks = [
                {
                    name: `Foundational study of ${weekSubject}`,
                    desc: `Read high-yield chapters, notes or documentation. Focus on core parameters and structures matching ${style} style.`,
                    completed: false
                },
                {
                    name: `${weekSubject} Practice Problems`,
                    desc: `Complete ${hours * 3} targeted problems. Test intermediate cases. Identify blockages.`,
                    completed: false
                },
                {
                    name: `Deep Dive Concept mapping`,
                    desc: `Draw relationships between terms. If coding, write two mini implementation scripts from scratch.`,
                    completed: false
                }
            ];
        }

        simulatedWeeks.push({
            title: `Week ${w}: Deepening ${weekSubject} (${difficulty.toUpperCase()})`,
            tasks: tasks
        });
    }

    return { weeks: simulatedWeeks };
}

// Render generated timeline tasks on Planner Page
function renderTimeline() {
    const container = document.getElementById('plan-timeline-container');
    container.innerHTML = '';
    
    if (!state.studyPlan || !state.studyPlan.weeks) return;

    let totalTasks = 0;
    let completedTasks = 0;

    state.studyPlan.weeks.forEach((week, wIndex) => {
        const weekDiv = document.createElement('div');
        
        // Check if all tasks in week are completed
        const isWeekCompleted = week.tasks.every(t => t.completed);
        weekDiv.className = `timeline-week ${isWeekCompleted ? 'completed' : ''}`;
        
        const weekHeader = `
            <div class="timeline-dot"></div>
            <div class="week-title">${week.title}</div>
        `;
        weekDiv.innerHTML = weekHeader;
        
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'week-tasks';

        week.tasks.forEach((task, tIndex) => {
            totalTasks++;
            if (task.completed) completedTasks++;

            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.innerHTML = `
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="togglePlanTask(${wIndex}, ${tIndex}, false)">
                    <i class="fa-solid fa-check"></i>
                </div>
                <div class="task-details">
                    <span class="task-name">${task.name}</span>
                    <span class="task-desc">${task.desc}</span>
                </div>
            `;
            tasksContainer.appendChild(taskItem);
        });

        weekDiv.appendChild(tasksContainer);
        container.appendChild(weekDiv);
    });

    // Update progress bars
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    document.getElementById('plan-progress-percent').textContent = `${progressPercent}%`;
    document.getElementById('plan-progress-fill').style.width = `${progressPercent}%`;
}

// Toggle status of study plan tasks
window.togglePlanTask = function(wIndex, tIndex, fromDashboard = false) {
    if (!state.studyPlan) return;
    
    const task = state.studyPlan.weeks[wIndex].tasks[tIndex];
    task.completed = !task.completed;
    
    localStorage.setItem('aurastudy_active_plan', JSON.stringify(state.studyPlan));
    
    if (fromDashboard) {
        // Redraw active page or dashboard widgets
        updateDashboardStats();
        // If planner section is active, update timeline too
        if (state.activeSection === 'planner') {
            renderTimeline();
        }
    } else {
        renderTimeline();
        updateDashboardStats();
    }
};

// 4. Doubt Solver Interface
function setupDoubtSolver() {
    const inputField = document.getElementById('chat-input-field');
    const btnSend = document.getElementById('btn-send-message');
    const btnClear = document.getElementById('btn-clear-chat');
    const btnInsertCode = document.getElementById('btn-chat-code');
    const btnInsertMath = document.getElementById('btn-chat-math');

    // Auto-grow input text area
    inputField.addEventListener('input', () => {
        inputField.style.height = 'auto';
        inputField.style.height = (inputField.scrollHeight) + 'px';
    });

    // Key events
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendDoubtMessage();
        }
    });

    btnSend.addEventListener('click', sendDoubtMessage);
    btnClear.addEventListener('click', () => {
        if (confirm('Clear entire chat conversation history?')) {
            state.chatHistory = [];
            localStorage.removeItem('aurastudy_chat_history');
            
            const messagesContainer = document.getElementById('chat-messages-container');
            messagesContainer.innerHTML = `
                <div class="chat-message bot">
                    <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
                    <div class="msg-content">
                        <p>Hello! I am Aura, your academic companion. You can ask me any doubt about math formulas, coding questions, science concepts, or essays.</p>
                        <p>Feel free to input math equations (e.g., <code>x = \\frac{-b \\pm \sqrt{b^2 - 4ac}}{2a}</code>) or paste code snippets directly.</p>
                    </div>
                </div>
            `;
            updateDashboardStats();
        }
    });

    btnInsertCode.addEventListener('click', () => {
        const start = inputField.selectionStart;
        const end = inputField.selectionEnd;
        const val = inputField.value;
        inputField.value = val.substring(0, start) + "\n```javascript\n// Paste your code here\n\n```\n" + val.substring(end);
        inputField.focus();
    });

    btnInsertMath.addEventListener('click', () => {
        const start = inputField.selectionStart;
        const end = inputField.selectionEnd;
        const val = inputField.value;
        inputField.value = val.substring(0, start) + " \\( e^{i\\pi} + 1 = 0 \\) " + val.substring(end);
        inputField.focus();
    });

    // Reload history on mount
    if (state.chatHistory.length > 0) {
        const container = document.getElementById('chat-messages-container');
        state.chatHistory.forEach(msg => {
            renderChatMessage(msg.role, msg.text, false);
        });
    }
}

// Send doubt solver chat message
async function sendDoubtMessage() {
    const inputField = document.getElementById('chat-input-field');
    const query = inputField.value.trim();
    if (!query) return;

    // Render User Message
    renderChatMessage('user', query);
    state.chatHistory.push({ role: 'user', text: query });
    localStorage.setItem('aurastudy_chat_history', JSON.stringify(state.chatHistory));
    
    // Clear Input
    inputField.value = '';
    inputField.style.height = 'auto';

    // Update Dashboard Stats count
    updateDashboardStats();

    // Render loading state for Bot response
    const botMsgId = renderChatMessage('bot', 'Aura is analyzing study parameters...', true);

    try {
        let responseText = '';
        if (state.apiKey) {
            responseText = await callDoubtSolverAPI(query);
        } else {
            responseText = await simulateDoubtResponse(query);
        }
        
        // Remove loading class, update contents
        const botMsgDiv = document.getElementById(botMsgId);
        const contentDiv = botMsgDiv.querySelector('.msg-content');
        
        // Format markdown & LaTeX math
        contentDiv.innerHTML = formatMarkdownResponse(responseText);
        
        // Run KaTeX math rendering over this message block
        if (window.renderMathInElement) {
            window.renderMathInElement(contentDiv, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
            });
        }

        // Add text to speech button
        addTTSButton(contentDiv, responseText);

        // Update state
        state.chatHistory.push({ role: 'model', text: responseText });
        localStorage.setItem('aurastudy_chat_history', JSON.stringify(state.chatHistory));

    } catch (err) {
        console.error(err);
        const botMsgDiv = document.getElementById(botMsgId);
        const contentDiv = botMsgDiv.querySelector('.msg-content');
        contentDiv.innerHTML = `<p class="error-text"><i class="fa-solid fa-triangle-exclamation"></i> Error solving doubt: ${err.message}. Please verify settings.</p>`;
    }
}

// Call Gemini API for doubts
async function callDoubtSolverAPI(query) {
    const modelName = state.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${state.apiKey}`;

    const systemInstruction = "You are Aura, an elite academic AI tutor. Explain coding questions, math formulas, essays, and scientific concepts. Be extremely encouraging. Format code in markdown blocks with language identifier. Format math using LaTeX delimiters like \\( ... \\) for inline and \\[ ... \\] for display blocks. Suggest 2 relevant follow-up questions at the end of your explanation.";

    const contents = [];
    
    // Add brief history context
    const contextHistory = state.chatHistory.slice(-6); // Last 6 messages
    contextHistory.forEach(msg => {
        contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    });

    // Add current query
    contents.push({
        role: 'user',
        parts: [{ text: query }]
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: contents,
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            }
        })
    });

    if (!response.ok) {
        const errDetails = await response.text();
        throw new Error(errDetails || 'Failed connection to Google API');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Simulate academic explanation if API Key missing
function simulateDoubtResponse(query) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            let response = '';

            if (lowerQuery.includes('integrate') || lowerQuery.includes('derivative') || lowerQuery.includes('calculus') || lowerQuery.includes('math')) {
                response = `### Calculus & Derivative Deep Dive
To solve the derivative of a function or locate a limit, we utilize the fundamental theorem of calculus:
\\[ f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} \\]

For polynomial derivatives, remember the **Power Rule**:
\\[ \\frac{d}{dx} x^n = n x^{n-1} \\]

**Example Problem:** Find the derivative of \\( f(x) = 3x^2 + 5x \\).
Using the rule:
\\[ f'(x) = 6x + 5 \\]

---
#### Follow-up Practice Questions:
1. What is the derivative of \\( g(x) = \\sin(x) + e^x \\)?
2. How does the Chain Rule apply if we have \\( h(x) = (3x^2+5x)^3 \\)?`;
            } else if (lowerQuery.includes('javascript') || lowerQuery.includes('code') || lowerQuery.includes('function') || lowerQuery.includes('const') || lowerQuery.includes('var')) {
                response = `### JavaScript Scope and Execution Concepts
In modern JavaScript (ES6+), variable declarations behave differently based on their keywords: \`var\`, \`let\`, and \`const\`.

Here is a summary script demonstrating scopes:
\`\`\`javascript
// Block Scoped Constants
const pi = 3.14159;

function calculateArea(radius) {
    if (radius > 0) {
        let area = pi * radius * radius; // Block scoped to the 'if' statement
        var legacyMsg = "Completed";    // Function scoped
        return area;
    }
    // console.log(area); // Throws ReferenceError: area is not defined
    console.log(legacyMsg); // Prints "Completed" due to var hosting
}
\`\`\`

**Key Points:**
- \`const\`: Cannot be reassigned. Block-scoped.
- \`let\`: Can be reassigned. Block-scoped.
- \`var\`: Function-scoped, hoisted to top of function environment.

---
#### Follow-up Practice Questions:
1. What is closure in JavaScript and how does it retain lexical environment scope?
2. How does the event loop handle asynchronous functions in call stacks?`;
            } else {
                response = `### Explanation: Academic Concepts
Thank you for asking. Here is a step-by-step breakdown of your question:

1. **Core Concept:** Understanding the primary foundation of the topic helps connect details.
2. **Key Parameter:** Focus on defining how variables and structures interact.
3. **Application:** Apply this logic to practical scenarios.

Let's look at the basic equation of energy conservation:
\\[ E_k + E_p = E_{total} \\]

*(Note: Connect your Gemini API Key in Settings to get full, custom explanations matching your specific course syllabus!)*

---
#### Follow-up Practice Questions:
1. Would you like a step-by-step math proof or code setup for this concept?
2. Can we formulate a test question to check your understanding of this topic?`;
            }
            resolve(response);
        }, 1500);
    });
}

// Render message UI elements
function renderChatMessage(role, text, isLoading = false) {
    const container = document.getElementById('chat-messages-container');
    const msgDiv = document.createElement('div');
    const uniqueId = `chat-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    msgDiv.id = uniqueId;
    msgDiv.className = `chat-message ${role}`;

    const iconClass = role === 'user' ? 'fa-user-astronaut' : 'fa-robot';
    
    msgDiv.innerHTML = `
        <div class="msg-avatar"><i class="fa-solid ${iconClass}"></i></div>
        <div class="msg-content">
            ${isLoading ? '<div class="pulse-loader">Aura is reasoning...</div>' : formatMarkdownResponse(text)}
        </div>
    `;

    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;

    // Render LaTeX Math if already loaded
    if (!isLoading && window.renderMathInElement) {
        window.renderMathInElement(msgDiv.querySelector('.msg-content'), {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError: false
        });
    }

    if (!isLoading && role === 'bot') {
        addTTSButton(msgDiv.querySelector('.msg-content'), text);
    }

    return uniqueId;
}

// Convert simple markdown blocks to HTML tags
function formatMarkdownResponse(markdown) {
    let html = markdown
        .replace(/### (.*)/g, '<h3>$1</h3>')
        .replace(/#### (.*)/g, '<h4>$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
        
    // Format Code Blocks
    const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
    html = html.replace(codeRegex, (match, lang, code) => {
        return `<pre><code class="language-${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });

    return html;
}

// Add Text-to-Speech playback controls
function addTTSButton(element, text) {
    // Remove symbols and math markers from spoken speech text
    const cleanText = text.replace(/\\\[[\s\S]*?\\\]/g, '[Formula]')
                          .replace(/\\\([\s\S]*?\\\)/g, '[Formula]')
                          .replace(/```[\s\S]*?```/g, '[Code Block]')
                          .replace(/<[^>]*>/g, '');

    const btn = document.createElement('button');
    btn.className = 'tts-btn';
    btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Listen Explanation';
    
    btn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop playing previous audio
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.05;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Speech Synthesis not supported in this browser.');
        }
    });

    element.appendChild(btn);
}

// 5. Pomodoro focus timer with Web Audio Synth
function setupPomodoro() {
    const timeDisplay = document.getElementById('timer-time-display');
    const toggleBtn = document.getElementById('btn-timer-toggle');
    const resetBtn = document.getElementById('btn-timer-reset');
    const progressCircle = document.getElementById('timer-progress-circle');
    const sessionsInfo = document.getElementById('timer-sessions-info');
    
    // Timer Modes selectors
    const modeBtns = document.querySelectorAll('.timer-mode-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const duration = parseInt(btn.getAttribute('data-duration'));
            state.pomodoro.duration = duration;
            state.pomodoro.timeLeft = duration;
            
            stopPomodoroTimer();
            updateTimerDisplay();
        });
    });

    toggleBtn.addEventListener('click', () => {
        if (state.pomodoro.isRunning) {
            pausePomodoroTimer();
        } else {
            startPomodoroTimer();
        }
    });

    resetBtn.addEventListener('click', () => {
        stopPomodoroTimer();
        state.pomodoro.timeLeft = state.pomodoro.duration;
        updateTimerDisplay();
    });

    // Sound generator volume selectors
    const volInputs = document.querySelectorAll('.sound-volume');
    volInputs.forEach(input => {
        input.addEventListener('input', () => {
            const soundType = input.getAttribute('data-sound');
            const val = parseFloat(input.value);
            if (state.audio.gainNodes[soundType]) {
                state.audio.gainNodes[soundType].gain.value = val;
            }
        });
    });

    // Sound generator toggles
    const soundToggles = document.querySelectorAll('.sound-toggle');
    soundToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const soundType = toggle.getAttribute('data-sound');
            toggleSoundscape(soundType, toggle);
        });
    });

    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.pomodoro.timeLeft / 60);
    const seconds = state.pomodoro.timeLeft % 60;
    
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById('timer-time-display').textContent = formattedTime;

    // SVG Circle progress ring update
    // Radius = 130, Circumference = 816.8
    const progress = state.pomodoro.timeLeft / state.pomodoro.duration;
    const offset = 816.8 * (1 - progress);
    document.getElementById('timer-progress-circle').style.strokeDashoffset = offset;

    // Stats description text
    const sessionCount = state.pomodoro.completedSessions + 1;
    document.getElementById('timer-sessions-info').textContent = `Focus Session ${sessionCount} • Completed: ${state.pomodoro.completedSessions} hours/rounds`;
}

function startPomodoroTimer() {
    state.pomodoro.isRunning = true;
    const toggleIcon = document.getElementById('btn-timer-toggle');
    toggleIcon.innerHTML = '<i class="fa-solid fa-pause"></i>';
    toggleIcon.style.boxShadow = 'var(--shadow-glow-cyan)';
    document.getElementById('timer-progress-circle').style.stroke = 'var(--accent-cyan)';

    state.pomodoro.timerId = setInterval(() => {
        state.pomodoro.timeLeft--;
        updateTimerDisplay();

        if (state.pomodoro.timeLeft <= 0) {
            // Alarm & complete round
            playAlarmSound();
            state.pomodoro.completedSessions++;
            stopPomodoroTimer();
            state.pomodoro.timeLeft = state.pomodoro.duration;
            updateTimerDisplay();
            updateDashboardStats();
            alert('Timer Finished! Take a break or return to studying.');
        }
    }, 1000);
}

function pausePomodoroTimer() {
    state.pomodoro.isRunning = false;
    clearInterval(state.pomodoro.timerId);
    document.getElementById('btn-timer-toggle').innerHTML = '<i class="fa-solid fa-play"></i>';
}

function stopPomodoroTimer() {
    state.pomodoro.isRunning = false;
    clearInterval(state.pomodoro.timerId);
    const toggleIcon = document.getElementById('btn-timer-toggle');
    toggleIcon.innerHTML = '<i class="fa-solid fa-play"></i>';
    toggleIcon.style.boxShadow = 'var(--shadow-glow-pink)';
    document.getElementById('timer-progress-circle').style.stroke = 'var(--accent-pink)';
}

function playAlarmSound() {
    // Basic browser synth beep
    if (!state.audio.context) {
        state.audio.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = state.audio.context;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.value = 587.33; // D5 Note
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
}

// Real-time audio synthesis utilizing Web Audio API
function toggleSoundscape(soundType, toggleElement) {
    // Init Audio Context if missing
    if (!state.audio.context) {
        state.audio.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const ctx = state.audio.context;
    
    // Check if turning on or off
    if (toggleElement.classList.contains('active')) {
        // TURN OFF
        toggleElement.classList.remove('active');
        toggleElement.innerHTML = '<i class="fa-solid fa-play"></i>';
        
        if (soundType === 'rain' && state.audio.rainNode) {
            state.audio.rainNode.stop();
            state.audio.rainNode = null;
        } else if (soundType === 'binaural' && state.audio.binauralNodes.length > 0) {
            state.audio.binauralNodes.forEach(n => n.stop());
            state.audio.binauralNodes = [];
        } else if (soundType === 'wind' && state.audio.windNode) {
            state.audio.windNode.stop();
            state.audio.windNode = null;
        }
    } else {
        // TURN ON
        toggleElement.classList.add('active');
        toggleElement.innerHTML = '<i class="fa-solid fa-square-term"></i> <i class="fa-solid fa-stop"></i>';
        
        // Build Gain Node if missing
        if (!state.audio.gainNodes[soundType]) {
            const gain = ctx.createGain();
            const inputVal = parseFloat(document.querySelector(`.sound-volume[data-sound="${soundType}"]`).value);
            gain.gain.value = inputVal;
            gain.connect(ctx.destination);
            state.audio.gainNodes[soundType] = gain;
        }

        const outputNode = state.audio.gainNodes[soundType];
        
        if (soundType === 'rain') {
            state.audio.rainNode = playSynthesizedRain(ctx, outputNode);
        } else if (soundType === 'binaural') {
            state.audio.binauralNodes = playSynthesizedBinaural(ctx, outputNode);
        } else if (soundType === 'wind') {
            state.audio.windNode = playSynthesizedWind(ctx, outputNode);
        }
    }
}

// Generate White Noise Buffer
function createNoiseBuffer(ctx, seconds = 2) {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

// Rain Audio Synthesizer
function playSynthesizedRain(ctx, destination) {
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 3);
    noise.loop = true;

    // Filter rain frequencies
    const lpFilter = ctx.createBiquadFilter();
    lpFilter.type = 'lowpass';
    lpFilter.frequency.value = 600;

    const hpFilter = ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.value = 100;

    noise.connect(lpFilter);
    lpFilter.connect(hpFilter);
    hpFilter.connect(destination);

    noise.start(0);
    return noise;
}

// Binaural Beat Synthesizer (40Hz Concentration Waves)
function playSynthesizedBinaural(ctx, destination) {
    const oscL = ctx.createOscillator();
    const oscR = ctx.createOscillator();
    
    // Channel Merging for Stereo separation
    const merger = ctx.createChannelMerger(2);
    
    oscL.frequency.value = 200; // Left ear base frequency
    oscR.frequency.value = 240; // Right ear (diff = 40Hz)
    
    oscL.type = 'sine';
    oscR.type = 'sine';
    
    // Connect to merger paths
    const gainL = ctx.createGain();
    const gainR = ctx.createGain();
    gainL.gain.value = 0.5;
    gainR.gain.value = 0.5;
    
    oscL.connect(gainL).connect(merger, 0, 0);
    oscR.connect(gainR).connect(merger, 0, 1);
    
    merger.connect(destination);
    
    oscL.start(0);
    oscR.start(0);
    
    return [oscL, oscR];
}

// Solar Wind swept-filter noise
function playSynthesizedWind(ctx, destination) {
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 4);
    noise.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.value = 4.0;

    // Sweep LFO to modulate bandpass filter frequency
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // Very slow cycle

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 350; // Sweep width

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency); // Modulate filter frequency
    
    bandpass.frequency.value = 450; // Base frequency

    noise.connect(bandpass);
    bandpass.connect(destination);

    lfo.start(0);
    noise.start(0);

    // Return the primary noise node to stop later
    return {
        stop: () => {
            noise.stop();
            lfo.stop();
        }
    };
}

// 6. Flashcard Decks System
function setupFlashcards() {
    const form = document.getElementById('create-flashcard-form');
    const fStage = document.getElementById('flashcard-stage-wrapper');
    const fBox = document.getElementById('flashcard-element');
    const fInner = document.getElementById('flashcard-inner');
    const emptyState = document.getElementById('fc-empty-state');
    
    const fcFrontDisplay = document.getElementById('fc-front-display');
    const fcBackDisplay = document.getElementById('fc-back-display');
    
    const rateControls = document.getElementById('flashcard-grading-controls');
    const fcCounter = document.getElementById('flashcard-counter');
    const btnClearCards = document.getElementById('btn-clear-cards');

    let currentCardIndex = 0;
    let activeDeckFilter = 'all';

    // Submit form to create card
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const category = document.getElementById('fc-deck').value.trim();
        const front = document.getElementById('fc-front').value.trim();
        const back = document.getElementById('fc-back').value.trim();
        
        const card = {
            id: Date.now(),
            category: category,
            front: front,
            back: back,
            mastered: false,
            reviewsCount: 0
        };

        state.flashcards.push(card);
        localStorage.setItem('aurastudy_flashcards', JSON.stringify(state.flashcards));
        
        // Reset form fields
        document.getElementById('fc-front').value = '';
        document.getElementById('fc-back').value = '';

        updateDeckChips();
        showActiveDeckCard();
        updateDashboardStats();
    });

    // Flip card trigger
    fBox.addEventListener('click', () => {
        fBox.classList.toggle('flipped');
        if (fBox.classList.contains('flipped')) {
            rateControls.classList.remove('hidden');
        } else {
            rateControls.classList.add('hidden');
        }
    });

    // Spaced repetition rating clicks
    const rateBtns = document.querySelectorAll('.btn-grade');
    rateBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid re-flipping card
            const grade = btn.getAttribute('data-grade');
            handleCardGrading(grade);
        });
    });

    // Delete Decks Cache
    btnClearCards.addEventListener('click', () => {
        if (confirm('Delete all generated flashcards?')) {
            state.flashcards = [];
            localStorage.removeItem('aurastudy_flashcards');
            updateDeckChips();
            showActiveDeckCard();
            updateDashboardStats();
        }
    });

    function updateDeckChips() {
        const chipsContainer = document.getElementById('deck-chips-container');
        chipsContainer.innerHTML = '';
        
        // Filter unique categories
        const categories = [...new Set(state.flashcards.map(c => c.category))];
        
        // All cards chip
        const allChip = document.createElement('span');
        allChip.className = `deck-chip ${activeDeckFilter === 'all' ? 'active' : ''}`;
        allChip.textContent = `All Cards (${state.flashcards.length})`;
        allChip.addEventListener('click', () => {
            activeDeckFilter = 'all';
            updateDeckChips();
            showActiveDeckCard();
        });
        chipsContainer.appendChild(allChip);

        // Individual category chips
        categories.forEach(cat => {
            const count = state.flashcards.filter(c => c.category === cat).length;
            const chip = document.createElement('span');
            chip.className = `deck-chip ${activeDeckFilter === cat ? 'active' : ''}`;
            chip.textContent = `${cat} (${count})`;
            chip.addEventListener('click', () => {
                activeDeckFilter = cat;
                updateDeckChips();
                showActiveDeckCard();
            });
            chipsContainer.appendChild(chip);
        });
    }

    function showActiveDeckCard() {
        const filteredCards = activeDeckFilter === 'all' 
            ? state.flashcards 
            : state.flashcards.filter(c => c.category === activeDeckFilter);
        
        fBox.classList.remove('flipped');
        rateControls.classList.add('hidden');

        if (filteredCards.length === 0) {
            fBox.classList.add('hidden');
            emptyState.classList.remove('hidden');
            fcCounter.textContent = 'Card 0 of 0';
        } else {
            fBox.classList.remove('hidden');
            emptyState.classList.add('hidden');

            if (currentCardIndex >= filteredCards.length) {
                currentCardIndex = 0;
            }

            const card = filteredCards[currentCardIndex];
            fcFrontDisplay.textContent = card.front;
            fcBackDisplay.textContent = card.back;
            fcCounter.textContent = `Card ${currentCardIndex + 1} of ${filteredCards.length}`;

            // Math Rendering for front/back contents
            if (window.renderMathInElement) {
                window.renderMathInElement(fcFrontDisplay, { throwOnError: false });
                window.renderMathInElement(fcBackDisplay, { throwOnError: false });
            }
        }
    }

    function handleCardGrading(grade) {
        const filteredCards = activeDeckFilter === 'all' 
            ? state.flashcards 
            : state.flashcards.filter(c => c.category === activeDeckFilter);
        
        if (filteredCards.length === 0) return;

        const currentCard = filteredCards[currentCardIndex];
        currentCard.reviewsCount++;

        if (grade === 'easy') {
            currentCard.mastered = true;
        } else if (grade === 'hard') {
            currentCard.mastered = false;
        }
        
        // Save to LocalStorage
        localStorage.setItem('aurastudy_flashcards', JSON.stringify(state.flashcards));

        // Move to next card index
        currentCardIndex = (currentCardIndex + 1) % filteredCards.length;
        
        showActiveDeckCard();
        updateDashboardStats();
    }

    // Init flashcards layouts
    updateDeckChips();
    showActiveDeckCard();
}
