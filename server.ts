import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Google GenAI initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const HAMSTER_BUG_SYSTEM_INSTRUCTION = `Du bist "Hamster Bug", ein erstklassiger, hochintelligenter und super freundlicher KI-Coding-Assistent und Bug-Jäger im Browser!
Deine Eigenschaften:
- Du beherrschst alle modernen Programmiersprachen (TypeScript, JavaScript, Python, HTML/CSS, React, Rust, Go, C++, SQL, Bash, uvm.).
- Du liebst es, Fehler ("Bugs") aufzuspüren, sauberen, robusten und typsicheren Code zu schreiben und komplexe Algorithmen einfach und verständlich zu erklären.
- Antworte immer passend in der Sprache des Nutzers (Deutsch oder Englisch). Wenn der Nutzer auf Deutsch fragt, antworte auf Deutsch mit präzisen Fachbegriffen.
- Strukturiere deine Antworten exzellent:
  1. Kurzes, freundliches Verständnis des Ziels / Problems (mit deiner sympathischen Hamster-Bug-Note, z.B. "Cheek-pouches voll mit Lösungen! 🐹").
  2. Der vollständige, fehlerfreie und lauffähige Code in sauberen Markdown-Codeblöcken mit Angabe der Sprache (\`\`\`typescript, \`\`\`html, \`\`\`python etc.).
  3. Erklärung der Schlüsselstellen und bewährte Best Practices (Performance, Fehlerbehandlung, Edge Cases).
- Wenn der Nutzer um Bug-Squashing bittet, nenne:
  • Ursache des Bugs
  • Die saubere Korrektur
  • Pro-Tipp zur Vermeidung
- Sei präzise, hilfsbereit, ermutigend und liefere stets sofort nutzbaren, kopierbaren Code.`;

// Endpoint: General Chat & Coding Assistance (Streaming via SSE)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, currentCode, currentLanguage, actionPrompt } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY ist auf dem Server nicht konfiguriert. Bitte prüfe die Umgebungsvariablen.',
      });
    }

    // Set up Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullPrompt = '';
    if (currentCode) {
      fullPrompt += `[Aktueller Code im Editor (${currentLanguage || 'unbekannt'})]:\n\`\`\`${currentLanguage || ''}\n${currentCode}\n\`\`\`\n\n`;
    }

    // Build conversation context
    if (Array.isArray(messages) && messages.length > 0) {
      const historyContext = messages
        .slice(-8)
        .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Nutzer' : 'Hamster Bug'}: ${m.content}`)
        .join('\n\n');
      fullPrompt += `[Gesprächsverlauf]:\n${historyContext}\n\n`;
    }

    if (actionPrompt) {
      fullPrompt += `[Spezifische Nutzeranfrage / Aktion]: ${actionPrompt}`;
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-4-hydrogen',
      contents: fullPrompt || 'Hallo Hamster Bug! Wie kannst du mir heute beim Programmieren helfen?',
      config: {
        systemInstruction: HAMSTER_BUG_SYSTEM_INSTRUCTION,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Hamster Bug API Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Fehler bei der Kommunikation mit Hamster Bug.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Streaming-Fehler aufgetreten.' })}\n\n`);
      res.end();
    }
  }
});

// Endpoint: Dedicated Bug Squashing & Analysis (Returns structured diagnosis + fixed code)
app.post('/api/squash-bug', async (req: Request, res: Response) => {
  try {
    const { code, language, errorDescription } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Kein Code zum Untersuchen übergeben.' });
    }

    const prompt = `Untersuche folgenden Code sehr gründlich auf logische Fehler, Syntaxfehler, Laufzeitfehler, Edge Cases und Anti-Patterns:
Sprache: ${language || 'auto'}
Fehlerbeschreibung / Symptom des Nutzers: ${errorDescription || 'Nicht näher spezifiziert, bitte vollumfänglich prüfen.'}

Code:
\`\`\`${language || ''}
${code}
\`\`\`

Antworte strukturiert mit:
1. Eine kurze, verständliche Diagnose des Bugs (Was genau läuft schief und warum?)
2. Der vollständig korrigierte, saubere Code in einem Codeblock
3. Die 2-3 wichtigsten Verbesserungen, die vorgenommen wurden.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: HAMSTER_BUG_SYSTEM_INSTRUCTION,
      },
    });

    res.json({
      result: response.text || 'Keine Antwort erhalten.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Squash Bug Error:', error);
    res.status(500).json({ error: error.message || 'Fehler beim Squashen des Bugs.' });
  }
});

// Endpoint: Code Explanation
app.post('/api/explain-code', async (req: Request, res: Response) => {
  try {
    const { code, language, depth } = req.body;
    const prompt = `Erkläre den folgenden Code ${depth === 'beginner' ? 'für Programmieranfänger leicht verständlich' : 'technisch präzise mit Architektur, Komplexität und Funktionsweise'}:
Sprache: ${language || 'auto'}

\`\`\`${language || ''}
${code}
\`\`\`

Gehe schrittweise durch die wichtigsten Logikblöcke und hebe Besonderheiten hervor.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction: HAMSTER_BUG_SYSTEM_INSTRUCTION,
      },
    });

    res.json({
      result: response.text || 'Keine Erklärung verfügbar.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Explain Code Error:', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Code-Erklärung.' });
  }
});

// Endpoint: Health check & info
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'Hamster Bug Coding AI',
    model: 'gemini-4-hydrogen',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Dynamic import of Vite in development mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐹 Hamster Bug Dev Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
