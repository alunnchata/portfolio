(function () {
  'use strict';

  const GRID  = 22;
  const SPEED = 110;

  // Load pixel font
  const fontLink = document.createElement('link');
  fontLink.rel  = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
  document.head.appendChild(fontLink);

  // Injected styles — letter glow when game is active
  const style = document.createElement('style');
  style.textContent = `
    @keyframes snk-fade { 0%, 60% { opacity: 1 } 100% { opacity: 0 } }
    body.snake-active .snk {
      color: #00cc66;
      text-shadow: 0 0 8px rgba(0, 204, 102, 0.8), 0 0 20px rgba(0, 204, 102, 0.3);
      transition: color 0.4s ease, text-shadow 0.4s ease;
    }
  `;
  document.head.appendChild(style);

  const C = {
    snakeHead:   '#00d4ff',
    snakeBody:   '#0077cc',
    gridLine:    'rgba(0, 212, 255, 0.05)',
    score:       '#00d4ff',
  };

  let canvas, ctx;
  let active = false;
  let snake, dir, nextDir, targets, score, tickTimer, animId;

  // ── Activation ───────────────────────────────────────────────

  function start() {
    if (active) return;
    active = true;

    document.body.classList.add('snake-active');
    wrapLetters();

    canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      zIndex: '9999', pointerEvents: 'none',
    });
    document.body.appendChild(canvas);
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    const cx = Math.floor(window.innerWidth  / 2 / GRID) * GRID;
    const cy = Math.floor(window.innerHeight / 2 / GRID) * GRID;
    snake   = [{ x: cx, y: cy }, { x: cx - GRID, y: cy }, { x: cx - GRID * 2, y: cy }];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score   = 0;

    requestAnimationFrame(() => {
      targets   = collectTargets();
      tickTimer = setInterval(tick, SPEED);
      animId    = requestAnimationFrame(draw);
      toast('arrow keys  ·  esc to quit');
    });
  }

  function stop(gameOver = false) {
    if (!active) return;
    active = false;
    clearInterval(tickTimer);
    cancelAnimationFrame(animId);
    document.body.classList.remove('snake-active');
    canvas?.remove();
    restore();
    if (gameOver) toast(`game over  ·  ${score} pts`);
  }

  // ── DOM letter wrapping ──────────────────────────────────────

  function wrapLetters() {
    const els = document.querySelectorAll(
      'h1, h2, h3, .masthead-title, .about p, .job-title, .job-company, .job-year, .skill-group h3, .skill-group li'
    );
    els.forEach(el => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes  = [];
      let n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(node => {
        const frag = document.createDocumentFragment();
        for (const ch of node.textContent) {
          if (/\s/.test(ch)) {
            frag.appendChild(document.createTextNode(ch));
          } else {
            const s = document.createElement('span');
            s.className  = 'snk';
            s.textContent = ch;
            frag.appendChild(s);
          }
        }
        node.parentNode.replaceChild(frag, node);
      });
    });
  }

  function restore() {
    document.querySelectorAll('.snk').forEach(s =>
      s.parentNode.replaceChild(document.createTextNode(s.textContent), s)
    );
    document.querySelectorAll(
      'h1, h2, h3, .masthead-title, .about p, .job-title, .job-company, .job-year, .skill-group h3, .skill-group li'
    ).forEach(el => el.normalize());
  }

  function collectTargets() {
    const seen = new Set();
    const out  = [];
    document.querySelectorAll('.snk').forEach(span => {
      const r  = span.getBoundingClientRect();
      const gx = Math.round((r.left + r.width  / 2) / GRID) * GRID;
      const gy = Math.round((r.top  + r.height / 2) / GRID) * GRID;
      const k  = `${gx},${gy}`;
      if (!seen.has(k) && gx >= 0 && gy >= 0 && gx < canvas.width && gy < canvas.height) {
        seen.add(k);
        out.push({ x: gx, y: gy, span });
      }
    });
    return out;
  }

  // ── Game loop ────────────────────────────────────────────────

  function tick() {
    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x * GRID, y: snake[0].y + dir.y * GRID };

    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height) {
      stop(true); return;
    }
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      stop(true); return;
    }

    snake.unshift(head);

    const eatIdx = targets.findIndex(t => t.span && t.x === head.x && t.y === head.y);
    if (eatIdx !== -1) {
      targets[eatIdx].span.textContent = '';
      targets[eatIdx].span = null;
      score++;
    } else {
      snake.pop();
    }
  }

  function draw() {
    if (!active) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pixel grid
    ctx.strokeStyle = C.gridLine;
    ctx.lineWidth   = 0.5;
    for (let x = 0; x <= canvas.width;  x += GRID) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= canvas.height; y += GRID) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

    // Snake — sharp squares for pixel feel
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? C.snakeHead : C.snakeBody;
      ctx.fillRect(seg.x - GRID / 2 + 1, seg.y - GRID / 2 + 1, GRID - 2, GRID - 2);
    });

    // Score — pixel font
    ctx.fillStyle    = C.score;
    ctx.font         = "8px 'Press Start 2P', monospace";
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${score} pts`, canvas.width - 16, 16);

    animId = requestAnimationFrame(draw);
  }

  // ── Toast ────────────────────────────────────────────────────

  function toast(msg) {
    const d = document.createElement('div');
    d.textContent = msg;
    Object.assign(d.style, {
      position:   'fixed',
      bottom:     '1.5rem',
      left:       '50%',
      transform:  'translateX(-50%)',
      fontFamily: "'Press Start 2P', monospace",
      fontSize:   '8px',
      color:      '#00cc66',
      zIndex:     '10000',
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      animation:  'snk-fade 3s ease forwards',
    });
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3000);
  }

  // ── Input ────────────────────────────────────────────────────

  const KEY_DIR = {
    ArrowUp:    { x:  0, y: -1 },
    ArrowDown:  { x:  0, y:  1 },
    ArrowLeft:  { x: -1, y:  0 },
    ArrowRight: { x:  1, y:  0 },
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { stop(); return; }
    const d = KEY_DIR[e.key];
    if (!d) return;
    e.preventDefault();
    if (!active) { start(); return; }
    if (d.x === -dir.x || d.y === -dir.y) return;
    nextDir = d;
  });
})();
