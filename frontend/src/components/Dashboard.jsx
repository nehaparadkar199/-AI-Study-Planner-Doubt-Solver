import React from 'react';
import { Calendar, CheckCircle2, Circle, MessageSquare, Clock, BookOpen } from 'lucide-react';

function Dashboard({ studyPlan, onUpdatePlan, onNavigate }) {
  
  // Calculate completion percentage
  let totalTasks = 0;
  let completedTasks = 0;
  const uncompletedTasksList = [];

  if (studyPlan && studyPlan.weeks) {
    studyPlan.weeks.forEach((week, wIndex) => {
      if (week.tasks) {
        week.tasks.forEach((task, tIndex) => {
          totalTasks++;
          if (task.completed) {
            completedTasks++;
          } else if (uncompletedTasksList.length < 4) {
            uncompletedTasksList.push({
              ...task,
              wIndex,
              tIndex,
              weekTitle: week.title
            });
          }
        });
      }
    });
  }

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleTask = (wIdx, tIdx) => {
    if (!studyPlan) return;
    const newPlan = JSON.parse(JSON.stringify(studyPlan));
    const task = newPlan.weeks[wIdx].tasks[tIdx];
    task.completed = !task.completed;
    onUpdatePlan(newPlan);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl glow-card relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-extrabold mb-3">Hi Scholar, ready to learn?</h2>
          <p className="text-violet-100 mb-6 leading-relaxed">
            Generate custom timetables, solve academic doubt sessions with gpt-4o-mini, and log your progress.
          </p>
          <button
            onClick={() => onNavigate('planner')}
            className="px-6 py-3 bg-white text-violet-600 font-bold rounded-xl shadow-md hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Create Study Plan
          </button>
        </div>
        <div className="absolute right-8 bottom-0 top-0 hidden lg:flex items-center text-violet-500/20 pointer-events-none">
          <BookOpen className="w-64 h-64" />
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Tracker Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm flex flex-col items-center justify-between text-center">
          <div className="self-start text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Plan Progress
          </div>
          
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={314.16}
                strokeDashoffset={314.16 - (completionPercent / 100) * 314.16}
                className="text-violet-500 transition-all duration-500 ease-out"
              />
            </svg>
            <span className="absolute text-2xl font-extrabold tracking-tight">{completionPercent}%</span>
          </div>

          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
            {totalTasks > 0 ? `${completedTasks} of ${totalTasks} tasks complete` : 'No active study plan'}
          </div>
        </div>

        {/* Study Hours Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
            Study Hours Tracker
          </div>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 text-cyan-500">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <div className="text-3xl font-extrabold">
                {studyPlan ? `${studyPlan.hours || 3}h` : '0h'}
              </div>
              <div className="text-xs text-slate-400 mt-1">Scheduled Study Per Day</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-6">
            Total active weeks: {studyPlan?.weeks?.length || 0}
          </div>
        </div>

        {/* Doubt Stats Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
            Doubt solver stats
          </div>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/20 text-pink-500">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <div className="text-3xl font-extrabold">Active</div>
              <div className="text-xs text-slate-400 mt-1">AI Agent Ready</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-6">
            Powered by OpenRouter gpt-4o-mini
          </div>
        </div>
      </div>

      {/* Daily schedule checklists */}
      <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-500" />
          Today's Schedule Focus
        </h3>

        {uncompletedTasksList.length > 0 ? (
          <div className="space-y-4">
            {uncompletedTasksList.map((task, idx) => (
              <div
                key={idx}
                onClick={() => handleToggleTask(task.wIndex, task.tIndex)}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-start gap-4 cursor-pointer transition-colors duration-200"
              >
                <button className="text-violet-500 mt-0.5 flex-shrink-0">
                  <Circle className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{task.name}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                    {task.desc}
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 mt-2">
                    {task.weekTitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            {studyPlan ? (
              <p className="text-sm font-semibold">🎉 All tasks completed! Great work.</p>
            ) : (
              <p className="text-sm">No active tasks. Create a new study plan to begin!</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
