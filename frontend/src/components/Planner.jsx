import React, { useState } from 'react';
import { CalendarRange, Sparkles, Check, Download, RotateCcw, AlertTriangle } from 'lucide-react';

function Planner({ studyPlan, onUpdatePlan, API_BASE_URL }) {
  const [subjects, setSubjects] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hours, setHours] = useState(3);
  const [style, setStyle] = useState('balanced');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [divisionMethod, setDivisionMethod] = useState('equal');
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
          difficulty,
          divisionMethod
        })
      });
      const data = await res.json();
      
      if (data.plan) {
        // Embed the configured study parameters
        const fullPlan = {
          ...data.plan,
          hours,
          subjects,
          examDate,
          divisionMethod
        };
        onUpdatePlan(fullPlan);
      }
    } catch (err) {
      console.warn('Backend server connection error. Generating simulated timetable locally.');
      // Create local fallback simulated plan
      const mockPlan = simulatePlannerLocally(subjects, examDate, hours, style, difficulty, divisionMethod);
      onUpdatePlan(mockPlan);
    } finally {
      setGenerating(false);
    }
  };

  const simulatePlannerLocally = (subjs, date, hrs, stl, diff, divMethod) => {
    const list = subjs.split(',').map(s => s.trim());
    const daysDiff = Math.ceil(Math.abs(new Date(date) - new Date('2026-07-20')) / (1000 * 60 * 60 * 24));
    const weeksCount = Math.max(2, Math.min(8, Math.round(daysDiff / 7)));
    const totalWeeklyHours = hrs * 7;

    // Calculate hours division per subject
    const subjectHours = {};
    if (divMethod === 'equal') {
      const equalShare = (totalWeeklyHours / list.length).toFixed(1);
      list.forEach(s => {
        subjectHours[s] = equalShare;
      });
    } else {
      // Priority based: first subjects get more hours
      list.forEach((s, idx) => {
        let percentage = 0.2; // default
        if (list.length === 1) percentage = 1.0;
        else if (list.length === 2) percentage = idx === 0 ? 0.65 : 0.35;
        else if (list.length === 3) percentage = idx === 0 ? 0.5 : idx === 1 ? 0.3 : 0.2;
        else {
          if (idx === 0) percentage = 0.4;
          else if (idx === 1) percentage = 0.3;
          else percentage = 0.3 / (list.length - 2);
        }
        subjectHours[s] = (totalWeeklyHours * percentage).toFixed(1);
      });
    }

    const weeks = [];
    for (let w = 1; w <= weeksCount; w++) {
      const subj = list[(w - 1) % list.length];
      const allocHours = subjectHours[subj];
      const priorityLabel = divMethod === 'priority' && list.indexOf(subj) === 0 ? 'High Priority' : 'Standard Priority';
      
      weeks.push({
        title: `Week ${w}: Deepening ${subj} (${diff.toUpperCase()})`,
        tasks: [
          { 
            name: `Core Study: ${subj}`, 
            desc: `Master core parameters of ${subj}. Style: ${stl}. Allocated: ${allocHours} hrs/week (${priorityLabel}).`, 
            completed: false 
          },
          { 
            name: `Targeted Exercises`, 
            desc: `Complete challenging problems. Review incorrect answers.`, 
            completed: false 
          },
          { 
            name: `Recall Self-Quiz`, 
            desc: `Assess memory parameters using active recall strategies.`, 
            completed: false 
          }
        ]
      });
    }
    return { weeks, hours: hrs, subjects: subjs, examDate: date, divisionMethod: divMethod };
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

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Hours Division Method</label>
              <select
                value={divisionMethod}
                onChange={(e) => setDivisionMethod(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-darkBorder bg-slate-50 dark:bg-slate-900/50 outline-none focus:border-violet-500 transition-all duration-200"
              >
                <option value="equal">Divide Available Hours Equally (Balanced Schedule)</option>
                <option value="priority">Priority-Based Division (First subjects get more study focus)</option>
              </select>
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

          {/* Hours Allocation Summary Table */}
          {(() => {
            // Build per-subject allocation data from the plan
            const subjectList = studyPlan.subjects
              ? studyPlan.subjects.split(',').map(s => s.trim())
              : [...new Set(studyPlan.weeks.map(w => {
                  const match = w.title.match(/:\s*(?:Deepening|Master)\s+(.+?)\s*\(/);
                  return match ? match[1] : w.title;
                }))];

            const dailyHours = studyPlan.hours || 3;
            const weeklyHours = dailyHours * 7;
            const divMethod = studyPlan.divisionMethod || 'equal';

            // Compute allocation
            const allocationRows = subjectList.map((subj, idx) => {
              let pct;
              if (divMethod === 'equal') {
                pct = 1 / subjectList.length;
              } else {
                if (subjectList.length === 1) pct = 1.0;
                else if (subjectList.length === 2) pct = idx === 0 ? 0.65 : 0.35;
                else if (subjectList.length === 3) pct = idx === 0 ? 0.5 : idx === 1 ? 0.3 : 0.2;
                else {
                  if (idx === 0) pct = 0.4;
                  else if (idx === 1) pct = 0.3;
                  else pct = 0.3 / (subjectList.length - 2);
                }
              }
              return {
                subject: subj,
                hoursPerWeek: (weeklyHours * pct).toFixed(1),
                hoursPerDay: (dailyHours * pct).toFixed(1),
                percentage: Math.round(pct * 100),
                priority: divMethod === 'priority'
                  ? (idx === 0 ? 'High' : idx === 1 ? 'Medium' : 'Standard')
                  : 'Equal'
              };
            });

            return (
              <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    📊 Hours Allocation Summary
                  </h3>
                  <span className="text-xs font-semibold text-violet-500 bg-violet-50 dark:bg-violet-950/30 px-3 py-1 rounded-full">
                    {divMethod === 'equal' ? 'Equal Division' : 'Priority-Based'}
                  </span>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-darkBorder">
                        <th className="pb-3 font-bold text-slate-500 dark:text-slate-400">Subject</th>
                        <th className="pb-3 font-bold text-slate-500 dark:text-slate-400 text-center">Priority</th>
                        <th className="pb-3 font-bold text-slate-500 dark:text-slate-400 text-center">Hrs / Day</th>
                        <th className="pb-3 font-bold text-slate-500 dark:text-slate-400 text-center">Hrs / Week</th>
                        <th className="pb-3 font-bold text-slate-500 dark:text-slate-400 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocationRows.map((row, ri) => (
                        <tr key={ri} className="border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                          <td className="py-3 font-semibold">{row.subject}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              row.priority === 'High'
                                ? 'bg-red-100 dark:bg-red-950/30 text-red-500'
                                : row.priority === 'Medium'
                                  ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}>
                              {row.priority}
                            </span>
                          </td>
                          <td className="py-3 text-center font-code font-semibold">{row.hoursPerDay}h</td>
                          <td className="py-3 text-center font-code font-semibold">{row.hoursPerWeek}h</td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                                  style={{ width: `${row.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-500 w-8 text-right">{row.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-3">
                  {allocationRows.map((row, ri) => (
                    <div key={ri} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{row.subject}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.priority === 'High' ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-500'
                        }`}>{row.priority}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{row.hoursPerDay}h/day · {row.hoursPerWeek}h/week</span>
                        <span className="font-bold">{row.percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${row.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs text-slate-400 dark:text-slate-500 flex justify-between border-t border-slate-100 dark:border-slate-800/40">
                  <span>Total: {dailyHours}h/day · {weeklyHours}h/week</span>
                  <span>{studyPlan.weeks?.length || 0} weeks planned</span>
                </div>
              </div>
            );
          })()}

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
