import React, { useState } from 'react';
import { Sparkles, MessageSquare, X } from 'lucide-react';

interface HamsterMascotBadgeProps {
  onAskAdvice: () => void;
  squashCount: number;
}

const HAMSTER_TIPS = [
  'Tipp: Überprüfe immer Schleifengrenzen auf Off-by-one Fehler (< statt <=)! 🐹',
  'Tipp: Nutze TypeScript strict mode, um Null-Pointer-Bugs schon beim Tippen zu vermeiden! ⚡',
  'Tipp: Kleine, reine Funktionen sind viel einfacher zu testen und zu debuggen! 🧹',
  'Tipp: Nie vergessen: `console.log` vor dem Commit aufräumen! 🥜',
  'Tipp: Bei asynchronen Aufrufen immer `try/catch` oder Fehlerbehandlung nutzen! 🔒',
  'Tipp: Nutze `font-variant-numeric: tabular-nums` für zitterfreie Zahlen in Dashboards! 📊',
];

export const HamsterMascotBadge: React.FC<HamsterMascotBadgeProps> = ({
  onAskAdvice,
  squashCount,
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [showTip, setShowTip] = useState(true);

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % HAMSTER_TIPS.length);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-end gap-3 pointer-events-none select-none">
      {showTip && (
        <div className="pointer-events-auto max-w-xs bg-white dark:bg-slate-900 border border-amber-500/30 rounded-2xl p-3 shadow-lg flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex-1 text-xs text-slate-700 dark:text-slate-300">
            <div className="font-semibold text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3" />
              <span>Hamster Bug Pro-Tipp</span>
            </div>
            <p className="leading-relaxed cursor-pointer" onClick={handleNextTip}>
              {HAMSTER_TIPS[tipIndex]}
            </p>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
              <button
                onClick={handleNextTip}
                className="hover:text-amber-500 transition-colors cursor-pointer"
              >
                Nächster Tipp →
              </button>
              {squashCount > 0 && (
                <span className="text-emerald-500 font-semibold tabular-nums">
                  {squashCount} Bugs gefixt!
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowTip(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            title="Schließen"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Mascot circular button */}
      <button
        onClick={onAskAdvice}
        className="pointer-events-auto group relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-amber-500 shadow-xl bg-slate-900 hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
        title="Mit Hamster Bug sprechen"
      >
        <img
          src="/src/assets/images/hamster_bug_mascot_1794606571644.jpg"
          alt="Hamster Bug Mascot"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="text-xl group-hover:scale-110 transition-transform select-none" aria-hidden="true">
          🐹
        </span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
          <MessageSquare className="w-2 h-2 text-white" />
        </span>
      </button>
    </div>
  );
};
