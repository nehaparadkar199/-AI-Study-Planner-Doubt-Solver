import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, Circle, MessageSquare, Clock, BookOpen, 
  Sparkles, TrendingUp, Target, Zap, Lightbulb, ArrowRight, Award, RefreshCw 
} from 'lucide-react';

function Dashboard({ studyPlan, onUpdatePlan, onNavigate }) {
  const [tipIndex, setTipIndex] = useState(0);

  // Motivational Study Tips Array
  const studyTips = [
    { title: 'The Feynman Technique', desc: 'Explain complex concepts in simple terms as if teaching a beginner to identify knowledge gaps.' },
    { title: 'Active Recall', desc: 'Test yourself immediately after reading instead of passively re-reading notes to boost retention by 50%.' },
    { title: 'Pomodoro 50/10 Rule', desc: 'Focus intensely for 50 minutes, followed by a strict 10-minute break to sustain peak cognitive load.' },
    { title: 'Spaced Repetition', desc: 'Review difficult topics at increasing intervals (1 day, 3 days, 7 days) before your final exam.' }
  ];

  // Calculate completion percentage and task lists
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
          } else if (uncompletedTasksList.length < 5) {
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

  // Extract list of unique subjects
  const subjectList = studyPlan?.subjects 
    ? studyPlan.subjects.split(',').map(s => s.trim()) 
    : [];

  // Toggle task completion status
  const handleToggleTask = (wIdx, tIdx) => {
    if (!studyPlan) return;
    const newPlan = JSON.parse(JSON.stringify(studyPlan));
    const task = newPlan.weeks[wIdx].tasks[tIdx];
    task.completed = !task.completed;
    onUpdatePlan(newPlan);
  };

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 🌅';
    if (hour < 18) return 'Good Afternoon ☀️';
    return 'Good Evening 🌙';
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      
      {/* 🚀 Top Modern Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 border border-violet-500/20 text-white shadow-2xl glow-card relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 top-0 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI Study Workspace Ready
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            {getGreeting()}, <span className="gradient-text-violet">Scholar</span>
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
            Organize daily targets, analyze progress metrics, and solve complex academic doubts instantly with <strong>Nvidia Nemotron 3 AI</strong>.
          </p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('planner')}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              {studyPlan ? 'View Study Plan' : 'Generate Study Plan'}
            </button>
            <button
              onClick={() => onNavigate('chatbot')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold rounded-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <MessageSquare className="w-4 h-4 text-violet-400" />
              Ask Doubt Solver
            </button>
            <button
              onClick={() => onNavigate('progress')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold rounded-xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 text-sm"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Progress Tracker
            </button>
          </div>
        </div>

        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex items-center text-violet-500/10 pointer-events-none">
          <BookOpen className="w-72 h-72" />
        </div>
      </div>

      {/* 📊 Active Subjects Quick Strip */}
      {subjectList.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm flex items-center gap-3 overflow-x-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex-shrink-0 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-violet-500" /> Active Subjects:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {subjectList.map((subject, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 rounded-full text-xs font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 shadow-sm"
              >
                {subject}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 📈 Grid of Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Progress Tracker Ring Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm flex flex-col items-center justify-between text-center glow-card">
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
            <span>Overall Plan Progress</span>
            <Target className="w-4 h-4 text-violet-500" />
          </div>
          
          <div className="relative flex items-center justify-center my-3">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={351.86}
                strokeDashoffset={351.86 - (completionPercent / 100) * 351.86}
                strokeLinecap="round"
                className="text-violet-500 transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{completionPercent}%</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Completed</span>
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
            {totalTasks > 0 ? `${completedTasks} of ${totalTasks} tasks complete` : 'No active study plan'}
          </div>
        </div>

        {/* Study Hours Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm flex flex-col justify-between glow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            <span>Study Hours Allocation</span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 shadow-lg shadow-cyan-500/10">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {studyPlan ? `${studyPlan.hours || 3}h` : '0h'}
                <span className="text-sm font-semibold text-slate-400 ml-1">/ day</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-semibold">
                {studyPlan ? `${(studyPlan.hours || 3) * 7} hours per week` : 'Configure daily hours'}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4 flex items-center justify-between font-medium">
            <span>Planned Duration:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{studyPlan?.weeks?.length || 0} Weeks</span>
          </div>
        </div>

        {/* AI Agent Status Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm flex flex-col justify-between glow-card">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            <span>AI Doubt Solver</span>
            <Zap className="w-4 h-4 text-pink-500" />
          </div>

          <div className="flex items-center gap-4 my-2">
            <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 shadow-lg shadow-pink-500/10">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">Nvidia Nemotron 3</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">OpenRouter Ultra 550B Ready</div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('chatbot')}
            className="w-full py-2 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/40 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 mt-4"
          >
            Start AI Doubt Session <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 💡 AI Study Recommendation & Tip Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Pro Study Strategy</span>
              <span className="text-xs font-semibold text-slate-400">• {studyTips[tipIndex].title}</span>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1 leading-relaxed max-w-3xl">
              "{studyTips[tipIndex].desc}"
            </p>
          </div>
        </div>
        <button
          onClick={() => setTipIndex((tipIndex + 1) % studyTips.length)}
          className="px-4 py-2 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-500/10 text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0 self-start md:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Next Tip
        </button>
      </div>

      {/* 📅 Today's Schedule Checklist */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-violet-500" />
              Action Items & Today's Schedule
            </h2>
            <p className="text-xs text-slate-400 mt-1">Check off tasks as you finish them to automatically update your progress.</p>
          </div>

          <button
            onClick={() => onNavigate('planner')}
            className="text-xs font-bold text-violet-500 hover:text-violet-600 flex items-center gap-1"
          >
            Full Timetable <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {uncompletedTasksList.length > 0 ? (
          <div className="space-y-3">
            {uncompletedTasksList.map((task, idx) => (
              <div
                key={idx}
                onClick={() => handleToggleTask(task.wIndex, task.tIndex)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-darkBorder bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex items-start gap-4 cursor-pointer transition-all duration-200 hover:shadow-sm"
              >
                <button className="text-violet-500 mt-0.5 flex-shrink-0 transition-transform active:scale-95">
                  <Circle className="w-5 h-5 stroke-[2.5px]" />
                </button>
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{task.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {task.desc}
                  </div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-300 mt-2 border border-violet-200 dark:border-violet-800/40">
                    {task.weekTitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            {studyPlan ? (
              <p className="text-sm font-bold text-emerald-500">🎉 All scheduled tasks complete! Exceptional performance.</p>
            ) : (
              <p className="text-sm font-medium">No active tasks found. Click below to generate your smart study plan!</p>
            )}
            <button
              onClick={() => onNavigate('planner')}
              className="px-5 py-2 bg-violet-600 text-white font-bold rounded-xl text-xs shadow-md hover:bg-violet-700 transition-colors"
            >
              Generate Study Plan
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;
