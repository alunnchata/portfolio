(function () {
  'use strict';

  const GRID = 22;
  const SPEED = 110; // ms per tick

  let canvas, ctx;
  let active = false;
  let snake, dir, nextDir, targets, score, tickTimer, animId;

  // ── Activation ───────────────────────────────────────────────

  function start() {
    if (active) return;
    active = true;

    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    wrapLetters();

    canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      zIndex: '9999', pointerEvents: 'none',
    });
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    const cx = Math.floor(window.innerWidth  / 2 / GRID) * GRID;
    const cy = Math.floor(window.innerHeight / 2 / GRID) * GRID;
    snake   = [{ x: cx, y: cy }, { x: cx - GRID, y: cy }, { x: cx - GRID * 2, y: cy }];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score   = 0;

    // Give browser one frame to lay out the new spans before measuring
    requestAnimationFrame(() => {
      targets   = collectTargets();
      tickTimer = setInterval(tick, SPEED);
      animId    = requestAnimationFrame(draw);
      toast('arrow keys · esc to quit');
    });
  }

  function stop(gameOver = false) {
    if (!active) return;
    active = false;
    clearInterval(tickTimer);
    cancelAnimationFrame(animId);
    document.body.style.overflow = '';
    canvas?.remove();
    restore();
    if (gameOver) toast(`game over — ${score} letters eaten`);
  }

  // ── DOM letter wrapping ──────────────────────────────────────

  function wrapLetters() {
    const els = document.querySelectorAll(
      'h1, h2, h3, .masthead-title, .about p, .job-title, .job-company, .job-year, .skill-group h3, .skill-group li'
    );
    els.forEach(el => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(node => {
        const frag = document.createDocumentFragment();
        for (const ch of node.textContent) {
          if (/\s/.test(ch)) {
            frag.appendChild(document.createTextNode(ch));
          } else {
            const s = document.createElement('span');
            s.className = 'snk';
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
        out.push({ x: gx, y: gy, char: span.textContent, span });
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

    // Food letters
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = `400 ${Math.round(GRID * 0.78)}px 'Playfair Display', serif`;
    ctx.fillStyle    = '#b89060';
    targets.forEach(t => {
      if (t.span) ctx.fillText(t.char, t.x, t.y);
    });

    // Snake segments
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? '#6b4c28' : '#c8a070';
      ctx.beginPath();
      roundRect(seg.x - GRID / 2 + 2, seg.y - GRID / 2 + 2, GRID - 4, GRID - 4, i === 0 ? 5 : 3);
      ctx.fill();
    });

    // Score
    ctx.fillStyle    = '#9a9088';
    ctx.font         = `300 11px 'DM Sans', sans-serif`;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${score} letters eaten`, canvas.width - 20, 18);

    animId = requestAnimationFrame(draw);
  }

  function roundRect(x, y, w, h, r) {
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  }

  // ── Toast ────────────────────────────────────────────────────

  function toast(msg) {
    const d = document.createElement('div');
    d.textContent = msg;
    Object.assign(d.style, {
      position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
      fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: '300',
      letterSpacing: '0.1em', textTransform: 'lowercase', color: '#7a7468',
      zIndex: '10000', pointerEvents: 'none',
      animation: 'snk-fade 2.5s ease forwards',
    });
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2500);
  }

  const style = document.createElement('style');
  style.textContent = '@keyframes snk-fade{0%,60%{opacity:1}100%{opacity:0}}';
  document.head.appendChild(style);

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
    if (d.x === -dir.x || d.y === -dir.y) return; // no 180°
    nextDir = d;
  });
})();
