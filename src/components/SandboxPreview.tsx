import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  Maximize2, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { CodeFile, ConsoleEntry } from '../types';

interface SandboxPreviewProps {
  files: CodeFile[];
  consoleLogs: ConsoleEntry[];
  onClearLogs: () => void;
  onAddLog: (entry: Omit<ConsoleEntry, 'id'>) => void;
}

export const SandboxPreview: React.FC<SandboxPreviewProps> = ({
  files,
  consoleLogs,
  onClearLogs,
  onAddLog,
}) => {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [consoleFilter, setConsoleFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');
  const [evalInput, setEvalInput] = useState('');
  const [key, setKey] = useState(0); // For forcing iframe reload
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine bundle content
  const htmlFile = files.find((f) => f.language === 'html' || f.name.endsWith('.html')) || files[0];
  const cssFiles = files.filter((f) => f.language === 'css' || f.name.endsWith('.css'));
  const jsFiles = files.filter((f) => ['javascript', 'typescript'].includes(f.language) || f.name.endsWith('.js') || f.name.endsWith('.ts'));

  // Build sandboxed HTML payload with console bridge
  const buildSrcDoc = () => {
    let baseHtml = htmlFile?.content || '<html><body><p>Keine HTML-Datei vorhanden.</p></body></html>';

    // Inject CSS
    const extraCss = cssFiles.map((c) => `<style>${c.content}</style>`).join('\n');
    // Inject JS
    const extraJs = jsFiles.map((j) => `<script>${j.content}</script>`).join('\n');

    const consoleBridgeScript = `
      <script>
        (function() {
          const sendLog = (type, args) => {
            try {
              const message = args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                  try { return JSON.stringify(arg); } catch(e) { return String(arg); }
                }
                return String(arg);
              }).join(' ');
              window.parent.postMessage({ type: 'CONSOLE_LOG', level: type, message }, '*');
            } catch(e) {}
          };

          const _log = console.log;
          const _warn = console.warn;
          const _error = console.error;
          const _info = console.info;

          console.log = function(...args) { _log.apply(console, args); sendLog('log', args); };
          console.warn = function(...args) { _warn.apply(console, args); sendLog('warn', args); };
          console.error = function(...args) { _error.apply(console, args); sendLog('error', args); };
          console.info = function(...args) { _info.apply(console, args); sendLog('info', args); };

          window.onerror = function(message, source, lineno, colno, error) {
            sendLog('error', ['Laufzeitfehler: ' + message + ' (Zeile ' + lineno + ')']);
            return false;
          };

          window.addEventListener('unhandledrejection', function(event) {
            sendLog('error', ['Unbehandelte Promise-Ablehnung: ' + event.reason]);
          });
        })();
      </script>
    `;

    // Insert bridge script right after head or at beginning
    if (baseHtml.includes('<head>')) {
      baseHtml = baseHtml.replace('<head>', `<head>${consoleBridgeScript}${extraCss}`);
    } else {
      baseHtml = `${consoleBridgeScript}${extraCss}${baseHtml}`;
    }

    if (baseHtml.includes('</body>')) {
      baseHtml = baseHtml.replace('</body>', `${extraJs}</body>`);
    } else {
      baseHtml = `${baseHtml}${extraJs}`;
    }

    return baseHtml;
  };

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
    onAddLog({
      type: 'info',
      message: 'Sandbox neu geladen.',
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // Evaluate JS expression in sandbox iframe
  const handleEvalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalInput.trim()) return;

    onAddLog({
      type: 'info',
      message: `> ${evalInput}`,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (iframeRef.current.contentWindow as any).eval(evalInput);
        onAddLog({
          type: 'log',
          message: `< ${typeof result === 'object' ? JSON.stringify(result) : String(result)}`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      onAddLog({
        type: 'error',
        message: `Evaluation Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    setEvalInput('');
  };

  const filteredLogs = consoleLogs.filter((log) => {
    if (consoleFilter === 'all') return true;
    return log.type === consoleFilter;
  });

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 flex items-center justify-between text-xs shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-emerald-500 fill-current" />
            Live Vorschau
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-[11px] text-slate-500">Isolierte Sandbox</span>
        </div>

        {/* Viewport switch */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => setViewportMode('desktop')}
            title="Desktop Ansicht"
            className={`p-1 rounded ${viewportMode === 'desktop' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            title="Tablet Ansicht"
            className={`p-1 rounded ${viewportMode === 'tablet' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            title="Smartphone Ansicht"
            className={`p-1 rounded ${viewportMode === 'mobile' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
          title="Vorschau neu laden"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="text-[11px]">Neu laden</span>
        </button>
      </div>

      {/* Main Sandbox Iframe Viewport */}
      <div className="flex-1 p-3 flex justify-center items-center bg-slate-200/50 dark:bg-slate-950 overflow-auto">
        <div className={`h-full ${getViewportWidth()} transition-all duration-300 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col`}>
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={buildSrcDoc()}
            title="Hamster Bug Sandbox"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-none bg-white"
          />
        </div>
      </div>

      {/* Interactive Terminal / Console Drawer */}
      <div className="h-56 border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-200 flex flex-col shrink-0">
        <div className="h-8 border-b border-slate-800 px-3 flex items-center justify-between text-xs bg-slate-950 select-none">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              Entwickler-Konsole
            </span>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 ml-4 text-[11px]">
              <button
                onClick={() => setConsoleFilter('all')}
                className={`px-2 py-0.5 rounded ${consoleFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Alle ({consoleLogs.length})
              </button>
              <button
                onClick={() => setConsoleFilter('log')}
                className={`px-2 py-0.5 rounded ${consoleFilter === 'log' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Logs
              </button>
              <button
                onClick={() => setConsoleFilter('warn')}
                className={`px-2 py-0.5 rounded ${consoleFilter === 'warn' ? 'bg-amber-950 text-amber-300' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Warnungen
              </button>
              <button
                onClick={() => setConsoleFilter('error')}
                className={`px-2 py-0.5 rounded ${consoleFilter === 'error' ? 'bg-rose-950 text-rose-300' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Fehler
              </button>
            </div>
          </div>

          <button
            onClick={onClearLogs}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
            title="Konsole leeren"
          >
            <Trash2 className="w-3 h-3" />
            <span>Leeren</span>
          </button>
        </div>

        {/* Logs Stream */}
        <div className="flex-1 p-2 overflow-y-auto font-mono text-xs space-y-1">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 py-2 text-center text-xs">
              Keine Konsolenausgaben vorhanden. Führe deinen Code aus, um Logs und Fehler hier zu sehen.
            </div>
          ) : (
            filteredLogs.map((log) => {
              let icon = <Info className="w-3 h-3 text-sky-400 shrink-0 mt-0.5" />;
              let textColor = 'text-slate-300';
              let bgColor = 'bg-transparent';

              if (log.type === 'error') {
                icon = <AlertCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />;
                textColor = 'text-rose-300';
                bgColor = 'bg-rose-950/20';
              } else if (log.type === 'warn') {
                icon = <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />;
                textColor = 'text-amber-300';
                bgColor = 'bg-amber-950/20';
              } else if (log.type === 'log') {
                icon = <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />;
                textColor = 'text-slate-200';
              }

              return (
                <div key={log.id} className={`flex items-start gap-2 py-1 px-2 rounded ${bgColor} ${textColor} leading-relaxed`}>
                  {icon}
                  <span className="text-[10px] text-slate-500 select-none tabular-nums pt-0.5">{log.timestamp}</span>
                  <span className="flex-1 whitespace-pre-wrap break-all">{log.message}</span>
                </div>
              );
            })
          )}
        </div>

        {/* REPL prompt input */}
        <form onSubmit={handleEvalSubmit} className="h-8 border-t border-slate-800 px-2 flex items-center gap-2 bg-slate-950 font-mono text-xs">
          <span className="text-amber-400 select-none">&gt;</span>
          <input
            type="text"
            value={evalInput}
            onChange={(e) => setEvalInput(e.target.value)}
            placeholder="JavaScript-Befehl ausführen (z.B. 10 * 42, document.title)..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none"
          />
          <button type="submit" className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800">
            Ausführen
          </button>
        </form>
      </div>
    </div>
  );
};
