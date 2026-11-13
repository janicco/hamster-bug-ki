import React, { useState } from 'react';
import { 
  Bug, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  AlertTriangle, 
  RefreshCw,
  FileCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SupportedLanguage } from '../types';
import { CodeHighlighter } from '../utils/codeHighlighter';

interface BugSquashLabProps {
  currentCode: string;
  currentLanguage: SupportedLanguage;
  onApplyFixToEditor: (fixedCode: string) => void;
}

export const BugSquashLab: React.FC<BugSquashLabProps> = ({
  currentCode,
  currentLanguage,
  onApplyFixToEditor,
}) => {
  const [inputCode, setInputCode] = useState(currentCode);
  const [errorDescription, setErrorDescription] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>(currentLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [fixedCode, setFixedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSquash = async () => {
    if (!inputCode.trim()) {
      setErrorMsg('Bitte gib zuerst den Code ein, der untersucht werden soll.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setDiagnosis(null);
    setFixedCode(null);

    try {
      const res = await fetch('/api/squash-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          language,
          errorDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server-Fehler beim Untersuchen.');
      }

      const fullResult: string = data.result;

      // Extract code block from AI response
      const codeBlockMatch = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/.exec(fullResult);
      if (codeBlockMatch) {
        setFixedCode(codeBlockMatch[2].trim());
        // Clean out code block from diagnosis text
        const cleanedDiagnosis = fullResult.replace(/```[a-zA-Z0-9_-]*\n[\s\S]*?```/, '').trim();
        setDiagnosis(cleanedDiagnosis);
      } else {
        setDiagnosis(fullResult);
      }

      // Celebrate bug squash with confetti!
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#38bdf8', '#10b981'],
      });
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Fehler beim Squashen des Bugs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSampleBug = () => {
    setInputCode(`// Buggy JavaScript Funktion
function findTopUser(users) {
  let maxScore = 0;
  let bestUser = null;
  // Fehler: Schleifenbedingung <= führt zu Array-Überlauf (Index Out of Bounds)
  for (let i = 0; i <= users.length; i++) {
    // Fehler: users[i] ist im letzten Schritt undefined -> TypeError: Cannot read property 'score'
    if (users[i].score > maxScore) {
      maxScore = users[i].score;
      bestUser = users[i];
    }
  }
  return bestUser.name; // Fehler: Wenn users leer ist, stürzt bestUser.name ab
}`);
    setLanguage('javascript');
    setErrorDescription('Uncaught TypeError: Cannot read property score of undefined');
  };

  const handleCopyFixed = async () => {
    if (!fixedCode) return;
    try {
      await navigator.clipboard.writeText(fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6">
      {/* Banner / Header */}
      <div className="max-w-6xl mx-auto w-full mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-amber-500/30 bg-amber-500/10 shrink-0 flex items-center justify-center">
            <img
              src="/src/assets/images/hamster_bug_squash_1794606572033.jpg"
              alt="Hamster Bug Squash Mascot"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-2xl" aria-hidden="true">🐹</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Hamster Bug Squash Lab
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/30">
                KI-Fehlerbehebung
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Füge deinen fehlerhaften Code ein. Hamster Bug analysiert die Fehlerursache, behebt Syntax- und Logikfehler und liefert den sauberen Code.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLoadSampleBug}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Beispiel-Bug laden
          </button>
          <button
            onClick={() => setInputCode(currentCode)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <FileCode className="w-3.5 h-3.5 text-sky-500" />
            <span>Aktuellen Editor-Code übernehmen</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[480px]">
        {/* Left Column: Problem Input */}
        <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Bug className="w-4 h-4 text-rose-500" />
              Problemcode
            </span>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded px-2 py-0.5 text-xs font-mono"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="sql">SQL</option>
              </select>
            </div>
          </div>

          <div className="flex-1 p-3 flex flex-col">
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="// Füge hier deinen problematischen Code ein..."
              className="flex-1 min-h-[220px] p-3 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-slate-100 resize-none leading-relaxed"
            />

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fehlermeldung oder Symptom (optional):
              </label>
              <input
                type="text"
                value={errorDescription}
                onChange={(e) => setErrorDescription(e.target.value)}
                placeholder="z.B. TypeError: Cannot read properties of undefined, oder Endlosschleife"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {errorMsg && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleSquash}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Hamster Bug squasht Bug...</span>
                  </>
                ) : (
                  <>
                    <Bug className="w-4 h-4" />
                    <span>🐹 Jetzt Bug squashen!</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Diagnosis & Fixed Code */}
        <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Lösung & Bereinigter Code
            </span>

            {fixedCode && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFixed}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 text-xs font-medium flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopiert' : 'Kopieren'}</span>
                </button>
                <button
                  onClick={() => onApplyFixToEditor(fixedCode)}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>In Editor übernehmen</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-3 animate-pulse">
                  <span className="text-2xl">🐹</span>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">
                  Hamster Bug jagt den Fehler...
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Syntax, Off-by-one, Null-Pointer und Edge Cases werden durchkämmt.
                </p>
              </div>
            ) : fixedCode ? (
              <div className="space-y-4">
                {diagnosis && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                    <div className="font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Diagnose & Ursache:
                    </div>
                    <div className="whitespace-pre-wrap">{diagnosis}</div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Korrigierter Code:
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-x-auto text-xs max-h-80">
                    <CodeHighlighter code={fixedCode} language={language} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500">
                <Bug className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-xs max-w-xs">
                  Klicke links auf &quot;Jetzt Bug squashen&quot;, um die automatische Analyse und den korrigierten Code zu sehen.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
