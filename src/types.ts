export type SupportedLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'html' 
  | 'css' 
  | 'python' 
  | 'json' 
  | 'sql' 
  | 'markdown';

export interface CodeFile {
  id: string;
  name: string;
  language: SupportedLanguage;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  codeSnippet?: {
    code: string;
    language: string;
    title?: string;
  };
}

export interface ConsoleEntry {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

export interface StarterTemplate {
  id: string;
  title: string;
  description: string;
  category: 'web' | 'game' | 'algorithm' | 'tool';
  language: SupportedLanguage;
  files: {
    name: string;
    language: SupportedLanguage;
    content: string;
  }[];
}

export type ActiveTab = 'editor' | 'squash' | 'sandbox' | 'templates';
