/* Condivisione sui social: genera una cartolina PNG col tema in corso e apre un foglio con i modi per condividerla. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);

  const css = document.createElement('style');
  css.textContent = `
  #shr { position:fixed; inset:0; z-index:500; display:none; align-items:flex-end; justify-content:center; background:rgba(0,0,0,.6); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); font-family:var(--font); color:var(--ink); }
  #shr.on { display:flex; animation:shfade .25s both; }
  @keyframes shfade { from { opacity:0; } }
  #shr .sheet { width:100%; max-width:520px; max-height:94vh; overflow:auto; padding:16px 16px calc(20px + env(safe-area-inset-bottom)); border-radius:24px 24px 0 0; background:var(--bg2); border:1px solid var(--line); animation:shup .4s cubic-bezier(.2,.9,.3,1.1) both; }
  @media (min-width:700px) { #shr { align-items:center; } #shr .sheet { border-radius:24px; } }
  @keyframes shup { from { transform:translateY(60px); opacity:0; } }
  #shr h3 { margin:0 0 10px; font-size:1.05rem; display:flex; justify-content:space-between; align-items:center; }
  #shr .x { width:36px; height:36px; padding:0; border-radius:50%; border:1px solid var(--line); background:var(--glass); color:var(--ink); font-size:1rem; cursor:pointer; }
  #shr img { width:100%; max-height:46vh; object-fit:contain; border-radius:16px; border:1px solid var(--line); display:block; margin:0 auto 14px; background:#000; }
  #shr .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  #shr .grid a, #shr .grid button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:12px 6px; border-radius:16px; border:1px solid var(--line); background:var(--glass); color:var(--ink); text-decoration:none; font:700 .8rem/1.1 var(--font); cursor:pointer; box-shadow:none; width:auto; }
  #shr .grid a::after, #shr .grid button::after { display:none; }
  #shr .grid .e { font-size:1.7rem; }
  #shr .main { grid-column:1 / 4; flex-direction:row !important; font-size:1rem !important; background:linear-gradient(135deg,var(--gold),var(--red)) !important; color:#fff !important; border:0 !important; }
  #shr .hint { text-align:center; color:var(--mut); font-size:.78rem; margin:10px 0 0; }
  `;
  document.head.appendChild(css);

  const tv = () => {
    const cs = getComputedStyle(document.documentElement), g = (n, d) => cs.getPropertyValue(n).trim() || d;
    return { bg: g('--bg', '#14090a'), bg2: g('--bg2', '#1d0f0d'), gold: g('--gold', '#ffb703'), red: g('--red', '#ff4d2e'), ink: g('--ink', '#fff4e6'), mut: g('--mut', '#b9a392'),
      a1: g('--a1', '#ff4d2e'), a2: g('--a2', '#ffb703'), font: g('--font', 'system-ui,sans-serif'), emoji: (window.THEME && THEME.emoji) || '🍕' };
  };

  function wrap(ctx, text, maxW, maxLines) {
    const words = String(text).split(' '), lines = []; let cur = '';
    for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
    if (cur) lines.push(cur);
    if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '…'); }
    return lines;
  }

  /* cartolina 1080x1350 con i colori del tema attivo */
  function drawCard({title, subtitle, big, rows = [], foot}) {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1350;
    const x = c.getContext('2d'), T = tv(), F = T.font;
    const bg = x.createLinearGradient(0, 0, 0, 1350); bg.addColorStop(0, T.bg2); bg.addColorStop(1, T.bg); x.fillStyle = bg; x.fillRect(0, 0, 1080, 1350);
    const glow = (cx, cy, r, col) => { x.save(); x.globalAlpha = .55; x.shadowColor = col; x.shadowBlur = 220; x.shadowOffsetX = 6000; x.fillStyle = col; x.beginPath(); x.arc(cx - 6000, cy, r, 0, 7); x.fill(); x.restore(); };
    glow(980, 120, 150, T.a1); glow(80, 1230, 170, T.a2); glow(540, 700, 120, T.a1);
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.font = '150px serif'; x.fillText(T.emoji, 540, 215);
    const grad = (y0, y1) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, T.gold); g.addColorStop(1, T.red); return g; };
    x.fillStyle = grad(250, 340); x.font = `900 84px ${F}`;
    let y = 345; for (const l of wrap(x, title, 940, 2)) { x.fillText(l, 540, y); y += 92; }
    x.fillStyle = T.mut; x.font = `600 40px ${F}`; x.fillText(subtitle || '', 540, y + 8); y += 70;
    if (big) { x.fillStyle = grad(y, y + 260); x.font = `900 ${big.length > 4 ? 190 : 270}px ${F}`; x.fillText(big, 540, y + 250); y += 330; }
    const rh = rows.length > 3 ? 116 : 150;
    for (const r of rows) {
      x.fillStyle = 'rgba(255,255,255,.09)'; x.strokeStyle = 'rgba(255,255,255,.2)'; x.lineWidth = 2;
      x.beginPath(); x.roundRect ? x.roundRect(70, y, 940, rh - 14, 30) : x.rect(70, y, 940, rh - 14); x.fill(); x.stroke();
      x.textAlign = 'left'; x.font = '64px serif'; x.fillStyle = T.ink; x.fillText(r.icon || '•', 98, y + rh / 2 + 18);
      x.font = `800 ${rh > 130 ? 44 : 38}px ${F}`; x.fillStyle = T.ink;
      const nl = wrap(x, r.label, 600, 2); nl.forEach((l, i) => x.fillText(l, 190, y + (rh - 14) / 2 + (nl.length === 1 ? 14 : -4 + i * 46)));
      x.textAlign = 'right'; x.font = `900 ${rh > 130 ? 64 : 52}px ${F}`; x.fillStyle = T.gold; x.fillText(r.value || '', 985, y + rh / 2 + 20);
      y += rh;
    }
    x.textAlign = 'center'; x.fillStyle = T.mut; x.font = `600 32px ${F}`;
    x.fillText(foot || ('Sfida delle pizze surgelate · ' + new Date().toLocaleDateString('it-IT')), 540, 1300);
    return c;
  }

  /* foglio di condivisione */
  let sheet;
  function build() {
    sheet = document.createElement('div'); sheet.id = 'shr';
    sheet.innerHTML = '<div class="sheet"><h3><span>📣 Condividi</span><button class="x" aria-label="Chiudi">✕</button></h3><img alt="Anteprima"><div class="grid"></div><p class="hint"></p></div>';
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet || e.target.closest('.x')) sheet.classList.remove('on'); });
  }
  const toBlob = c => new Promise(r => c.toBlob(r, 'image/png'));
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch {} ta.remove(); return Promise.resolve();
  }

  window.shareSheet = async function ({text, card}) {
    if (!sheet) build();
    const c = drawCard(card), url = c.toDataURL('image/png'), enc = encodeURIComponent(text);
    sheet.querySelector('img').src = url;
    const grid = sheet.querySelector('.grid'); grid.innerHTML = '';
    const add = (icon, label, fn, href) => { const el = document.createElement(href ? 'a' : 'button'); el.innerHTML = `<span class="e">${icon}</span>${label}`; if (href) { el.href = href; el.target = '_blank'; el.rel = 'noopener'; } else el.onclick = fn; grid.appendChild(el); return el; };
    if (navigator.share) {
      const m = add('📲', 'Condividi…', async () => {
        try { const file = new File([await toBlob(c)], 'sfida-pizze.png', {type: 'image/png'}), data = {text, files: [file]};
          (navigator.canShare && navigator.canShare(data)) ? await navigator.share(data) : await navigator.share({text}); } catch {}
      }); m.classList.add('main');
    }
    add('💬', 'WhatsApp', null, 'https://wa.me/?text=' + enc);
    add('✈️', 'Telegram', null, 'https://t.me/share/url?url=%20&text=' + enc);
    add('🐦', 'X / Twitter', null, 'https://twitter.com/intent/tweet?text=' + enc);
    add('✉️', 'Messaggio', null, 'sms:?&body=' + enc);
    const dl = add('💾', 'Scarica immagine', null, url); dl.removeAttribute('target'); dl.download = 'sfida-pizze.png';
    add('📋', 'Copia testo', async function () { await copyText(text); this.innerHTML = '<span class="e">✅</span>Copiato!'; });
    sheet.querySelector('.hint').textContent = navigator.share ? '' : 'Instagram, TikTok e storie: scarica l’immagine e pubblicala dall’app.';
    sheet.classList.add('on');
  };
})();
