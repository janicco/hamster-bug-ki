import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  RotateCcw, 
  Bug, 
  Zap, 
  HelpCircle, 
  FileCheck2, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRightCircle, 
  Play 
} from 'lucide-react';
import { ChatMessage, CodeFile } from '../types';
import { CodeHighlighter } from '../utils/codeHighlighter';

interface HamsterChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, actionPrompt?: string) => void;
  onClearChat: () => void;
  isStreaming: boolean;
  activeFile: CodeFile;
  onApplyCodeToEditor: (code: string) => void;
  onRunInSandbox: (code: string, language: string) => void;
}

export const HamsterChat: React.FC<HamsterChatProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isStreaming,
  activeFile,
  onApplyCodeToEditor,
  onRunInSandbox,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isStreaming) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyCode = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(blockId);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback
    }
  };

  // Helper to extract code blocks from markdown responses
  const renderMessageContent = (content: string, messageId: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let blockCount = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const textChunk = content.substring(lastIndex, match.index);
        elements.push(
          <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm my-1">
            {textChunk}
          </div>
        );
      }

      const lang = match[1] || 'javascript';
      const code = match[2];
      const blockId = `${messageId}-block-${blockCount++}`;

      elements.push(
        <div
          key={blockId}
          className="my-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/90 overflow-hidden shadow-xs"
        >
          {/* Code block top toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-200/70 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{lang}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopyCode(code, blockId)}
                className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-300/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                title="Code kopieren"
              >
                {copiedIndex === blockId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === blockId ? 'Kopiert' : 'Kopieren'}</span>
              </button>

              <button
                onClick={() => onApplyCodeToEditor(code)}
                className="px-2 py-0.5 rounded text-[11px] font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 transition-colors flex items-center gap-1"
                title="Diesen Code in den Editor übernehmen"
              >
                <ArrowRightCircle className="w-3 h-3" />
                <span>In Editor</span>
              </button>

              {['html', 'javascript', 'typescript'].includes(lang.toLowerCase()) && (
                <button
                  onClick={() => onRunInSandbox(code, lang)}
                  className="px-2 py-0.5 rounded text-[11px] font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 transition-colors flex items-center gap-1"
                  title="In Sandbox ausführen"
                >
                  <Play className="w-3 h-3" />
                  <span>Sandbox</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-2.5 overflow-x-auto text-xs max-h-96">
            <CodeHighlighter code={code} language={lang} />
          </div>
        </div>
      );

      lastIndex = codeBlockRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      elements.push(
        <div key={`text-${lastIndex}`} className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm my-1">
          {content.substring(lastIndex)}
        </div>
      );
    }

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden">
      {/* Chat Header */}
      <div className="h-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Hamster Bug KI-Assistent</span>
          <span className="text-[10px] text-slate-400">·</span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Online & Kostenlos
          </span>
        </div>

        <button
          onClick={onClearChat}
          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
          title="Verlauf leeren"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="text-[11px]">Neuer Chat</span>
        </button>
      </div>

      {/* Quick developer prompt shortcuts */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto select-none shrink-0">
        <button
          onClick={() => onSendMessage('Untersuche meinen aktuellen Code auf Bugs, logische Fehler und behebe sie gründlich.', 'SQUASH_BUGS')}
          disabled={isStreaming}
          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          <Bug className="w-3 h-3" />
          <span>Bugs finden & squashen</span>
        </button>

        <button
          onClick={() => onSendMessage('Erkläre meinen aktuellen Code schrittweise und verständlich.', 'EXPLAIN_CODE')}
          disabled={isStreaming}
          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          <HelpCircle className="w-3 h-3 text-sky-500" />
          <span>Code erklären</span>
        </button>

        <button
          onClick={() => onSendMessage('Optimiere diesen Code auf Performance, Lesbarkeit und Best Practices.', 'OPTIMIZE_CODE')}
          disabled={isStreaming}
          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Refactoren & Optimieren</span>
        </button>

        <button
          onClick={() => onSendMessage('Schreibe vollständige Unit-Tests für diesen Code.', 'WRITE_TESTS')}
          disabled={isStreaming}
          className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          <FileCheck2 className="w-3 h-3 text-emerald-500" />
          <span>Unit-Tests</span>
        </button>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-16 h-16 rounded-2xl overflow-hidden ring-1 ring-amber-500/30 mb-3 bg-amber-500/10">
              <img
                src="/src/assets/images/hamster_bug_mascot_1794606571644.jpg"
                alt="Hamster Bug"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Hallo, ich bin Hamster Bug! 🐹
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
              Dein kostenloser KI-Programmierassistent. Ich helfe dir beim Coden, Fehlerbeheben, Optimieren und Verstehen von Programmen aller Art.
            </p>
            <div className="text-[11px] text-slate-400">
              Tipp: Nutze die Schnell-Buttons oben oder stelle mir direkt eine Frage!
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 ring-1 ring-amber-500/30 bg-amber-500/10 flex items-center justify-center mt-0.5">
                    <img
                      src="/src/assets/images/hamster_bug_mascot_1794606571644.jpg"
                      alt="Hamster Bug"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span className="text-xs" aria-hidden="true">🐹</span>
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    renderMessageContent(msg.content, msg.id)
                  )}
                </div>
              </div>
            );
          })
        )}

        {isStreaming && (
          <div className="flex gap-2.5 items-center text-xs text-slate-400">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 ring-1 ring-amber-500/30 bg-amber-500/10 flex items-center justify-center">
              <span className="text-xs" aria-hidden="true">🐹</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Hamster Bug analysiert und schreibt Code...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shrink-0"
      >
        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500 shadow-xs">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Frag Hamster Bug nach Code, Bugs oder Erklärungen... (Enter zum Senden)`}
            rows={2}
            className="w-full p-2.5 pr-12 text-xs sm:text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isStreaming}
            className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition-colors cursor-pointer"
            title="Nachricht senden"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400 px-1">
          <span>Kontext: {activeFile.name} ({activeFile.language})</span>
          <span>Shift+Enter für neue Zeile</span>
        </div>
      </form>
    </div>
  );
};
