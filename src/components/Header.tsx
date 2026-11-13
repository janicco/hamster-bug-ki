import React from 'react';
import { Moon, Sun, Play, Bug, Sparkles, Terminal } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onRunSandbox: () => void;
  onQuickSquash: () => void;
  isRunning?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  onRunSandbox,
  onQuickSquash,
  isRunning = false,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between gap-8 z-30 shrink-0">
      {/* Zone 1: Single text element wordmark with mascot */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-amber-500/30 bg-amber-500/10 flex items-center justify-center">
          <img
            src="/src/assets/images/hamster_bug_mascot_1794606571644.jpg"
            alt="Hamster Bug"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Graceful styled fallback if image load fails
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-base select-none" aria-hidden="true">🐹</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            Hamster Bug
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (1-2 word labels, single line) */}
      <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'editor'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('squash')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'squash'
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold ring-1 ring-amber-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <Bug className="w-3.5 h-3.5 text-amber-500" />
          <span>Bug-Squash</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'sandbox'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-emerald-500" />
          <span>Sandbox</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 hidden sm:flex items-center gap-1.5 ${
            activeTab === 'templates'
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Vorlagen</span>
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action + Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
          aria-label="Design-Modus umschalten"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {activeTab === 'squash' ? (
          <button
            onClick={onQuickSquash}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Jetzt Squashen</span>
          </button>
        ) : (
          <button
            onClick={onRunSandbox}
            disabled={isRunning}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Läuft...' : 'Ausführen'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
