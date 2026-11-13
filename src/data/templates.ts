import { StarterTemplate } from '../types';

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'hamster-game',
    title: 'Hamster Bug Arcade Game',
    description: 'Ein spielbares 2D Canvas-Retro-Spiel: Steuere Hamster Bug mit den Pfeiltasten/Leertaste!',
    category: 'game',
    language: 'html',
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Hamster Bug Arcade</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090d16;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      overflow: hidden;
    }
    .game-card {
      background: #131b2e;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .header {
      display: flex;
      justify-content: space-between;
      width: 100%;
      margin-bottom: 12px;
      font-size: 14px;
      color: #94a3b8;
    }
    .score-badge {
      color: #38bdf8;
      font-weight: 700;
      font-size: 16px;
      font-family: monospace;
    }
    canvas {
      background: #0b1120;
      border-radius: 12px;
      border: 1px solid #334155;
      display: block;
    }
    .controls {
      margin-top: 14px;
      font-size: 13px;
      color: #64748b;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    button.btn-restart {
      background: #f59e0b;
      color: #0f172a;
      font-weight: bold;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button.btn-restart:hover {
      background: #d97706;
    }
  </style>
</head>
<body>
  <div class="game-card">
    <div class="header">
      <span>🐹 <strong>Hamster Bug Runner</strong></span>
      <span>Bugs gefangen: <span id="score" class="score-badge">0</span></span>
    </div>
    <canvas id="gameCanvas" width="480" height="280"></canvas>
    <div class="controls">
      <span>Steuerung: [Leertaste] oder [Klick] zum Springen</span>
      <button class="btn-restart" onclick="resetGame()">Neu starten</button>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');

    let score = 0;
    let gameOver = false;
    let hamster = { x: 50, y: 190, vy: 0, gravity: 0.6, jump: -10, grounded: true, size: 28 };
    let bugs = [];
    let frame = 0;

    function resetGame() {
      score = 0;
      scoreEl.textContent = '0';
      gameOver = false;
      hamster.y = 190;
      hamster.vy = 0;
      hamster.grounded = true;
      bugs = [];
      frame = 0;
    }

    function jump() {
      if (hamster.grounded && !gameOver) {
        hamster.vy = hamster.jump;
        hamster.grounded = false;
      } else if (gameOver) {
        resetGame();
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    });
    canvas.addEventListener('mousedown', jump);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

    function loop() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Zeichne Boden
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 220);
      ctx.lineTo(canvas.width, 220);
      ctx.stroke();

      // Physik Hamster
      hamster.vy += hamster.gravity;
      hamster.y += hamster.vy;
      if (hamster.y >= 190) {
        hamster.y = 190;
        hamster.vy = 0;
        hamster.grounded = true;
      }

      // Zeichne Hamster Bug
      ctx.save();
      ctx.translate(hamster.x, hamster.y);
      // Körper
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      // Backe
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(4, 2, 8, 0, Math.PI * 2);
      ctx.fill();
      // Ohr
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-8, -14, 6, 0, Math.PI * 2);
      ctx.fill();
      // Auge & Brille
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(6, -4, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(6, -4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Spawne Bugs
      if (frame % 85 === 0 && !gameOver) {
        bugs.push({ x: canvas.width, y: 195, size: 14, speed: 3.5 + Math.min(score * 0.1, 4) });
      }

      // Zeichne & bewege Bugs
      for (let i = bugs.length - 1; i >= 0; i--) {
        const b = bugs[i];
        if (!gameOver) b.x -= b.speed;

        // Zeichne Käfer (Bug)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
        // Fühler
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(b.x - 4, b.y - 10);
        ctx.lineTo(b.x - 8, b.y - 18);
        ctx.moveTo(b.x + 4, b.y - 10);
        ctx.lineTo(b.x + 8, b.y - 18);
        ctx.stroke();

        // Kollisionserkennung
        const dist = Math.hypot(hamster.x - b.x, hamster.y - b.y);
        if (dist < 22) {
          gameOver = true;
        }

        // Punktzahl erhöhen wenn passiert
        if (b.x < hamster.x - 20 && !b.counted) {
          b.counted = true;
          score++;
          scoreEl.textContent = score;
        }

        // Entferne aus Bildschirm geflogene Bugs
        if (b.x < -30) bugs.splice(i, 1);
      }

      if (gameOver) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BUG GEFUNDEN! GAME OVER', canvas.width / 2, 120);
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '14px sans-serif';
        ctx.fillText('Leertaste oder Klick zum Neustarten', canvas.width / 2, 150);
      }

      requestAnimationFrame(loop);
    }

    loop();
  </script>
