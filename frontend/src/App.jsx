import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarRange, MessageSquare, Sun, Moon, Sparkles, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import DoubtSolver from './components/DoubtSolver';

const API_BASE_URL = 'http://localhost:5000/api';
const USER_ID = 'local_user';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Load progress/timeline from backend or local storage on start
  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/progress/${USER_ID}`);
      const data = await res.json();
      if (data.plan) {
        setStudyPlan(data.plan);
      }
    } catch (err) {
      console.warn('Backend server not running. Falling back to localStorage study plan.');
      const localPlan = localStorage.getItem('aurastudy_plan');
      if (localPlan) {
        setStudyPlan(JSON.parse(localPlan));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (updatedPlan) => {
    setStudyPlan(updatedPlan);
    localStorage.setItem('aurastudy_plan', JSON.stringify(updatedPlan));
    
    // Attempt saving to backend Firestore
    try {
      await fetch(`${API_BASE_URL}/progress/${USER_ID}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: updatedPlan })
      });
    } catch (err) {
      console.warn('Backend sync failed. Saved to local storage only.');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-darkBg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-darkCard border-r border-slate-200 dark:border-darkBorder flex flex-col transform transition-transform duration-300 md:translate-x-0 md:static ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-darkBorder">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            AuraStudy<span className="text-violet-500">.AI</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-l-4 border-violet-500'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => { setActiveTab('planner'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'planner'
                ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-l-4 border-violet-500'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900'
            }`}
          >
            <CalendarRange className="w-5 h-5" />
            Study Planner
          </button>

          <button
            onClick={() => { setActiveTab('chatbot'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'chatbot'
                ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-l-4 border-violet-500'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Doubt Solver Chat
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-darkBorder">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appearance</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-yellow-400 shadow-sm transition-transform duration-200 active:scale-95"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="h-16 border-b border-slate-200 dark:border-darkBorder flex items-center justify-between px-6 bg-white dark:bg-darkCard md:hidden z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold">AuraStudy</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-yellow-400"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {activeTab === 'dashboard' && (
            <Dashboard 
              studyPlan={studyPlan} 
              onUpdatePlan={handleUpdatePlan} 
              onNavigate={setActiveTab} 
            />
          )}
          {activeTab === 'planner' && (
            <Planner 
              studyPlan={studyPlan} 
              onUpdatePlan={handleUpdatePlan} 
              API_BASE_URL={API_BASE_URL}
            />
          )}
          {activeTab === 'chatbot' && (
            <DoubtSolver 
              API_BASE_URL={API_BASE_URL}
            />
          )}
        </main>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </div>
  );
}

export default App;
