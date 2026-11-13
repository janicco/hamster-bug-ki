import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { HamsterChat } from './components/HamsterChat';
import { BugSquashLab } from './components/BugSquashLab';
import { SandboxPreview } from './components/SandboxPreview';
import { SnippetsLibrary } from './components/SnippetsLibrary';
import { HamsterMascotBadge } from './components/HamsterMascotBadge';
import { ActiveTab, CodeFile, ChatMessage, ConsoleEntry, StarterTemplate, SupportedLanguage } from './types';
import { STARTER_TEMPLATES } from './data/templates';
import { MessageSquare, Columns2 } from 'lucide-react';

const INITIAL_FILES: CodeFile[] = STARTER_TEMPLATES[0].files.map((f, i) => ({
  id: `file-${i}`,
  name: f.name,
  language: f.language,
  content: f.content,
}));

export default function App() {
  // Theme state: default dark as requested for coding comfort
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true; // Default dark mode
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [files, setFiles] = useState<CodeFile[]>(() => {
    const saved = localStorage.getItem('hamster_bug_files');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return INITIAL_FILES;
  });
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || 'file-0');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('hamster_bug_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(true);

  // Console state
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [squashCount, setSquashCount] = useState<number>(() => {
    return Number(localStorage.getItem('hamster_squash_count') || '0');
  });

  // Apply dark mode class to documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Persist files in localStorage
  useEffect(() => {
    localStorage.setItem('hamster_bug_files', JSON.stringify(files));
  }, [files]);

  // Persist chat in localStorage
  useEffect(() => {
    localStorage.setItem('hamster_bug_chat', JSON.stringify(messages));
  }, [messages]);

  // Listen to sandbox iframe console messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CONSOLE_LOG') {
        const { level, message } = event.data;
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${Math.random()}`,
            type: level || 'log',
            message: message || '',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleUpdateFileContent = (id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, content } : f))
    );
  };

  const handleAddFile = (name: string, language: SupportedLanguage) => {
    const newId = `file-${Date.now()}`;
    const newFile: CodeFile = {
      id: newId,
      name,
      language,
      content: language === 'html' 
        ? '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>Neues Dokument</title>\n</head>\n<body>\n  <h1>Hallo Welt!</h1>\n</body>\n</html>'
        : `// ${name}\n\nconsole.log('Hamster Bug bereit!');\n`,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newId);
  };

  const handleRemoveFile = (id: string) => {
    if (files.length <= 1) return;
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  const handleChangeLanguage = (id: string, language: SupportedLanguage) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, language } : f))
    );
  };

  // Streaming AI Chat handler
  const handleSendMessage = async (text: string, actionPrompt?: string) => {
    if (isStreaming) return;

    const userMessageId = `msg-${Date.now()}`;
    const assistantMessageId = `msg-${Date.now() + 1}`;

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      },
    ];

    setMessages(newMessages);
    setIsStreaming(true);

    // Placeholder assistant message for streaming
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentCode: activeFile?.content || '',
          currentLanguage: activeFile?.language || 'javascript',
          actionPrompt: actionPrompt || text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Netzwerkfehler');
      }

      if (!response.body) {
        throw new Error('ReadableStream nicht verfügbar.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataPayload = line.substring(6).trim();
            if (dataPayload === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataPayload);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: accumulatedText } : m
                  )
                );
              } else if (parsed.error) {
                accumulatedText += `\n⚠️ Fehler: ${parsed.error}`;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: accumulatedText } : m
                  )
                );
              }
            } catch {
              // Ignore incomplete SSE json chunks
            }
          }
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? { ...m, content: `Entschuldigung, ein Fehler ist aufgetreten: ${error.message}` }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('hamster_bug_chat');
  };

  const handleApplyCodeToEditor = (code: string) => {
    handleUpdateFileContent(activeFile.id, code);
    setActiveTab('editor');
  };

  const handleRunInSandbox = (code: string, language: string) => {
    handleUpdateFileContent(activeFile.id, code);
    setActiveTab('sandbox');
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        type: 'info',
        message: `Code (${language}) in Sandbox geladen und gestartet.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleQuickSquash = () => {
    setActiveTab('squash');
  };

  const handleApplyFix = (fixedCode: string) => {
    handleUpdateFileContent(activeFile.id, fixedCode);
    const newCount = squashCount + 1;
    setSquashCount(newCount);
    localStorage.setItem('hamster_squash_count', String(newCount));
    setActiveTab('editor');
  };

  const handleLoadTemplate = (template: StarterTemplate, runImmediately: boolean = false) => {
    const loadedFiles: CodeFile[] = template.files.map((f, i) => ({
      id: `file-${Date.now()}-${i}`,
      name: f.name,
      language: f.language,
      content: f.content,
    }));

    setFiles(loadedFiles);
    setActiveFileId(loadedFiles[0].id);

    if (runImmediately) {
      setActiveTab('sandbox');
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          type: 'info',
          message: `Vorlage "${template.title}" geladen.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } else {
      setActiveTab('editor');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onRunSandbox={() => setActiveTab('sandbox')}
        onQuickSquash={handleQuickSquash}
        isRunning={false}
      />

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'editor' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Code Editor */}
            <div className={`h-full flex-1 transition-all duration-200 overflow-hidden`}>
              <Editor
                files={files}
                activeFileId={activeFileId}
                onSelectFile={setActiveFileId}
                onUpdateFileContent={handleUpdateFileContent}
                onAddFile={handleAddFile}
                onRemoveFile={handleRemoveFile}
                onChangeLanguage={handleChangeLanguage}
              />
            </div>

            {/* Toggle Chat button for compact screens */}
            <button
              onClick={() => setShowChatPanel(!showChatPanel)}
              className="absolute top-16 right-4 z-20 md:hidden p-2 rounded-xl bg-amber-500 text-slate-950 font-bold shadow-lg"
              title="KI-Assistent umschalten"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Right: Hamster Bug AI Assistant Panel */}
            {showChatPanel && (
              <div className="w-full md:w-[420px] lg:w-[460px] h-full border-l border-slate-200 dark:border-slate-800 shrink-0 flex flex-col z-10">
                <HamsterChat
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onClearChat={handleClearChat}
                  isStreaming={isStreaming}
                  activeFile={activeFile}
                  onApplyCodeToEditor={handleApplyCodeToEditor}
                  onRunInSandbox={handleRunInSandbox}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'squash' && (
          <div className="flex-1 h-full overflow-hidden">
            <BugSquashLab
              currentCode={activeFile?.content || ''}
              currentLanguage={activeFile?.language || 'javascript'}
              onApplyFixToEditor={handleApplyFix}
            />
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="flex-1 h-full overflow-hidden">
            <SandboxPreview
              files={files}
              consoleLogs={consoleLogs}
              onClearLogs={() => setConsoleLogs([])}
              onAddLog={(entry) =>
                setConsoleLogs((prev) => [
                  ...prev,
                  { ...entry, id: `log-${Date.now()}-${Math.random()}` },
                ])
              }
            />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="flex-1 h-full overflow-hidden">
            <SnippetsLibrary onLoadTemplate={handleLoadTemplate} />
          </div>
        )}
      </main>

      {/* Floating Mascot Badge with Pro Tips and Stats */}
      <HamsterMascotBadge
        onAskAdvice={() => {
          setActiveTab('editor');
          setShowChatPanel(true);
        }}
        squashCount={squashCount}
      />
    </div>
  );
}