</body>
</html>`,
      },
    ],
  },
  {
    id: 'pomodoro-timer',
    title: 'Developer Pomodoro Studio',
    description: 'Fokustimer mit Audio-Gong, Fortschrittsanzeige und Task-Liste für produktives Coden.',
    category: 'tool',
    language: 'html',
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Hamster Focus Pomodoro</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f172a;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .timer-container {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 20px;
      padding: 32px;
      width: 100%;
      max-width: 420px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .badge {
      display: inline-block;
      color: #38bdf8;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .clock {
      font-size: 64px;
      font-weight: 800;
      font-family: monospace;
      color: #f8fafc;
      margin: 16px 0;
      font-variant-numeric: tabular-nums;
    }
    .buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    button {
      padding: 10px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.15s;
    }
    .btn-primary { background: #38bdf8; color: #0f172a; }
    .btn-primary:hover { background: #0284c7; color: white; }
    .btn-secondary { background: #334155; color: #f1f5f9; }
    .btn-secondary:hover { background: #475569; }
    .tasks-section {
      text-align: left;
      border-top: 1px solid #334155;
      padding-top: 20px;
    }
    .task-input-row {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    input[type="text"] {
      flex: 1;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 8px 12px;
      color: white;
      font-size: 14px;
    }
    ul { list-style: none; }
    li {
      padding: 8px 10px;
      background: #0f172a;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="timer-container">
    <div class="badge">🐹 HAMSTER FOCUS SESSION</div>
    <div id="clockDisplay" class="clock">25:00</div>
    <div class="buttons">
      <button id="toggleBtn" class="btn-primary" onclick="toggleTimer()">Starten</button>
      <button class="btn-secondary" onclick="resetTimer(25)">25m</button>
      <button class="btn-secondary" onclick="resetTimer(5)">5m Pause</button>
    </div>

    <div class="tasks-section">
      <div class="task-input-row">
        <input type="text" id="taskInput" placeholder="Aktuelle Coding-Aufgabe eingeben..." onkeydown="if(event.key==='Enter') addTask()">
        <button class="btn-primary" onclick="addTask()">+</button>
      </div>
      <ul id="taskList">
        <li><input type="checkbox"> Bug in Funktion squashen</li>
        <li><input type="checkbox"> Unit-Tests schreiben</li>
      </ul>
    </div>
  </div>

  <script>
    let timeLeft = 25 * 60;
    let timerId = null;
    let isRunning = false;
    const clockEl = document.getElementById('clockDisplay');
    const toggleBtn = document.getElementById('toggleBtn');

    function updateDisplay() {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      clockEl.textContent = \`\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
    }

    function toggleTimer() {
      if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        toggleBtn.textContent = 'Fortsetzen';
        toggleBtn.classList.remove('btn-secondary');
        toggleBtn.classList.add('btn-primary');
      } else {
        isRunning = true;
        toggleBtn.textContent = 'Pausieren';
        timerId = setInterval(() => {
          if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
          } else {
            clearInterval(timerId);
            isRunning = false;
            playChime();
            alert('🎉 Fokuszeit beendet! Zeit für eine Pause.');
            resetTimer(5);
          }
        }, 1000);
      }
    }

    function resetTimer(minutes) {
      clearInterval(timerId);
      isRunning = false;
      timeLeft = minutes * 60;
      toggleBtn.textContent = 'Starten';
      updateDisplay();
    }

    function playChime() {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    }

    function addTask() {
      const input = document.getElementById('taskInput');
      const text = input.value.trim();
      if (!text) return;
      const li = document.createElement('li');
      li.innerHTML = \`<input type="checkbox"> \${text}\`;
      document.getElementById('taskList').appendChild(li);
      input.value = '';
    }

    updateDisplay();
  </script>
</body>
</html>`,
      },
    ],
  },
  {
    id: 'buggy-code-sample',
    title: 'Code mit Bug zum Testen',
    description: 'Ein JavaScript-Algorithmus mit subtilem Off-by-one & Null-Pointer-Bug zum Testen von Hamster Bug!',
    category: 'algorithm',
    language: 'javascript',
    files: [
      {
        name: 'userSearch.js',
        language: 'javascript',
        content: `/**
 * ACHTUNG: Dieser Code enthält absichtlich mehrere Bugs!
 * Klicke auf "Bug squashen 🐹", um Hamster Bug die Fehler finden zu lassen.
 */

function calculateAverageUserAge(users) {
  // BUG 1: Keine Überprüfung auf null, undefined oder leeres Array!
  let totalAge = 0;

  // BUG 2: Off-by-one Fehler in Schleife (<= statt <)!
  for (let i = 0; i <= users.length; i++) {
    // BUG 3: Ungeprüfter Zugriff auf users[i].age führt zu TypeError bei letztem Durchlauf
    totalAge += users[i].age;
  }

  // BUG 4: Mögliche Division durch Null
  return totalAge / users.length;
}

// Testdaten
const testUsers = [
  { id: 1, name: "Anna", age: 24 },
  { id: 2, name: "Ben", age: 31 },
  { id: 3, name: "Clara", age: 29 }
];

console.log("Starte Berechnung...");
try {
  const avg = calculateAverageUserAge(testUsers);
  console.log("Durchschnittsalter:", avg);
} catch (err) {
  console.error("Fehler aufgetreten:", err.message);
}
`,
      },
    ],
  },
  {
    id: 'python-data-sorter',
    title: 'Python QuickSort & Benchmark',
    description: 'Eleganter QuickSort-Algorithmus mit Rekursionstiefe und Zeitmessung.',
    category: 'algorithm',
    language: 'python',
    files: [
      {
        name: 'quicksort.py',
        language: 'python',
        content: `"""
Hamster Bug Python Algorithmen-Labor
QuickSort Implementierung mit Pivotauswahl
"""
import random
import time

def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Testlauf & Benchmark
sample_data = [random.randint(1, 1000) for _ in range(50)]
print(f"Unsortiert (erste 10 Elemente): {sample_data[:10]}")

start_time = time.perf_counter()
sorted_data = quicksort(sample_data)
duration = (time.perf_counter() - start_time) * 1000

print(f"Sortiert (erste 10 Elemente):   {sorted_data[:10]}")
print(f"Erfolgreich sortiert: {sorted_data == sorted(sample_data)}")
print(f"Benötigte Zeit: {duration:.4f} ms")
`,
      },
    ],
  },
  {
    id: 'modern-card-ui',
    title: 'Modern Glow Card UI',
    description: 'HTML & CSS Glassmorphismus-Komponente mit interaktivem Hover-Glow-Effekt.',
    category: 'web',
    language: 'html',
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Glow Card UI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 30%, #1e1b4b, #09090b);
      color: #fafafa;
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card-wrap {
      position: relative;
      background: rgba(24, 24, 27, 0.7);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px;
      max-width: 380px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      transition: transform 0.3s ease, border-color 0.3s ease;
      cursor: pointer;
    }
    .card-wrap:hover {
      transform: translateY(-4px);
      border-color: rgba(245, 158, 11, 0.5);
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #f59e0b;
      margin-bottom: 12px;
    }
    h2 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #ffffff;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #a1a1aa;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #f59e0b;
      color: #18181b;
      font-weight: 600;
      font-size: 13px;
      padding: 10px 18px;
      border-radius: 10px;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #fbbf24;
    }
  </style>
</head>
<body>
  <div class="card-wrap">
    <div class="badge">🐹 Hamster Bug Pro</div>
    <h2>High-Performance Code</h2>
    <p>Erstelle blitzschnelle Webanwendungen mit modularer Architektur, reaktivem State-Management und zero Layout-Shifts.</p>
    <a href="#" class="btn" onclick="alert('🐹 Hamster Bug ist bereit!'); return false;">Jetzt ausprobieren →</a>
  </div>
</body>
</html>`,
      },
    ],
  },
];
