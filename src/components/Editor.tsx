import React, { useRef, useEffect, useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Plus, 
  X, 
  FileCode, 
  FileText, 
  FileSpreadsheet, 
  Code2 
} from 'lucide-react';
import { CodeFile, SupportedLanguage } from '../types';

interface EditorProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onUpdateFileContent: (id: string, content: string) => void;
  onAddFile: (name: string, language: SupportedLanguage) => void;
  onRemoveFile: (id: string) => void;
  onChangeLanguage: (id: string, language: SupportedLanguage) => void;
}

export const Editor: React.FC<EditorProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onUpdateFileContent,
  onAddFile,
  onRemoveFile,
  onChangeLanguage,
}) => {
  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLang, setNewFileLang] = useState<SupportedLanguage>('javascript');

  const content = activeFile ? activeFile.content : '';
  const linesCount = content.split('\n').length;

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Handle Tab key indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onUpdateFileContent(activeFile.id, newValue);

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.name || 'code.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    onAddFile(newFileName.trim(), newFileLang);
    setNewFileName('');
    setIsAddingFile(false);
  };

  const getLanguageIcon = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'html':
      case 'css':
        return <Code2 className="w-3.5 h-3.5 text-amber-500" />;
      case 'sql':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />;
      case 'json':
      case 'markdown':
        return <FileText className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-violet-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* File Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 pt-1 overflow-x-auto shrink-0 select-none">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {files.map((file) => {
            const isActive = file.id === activeFileId;
            return (
              <div
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition-colors border-t border-l border-r ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 shadow-xs'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'
                }`}
              >
                {getLanguageIcon(file.language)}
                <span className="truncate max-w-[120px]">{file.name}</span>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(file.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                    title="Datei schließen"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          <button
            onClick={() => setIsAddingFile(true)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Neue Datei hinzufügen"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Language selector & stats */}
        <div className="flex items-center gap-2 pr-2 text-xs text-slate-500">
          <select
            value={activeFile?.language || 'javascript'}
            onChange={(e) => onChangeLanguage(activeFile.id, e.target.value as SupportedLanguage)}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-800 py-1 px-2 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
      </div>

      {/* New File Modal / In-line Prompt */}
      {isAddingFile && (
        <form
          onSubmit={handleCreateFile}
          className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs"
        >
          <span className="font-semibold text-slate-700 dark:text-slate-300">Neue Datei:</span>
          <input
            type="text"
            placeholder="z.B. helper.ts, styles.css"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            autoFocus
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-slate-100 flex-1 focus:ring-1 focus:ring-amber-500 outline-none"
          />
          <select
            value={newFileLang}
            onChange={(e) => setNewFileLang(e.target.value as SupportedLanguage)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-slate-100"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">Python</option>
            <option value="json">JSON</option>
          </select>
          <button
            type="submit"
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded"
          >
            Erstellen
          </button>
          <button
            type="button"
            onClick={() => setIsAddingFile(false)}
            className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Abbrechen
          </button>
        </form>
      )}

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative font-mono text-sm">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 py-3 bg-slate-50 dark:bg-slate-950/70 border-r border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 text-xs select-none text-right pr-3 overflow-hidden tabular-nums font-mono leading-6"
        >
          {Array.from({ length: Math.max(linesCount, 1) }).map((_, i) => (
            <div key={i} className="h-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onUpdateFileContent(activeFile.id, e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          placeholder="Code hier schreiben oder einfügen..."
          className="flex-1 p-3 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none resize-none font-mono text-xs sm:text-sm leading-6 selection:bg-amber-500/25 dark:selection:bg-amber-500/35 overflow-y-auto"
        />
      </div>

      {/* Editor Footer Status Bar */}
      <div className="h-7 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 flex items-center justify-between text-xs text-slate-500 select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="tabular-nums">{linesCount} Zeilen</span>
          <span>·</span>
          <span className="tabular-nums">{content.length} Zeichen</span>
          <span>·</span>
          <span className="capitalize">{activeFile?.language}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center gap-1 px-1.5"
            title="Code in Zwischenablage kopieren"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span className="text-[11px]">{copied ? 'Kopiert!' : 'Kopieren'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center gap-1 px-1.5"
            title="Datei herunterladen"
          >
            <Download className="w-3 h-3" />
            <span className="text-[11px]">Download</span>
          </button>

          <button
            onClick={() => onUpdateFileContent(activeFile.id, '')}
            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-colors"
            title="Editor leeren"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
