import React, { useState } from 'react';
import { Sparkles, Gamepad2, Wrench, Code2, Cpu, ArrowRight, Play } from 'lucide-react';
import { StarterTemplate } from '../types';
import { STARTER_TEMPLATES } from '../data/templates';

interface SnippetsLibraryProps {
  onLoadTemplate: (template: StarterTemplate, runImmediately?: boolean) => void;
}

export const SnippetsLibrary: React.FC<SnippetsLibraryProps> = ({ onLoadTemplate }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredTemplates = STARTER_TEMPLATES.filter((tpl) => {
    if (filter === 'all') return true;
    return tpl.category === filter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-emerald-500" />;
      case 'tool':
        return <Wrench className="w-4 h-4 text-amber-500" />;
      case 'algorithm':
        return <Cpu className="w-4 h-4 text-violet-500" />;
      default:
        return <Code2 className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6">
      {/* Hero Banner */}
      <div className="max-w-6xl mx-auto w-full mb-8 relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-900 min-h-[200px] flex items-center">
        <img
          src="/src/assets/images/hamster_bug_banner_1794606572733.jpg"
          alt="Hamster Bug Workspace"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 p-6 sm:p-8 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kostenlose Vorlagen & Projekte</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Entdecke Hamster Bug Code-Vorlagen
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Starte sofort mit lauffähigen Mini-Spielen, Algorithmen, Produktivitätstools und modernen UI-Komponenten. Lade beliebigen Code in den Editor und lass Hamster Bug ihn erweitern.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Alle Vorlagen
          </button>
          <button
            onClick={() => setFilter('game')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'game'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Spiele
          </button>
          <button
            onClick={() => setFilter('tool')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'tool'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setFilter('algorithm')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'algorithm'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Algorithmen & Bugs
          </button>
          <button
            onClick={() => setFilter('web')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'web'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Web UI
          </button>
        </div>

        <span className="text-xs text-slate-500 tabular-nums">
          {filteredTemplates.length} Vorlagen verfügbar
        </span>
      </div>

      {/* Grid of Templates */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all shadow-xs group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-500/10 transition-colors">
                {getCategoryIcon(template.category)}
              </div>
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                {template.language}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              {template.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex-1 mb-5">
              {template.description}
            </p>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => onLoadTemplate(template, false)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>In Editor laden</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {template.language === 'html' && (
                <button
                  onClick={() => onLoadTemplate(template, true)}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Direkt in Live-Sandbox öffnen"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Starten</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
