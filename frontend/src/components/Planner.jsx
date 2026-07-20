import React, { useState } from 'react';
import { CalendarRange, Sparkles, Check, Download, RotateCcw, AlertTriangle } from 'lucide-react';

function Planner({ studyPlan, onUpdatePlan, API_BASE_URL }) {
  const [subjects, setSubjects] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hours, setHours] = useState(3);
  const [style, setStyle] = useState('balanced');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [generating, setGenerating] = useState(false);

  // Form submit handler
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subjects || !examDate) return;

    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/planner/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          examDate,
          hours,
          style,
          difficulty
        })
      });
      const data = await res.json();
      
      if (data.plan) {
        // Embed the configured study parameters
        const fullPlan = {
          ...data.plan,
          hours,
          subjects,
          examDate
        };
        onUpdatePlan(fullPlan);
      }
    } catch (err) {
      console.warn('Backend server connection error. Generating simulated timetable locally.');
      // Create local fallback simulated plan
      const mockPlan = simulatePlannerLocally(subjects, examDate, hours, style, difficulty);
      onUpdatePlan(mockPlan);
    } finally {
      setGenerating(false);
    }
  };

  const simulatePlannerLocally = (subjs, date, hrs, stl, diff) => {
    const list = subjs.split(',').map(s => s.trim());
    const daysDiff = Math.ceil(Math.abs(new Date(date) - new Date('2026-07-20')) / (1000 * 60 * 60 * 24));
    const weeksCount = Math.max(2, Math.min(8, Math.round(daysDiff / 7)));

    const weeks = [];
    for (let w = 1; w <= weeksCount; w++) {
      const subj = list[(w - 1) % list.length];
      weeks.push({
        title: `Week ${w}: Deepening ${subj} (${diff.toUpperCase()})`,
        tasks: [
          { name: `Core concepts of ${subj}`, desc: `Study definitions, theorems, and formulas. Focus on ${stl} methodologies.`, completed: false },
          { name: `Practice sheet for ${subj}`, desc: `Spend ${hrs} hours resolving problem cases and review errors.`, completed: false },
          { name: `Active Recall quiz`, desc: `Write down self-test sheets to test memory parameters.`, completed: false }
        ]
      });
    }
    return { weeks, hours: hrs, subjects: subjs, examDate: date };
  };

  const handleToggleTask = (wIdx, tIdx) => {
    if (!studyPlan) return;
    const newPlan = JSON.parse(JSON.stringify(studyPlan));
    const task = newPlan.weeks[wIdx].tasks[tIdx];
    task.completed = !task.completed;
    onUpdatePlan(newPlan);
  };

  const handleReset = () => {
    if (confirm('Discard study plan and reset?')) {
      onUpdatePlan(null);
    }
  };

  const handleDownload = () => {
    if (!studyPlan) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(studyPlan, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `AuraStudy_Plan.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  // Calculate totals
  let totalTasks = 0;
  let completedTasks = 0;
  if (studyPlan && studyPlan.weeks) {
    studyPlan.weeks.forEach(w => {
      w.tasks.forEach(t => {
        totalTasks++;
        if (t.completed) completedTasks++;
      });
    });
  }
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* If No Plan Exists: Render Wizard Form */}
      {!studyPlan ? (
        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarRange className="text-violet-500 w-6 h-6" />
              Create Study Plan
            </h2>
            <p className="text-sm text-slate-400 mt-1">Configure your academic parameters to generate a weekly timetable.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Subjects to study (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Mathematics, Calculus, Organic Chemistry"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Target Exam / Goal Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex justify-between">
                  <span>Available Study Hours / Day</span>
                  <span className="text-violet-500 font-bold">{hours} hours</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-slate-100 dark:bg-slate-800 accent-violet-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Learning Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-violet-500 transition-all duration-200"
                >
                  <option value="balanced">Balanced (Reading & Exercises)</option>
                  <option value="visual">Visual (Diagrams & Videos)</option>
                  <option value="practice">Practice Heavy (Coding/Problems)</option>
                  <option value="theoretical">Theoretical (Detailed Reading)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Starting Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-violet-500 transition-all duration-200"
                >
                  <option value="beginner">Beginner (No background)</option>
                  <option value="intermediate">Intermediate (Basic understanding)</option>
                  <option value="advanced">Advanced (Deep review)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-transform duration-150 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Synthesizing Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Timetable
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* If Plan Exists: Render Timeline View */
        <div className="space-y-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Study Timetable Timeline</h2>
              <p className="text-sm text-slate-400 mt-1">Check off tasks as you finish them to update progress metrics.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="px-4 py-2 border border-slate-200 dark:border-darkBorder text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-200 flex items-center gap-1.5 text-sm font-semibold"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-red-200 dark:border-red-950/30 text-red-500 bg-red-50/20 rounded-xl hover:bg-red-500 hover:text-white transition-colors duration-200 flex items-center gap-1.5 text-sm font-semibold"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Plan
              </button>
            </div>
          </div>

          {/* Progress Tracker Banner */}
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm space-y-3">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Overall Completion Target</span>
              <span className="text-violet-500">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 shadow-md shadow-violet-500/20 transition-all duration-500"
              />
            </div>
          </div>

          {/* Timeline Nodes List */}
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-darkBorder space-y-8">
            {studyPlan.weeks.map((week, wIndex) => {
              const allWeekCompleted = week.tasks.every(t => t.completed);
              
              return (
                <div key={wIndex} className="relative">
                  {/* Timeline Dot Indicator */}
                  <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                    allWeekCompleted 
                      ? 'bg-violet-500 border-violet-500 shadow-md shadow-violet-500/30' 
                      : 'bg-white dark:bg-darkCard border-slate-300 dark:border-slate-600'
                  }`} />

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{week.title}</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {week.tasks.map((task, tIndex) => (
                        <div
                          key={tIndex}
                          onClick={() => handleToggleTask(wIndex, tIndex)}
                          className={`p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition-all duration-200 ${
                            task.completed
                              ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-500/30 hover:bg-emerald-50/30'
                              : 'bg-white dark:bg-darkCard border-slate-200 dark:border-darkBorder hover:border-slate-300 dark:hover:border-slate-800 hover:shadow-sm'
                          }`}
                        >
                          <button className={`mt-0.5 flex-shrink-0 transition-colors duration-200 ${
                            task.completed ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            {task.completed ? (
                              <Check className="w-5 h-5 stroke-[3px]" />
                            ) : (
                              <span className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 block" />
                            )}
                          </button>

                          <div className="flex-grow">
                            <span className={`text-sm font-semibold block ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                              {task.name}
                            </span>
                            <span className={`text-xs block mt-1 leading-relaxed ${task.completed ? 'text-slate-400 dark:text-slate-500/70' : 'text-slate-400 dark:text-slate-500'}`}>
                              {task.desc}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default Planner;
