import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Award, Target, RefreshCw } from 'lucide-react';

/**
 * ProgressTracker Component
 * --------------------------
 * A dedicated study progress tracker that shows:
 * - Overall progress via a big animated ring/bar
 * - Per-subject progress sliders (0-100%)
 * - Color-coded status labels (Not Started, In Progress, Complete)
 * - Persists data to localStorage + syncs to backend/Firebase
 */

// Color palette for subjects
const SUBJECT_COLORS = [
  { from: '#8b5cf6', to: '#6366f1' },  // violet -> indigo
  { from: '#ec4899', to: '#f43f5e' },  // pink -> rose
  { from: '#06b6d4', to: '#3b82f6' },  // cyan -> blue
  { from: '#f59e0b', to: '#f97316' },  // amber -> orange
  { from: '#10b981', to: '#14b8a6' },  // emerald -> teal
  { from: '#a855f7', to: '#d946ef' },  // purple -> fuchsia
];

function ProgressTracker({ studyPlan, onUpdatePlan, API_BASE_URL }) {
  // Extract subjects from the study plan, or from standalone localStorage state
  const subjects = useMemo(() => {
    if (studyPlan?.subjects) {
      return studyPlan.subjects.split(',').map(s => s.trim());
    }
    // Fallback: try to parse from localStorage
    const stored = localStorage.getItem('aurastudy_progress');
    if (stored) {
      const parsed = JSON.parse(stored);
      return Object.keys(parsed);
    }
    return [];
  }, [studyPlan]);

  // Initialize per-subject progress from localStorage or plan
  const [subjectProgress, setSubjectProgress] = useState(() => {
    const stored = localStorage.getItem('aurastudy_progress');
    if (stored) {
      return JSON.parse(stored);
    }
    const initial = {};
    subjects.forEach(s => { initial[s] = 0; });
    return initial;
  });

  // Sync subjects list if plan changes
  useEffect(() => {
    setSubjectProgress(prev => {
      const updated = { ...prev };
      subjects.forEach(s => {
        if (updated[s] === undefined) updated[s] = 0;
      });
      return updated;
    });
  }, [subjects]);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('aurastudy_progress', JSON.stringify(subjectProgress));
  }, [subjectProgress]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((sum, s) => sum + (subjectProgress[s] || 0), 0);
    return Math.round(total / subjects.length);
  }, [subjects, subjectProgress]);

  // Handle slider change for a subject
  const handleSliderChange = (subject, value) => {
    const newProgress = { ...subjectProgress, [subject]: parseInt(value) };
    setSubjectProgress(newProgress);
  };

  // Sync progress with backend
  const syncToBackend = async () => {
    try {
      await fetch(`${API_BASE_URL}/progress/local_user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: studyPlan,
          subjectProgress: subjectProgress,
        })
      });
    } catch (err) {
      console.warn('Progress sync failed. Saved locally.');
    }
  };

  // Get status label and styling
  const getStatus = (value) => {
    if (value === 0) return { label: 'Not Started', className: 'bg-slate-100 dark:bg-slate-800 text-slate-500' };
    if (value < 50) return { label: 'In Progress', className: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600' };
    if (value < 100) return { label: 'Almost Done', className: 'bg-blue-100 dark:bg-blue-950/30 text-blue-500' };
    return { label: 'Complete ✓', className: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500' };
  };

  // Get color for subject index
  const getColor = (idx) => SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

  // Reset all progress
  const handleReset = () => {
    if (confirm('Reset all progress to 0%?')) {
      const reset = {};
      subjects.forEach(s => { reset[s] = 0; });
      setSubjectProgress(reset);
    }
  };

  // No subjects state
  if (subjects.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Subjects to Track</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Create a study plan first in the <strong>Study Planner</strong> tab to start tracking your progress per subject.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Progress Tracker</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Update your study progress per subject using the sliders below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncToBackend}
            className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-violet-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Sync
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-slate-200 dark:border-darkBorder text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-sm font-semibold"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Overall Progress Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Overall Progress</span>
              <span className="text-2xl font-extrabold text-violet-500">{overallProgress}%</span>
            </div>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full shadow-md shadow-violet-500/20 transition-all duration-700 ease-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-lg font-extrabold text-emerald-500">
              {subjects.filter(s => (subjectProgress[s] || 0) === 100).length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-amber-500">
              {subjects.filter(s => (subjectProgress[s] || 0) > 0 && (subjectProgress[s] || 0) < 100).length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-slate-400">
              {subjects.filter(s => (subjectProgress[s] || 0) === 0).length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Not Started</p>
          </div>
        </div>
      </div>

      {/* Per-Subject Progress Sliders */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Subject-wise Progress
        </h3>

        {subjects.map((subject, idx) => {
          const value = subjectProgress[subject] || 0;
          const status = getStatus(value);
          const color = getColor(idx);

          return (
            <div
              key={subject}
              className="p-5 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-darkBorder shadow-sm space-y-3 transition-all duration-200 hover:shadow-md"
            >
              {/* Subject Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}
                  />
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{subject}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${status.className}`}>
                    {status.label}
                  </span>
                  <span className="text-lg font-extrabold" style={{ color: color.from }}>{value}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${value}%`,
                    background: `linear-gradient(90deg, ${color.from}, ${color.to})`
                  }}
                />
              </div>

              {/* Slider Input */}
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={value}
                  onChange={(e) => handleSliderChange(subject, e.target.value)}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-violet-500 bg-slate-200 dark:bg-slate-700"
                  style={{
                    accentColor: color.from,
                  }}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => {
                    const v = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                    handleSliderChange(subject, v);
                  }}
                  className="w-16 text-center text-sm font-bold border border-slate-200 dark:border-darkBorder rounded-lg py-1.5 bg-transparent focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievement Badge */}
      {overallProgress === 100 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center space-y-2 shadow-lg shadow-emerald-500/20 animate-pulse">
          <Award className="w-10 h-10 mx-auto" />
          <h3 className="text-lg font-extrabold">🎉 All Subjects Complete!</h3>
          <p className="text-sm text-emerald-100">You've mastered every subject. Keep up the amazing work!</p>
        </div>
      )}

    </div>
  );
}

export default ProgressTracker;
