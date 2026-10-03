/* Cerimonia di premiazione: avviata dalla dashboard, parte in contemporanea su dashboard e telefoni. */
(() => {
  'use strict';
  const isDash = location.pathname === '/dashboard';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const eur = v => '€ ' + v.toFixed(2).replace('.', ',');
  const $ = id => document.getElementById(id);
  let off = 0, curSeq = 0, dismissed = 0, running = false, data = null, t0 = 0, raf = 0, el = null, btn = null, opened = false;

  const css = document.createElement('style');
  css.textContent = `
  #cer { position:fixed; inset:0; z-index:300; overflow:auto; color:var(--ink); font-family:var(--font); padding:22px 16px 60px;
    background:radial-gradient(120% 90% at 50% 0%,var(--bg2),var(--bg) 70%); animation:cin .6s both; }
  @keyframes cin { from { opacity:0; transform:scale(1.04); } }
  #cfx { position:fixed; inset:0; width:100%; height:100%; pointer-events:none; z-index:1; }
  #cbtn { position:fixed; top:calc(10px + env(safe-area-inset-top)); left:50%; transform:translateX(-50%); z-index:250; padding:10px 18px; border-radius:99px; border:1px solid rgba(var(--gold-rgb),.6); background:linear-gradient(90deg,var(--gold),var(--red)); color:#111; font:800 .95rem var(--font); cursor:pointer; box-shadow:0 8px 30px rgba(var(--red-rgb),.5); animation:cbtnp 1.6s ease-in-out infinite; }
  @keyframes cbtnp { 50% { transform:translateX(-50%) scale(1.06); } }
  #cer .cx { position:fixed; top:calc(12px + env(safe-area-inset-top)); right:14px; z-index:5; width:42px; height:42px; padding:0; border-radius:50%; border:1px solid var(--line); background:var(--glass); color:var(--ink); font-size:1.1rem; cursor:pointer; }
  #cer .cin { position:relative; z-index:2; max-width:980px; margin:0 auto; text-align:center; }
  #cer .ctitle { font-size:clamp(1.6rem,5vw,3rem); font-weight:900; letter-spacing:.06em; text-transform:uppercase; margin:8px 0 4px;
    background:linear-gradient(90deg,var(--gold),var(--red),var(--gold)) 0 0/200% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:cslide 4s linear infinite; }
  @keyframes cslide { to { background-position:-200% 0; } }
  #cer .ccap { min-height:2.2em; font-size:clamp(1.1rem,3.4vw,1.8rem); font-weight:700; opacity:.92; margin-bottom:6px; }
  #cer .ccount { position:fixed; left:0; right:0; top:34%; z-index:3; font-size:min(42vw,16rem); font-weight:900; line-height:1; pointer-events:none; text-shadow:0 10px 60px rgba(var(--red-rgb),.7);
    background:linear-gradient(180deg,var(--gold),var(--red)); -webkit-background-clip:text; background-clip:text; color:transparent; }
  #cer .ccount.t { animation:ctick .9s both; }
  @keyframes ctick { from { transform:scale(2.2); opacity:0; } 25% { opacity:1; } to { transform:scale(.9); opacity:.2; } }
  #cer .podium { --h1:clamp(120px,24vh,260px); display:flex; align-items:flex-end; justify-content:center; gap:clamp(6px,2vw,22px); margin:14px 0 8px; min-height:calc(var(--h1) + 150px); }
  #cer .pod { flex:1; max-width:300px; display:flex; flex-direction:column; align-items:center; }
  #cer .pinfo { opacity:0; transform:translateY(40px) scale(.5); padding:0 4px; }
  #cer .pod.show .pinfo { animation:cpop .9s cubic-bezier(.2,1.5,.3,1) both; }
  @keyframes cpop { to { opacity:1; transform:none; } }
  #cer .pm { font-size:clamp(2.2rem,8vw,4.6rem); line-height:1; }
  #cer .p1 .pm { font-size:clamp(3rem,11vw,6.4rem); animation:cfloat 2.4s ease-in-out infinite; }
  @keyframes cfloat { 50% { transform:translateY(-10px) rotate(-5deg); } }
  #cer .pn { font-weight:900; font-size:clamp(.95rem,3vw,1.5rem); line-height:1.15; margin:4px 0; }
  #cer .ps { font-size:clamp(1.6rem,6vw,3.2rem); font-weight:900; font-variant-numeric:tabular-nums; color:var(--gold); }
  #cer .pp { font-size:.85rem; color:var(--mut); margin-bottom:6px; }
  #cer .pbox { width:100%; border-radius:14px 14px 0 0; transform:scaleY(0); transform-origin:bottom; transition:transform .9s cubic-bezier(.2,1.3,.3,1); display:grid; place-items:center; font-size:clamp(2rem,8vw,4rem); font-weight:900; color:rgba(0,0,0,.45); }
  #cer .pod.show .pbox { transform:scaleY(1); }
  #cer .p1 .pbox { height:var(--h1); background:linear-gradient(180deg,#ffe27a,#d99a00); box-shadow:0 0 60px rgba(255,200,40,.55); }
  #cer .p2 .pbox { height:calc(var(--h1) * .74); background:linear-gradient(180deg,#eef2f7,#9aa5b5); }
  #cer .p3 .pbox { height:calc(var(--h1) * .55); background:linear-gradient(180deg,#e8a56a,#a35a1c); }
  #cer .pod:not(.show) .pbox { height:0 !important; }
  #cer .cbets { opacity:0; margin:12px auto; padding:12px 18px; max-width:620px; border-radius:16px; border:1px solid var(--line); background:var(--glass); font-weight:700; }
  #cer .cbets.show { animation:cpop .7s both; }
  #cer .cshare { display:none; margin:18px auto 4px; max-width:360px; }
  #cer .cshare.show { display:block; animation:cpop .7s both; }
  #cer .cstats { display:none; margin:26px auto 10px; padding:14px 22px; max-width:360px; border-radius:14px; border:1px solid var(--line); background:var(--glass); color:var(--ink); text-decoration:none; font-weight:800; }
  #cer .cstats.show { display:block; animation:cpop .7s both; }
  #cer .cawh { margin:24px 0 12px; font-size:.85rem; letter-spacing:.2em; text-transform:uppercase; color:var(--mut); font-weight:800; opacity:0; transition:opacity .6s; }
  #cer .cawh.show { opacity:1; }
  #cer .awards { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:12px; text-align:left; }
  #cer .aw { opacity:0; transform:scale(.7) translateY(20px); padding:14px 16px; border-radius:18px; border:1px solid var(--line); background:var(--glass); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); }
  #cer .aw.show { animation:cpop .7s cubic-bezier(.2,1.4,.3,1) both; border-color:rgba(var(--gold-rgb),.4); }
  #cer .aw .ai { font-size:2rem; line-height:1; }
  #cer .aw .at { font-size:.72rem; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); font-weight:800; margin:6px 0 2px; }
  #cer .aw .aq { font-weight:800; font-size:1.05rem; line-height:1.2; }
  #cer .aw .ad { font-size:.85rem; color:var(--mut); margin-top:3px; }
  `;
  document.head.appendChild(css);

  /* ---------- fuochi d'artificio ---------- */
  let fx, fctx, parts = [], fxRaf = 0, burstT = 0;
  function burst(x, y) {
    const hue = Math.random() * 360, n = 46;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = 120 + Math.random() * 280; parts.push({x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, h: hue + Math.random() * 40, life: 0, max: 1.1 + Math.random() * .8}); }
  }
  function fxTick(now) {
    if (!fx) return;
    const dt = Math.min(.05, (now - (fxTick.l || now)) / 1000); fxTick.l = now;
    fctx.clearRect(0, 0, fx.width, fx.height); fctx.globalCompositeOperation = 'lighter';
    parts = parts.filter(p => p.life < p.max);
    for (const p of parts) { p.life += dt; p.vy += 170 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985;
      fctx.fillStyle = `hsla(${p.h},100%,62%,${Math.max(0, 1 - p.life / p.max)})`; fctx.beginPath(); fctx.arc(p.x, p.y, 2.6, 0, 7); fctx.fill(); }
    fxRaf = requestAnimationFrame(fxTick);
  }

  /* ---------- scaletta ---------- */
  function plan() {
    const ranked = data.pizzas.filter(p => p.total != null).slice(0, 3);
    const n = ranked.length, reveals = [];
    for (let i = 0; i < n; i++) {                                   // dal 3° (o ultimo) al 1°
      const rank = n - i, base = 5000 + i * 4500, last = rank === 1;
      reveals.push({rank, pizza: ranked[rank - 1], cap: base, show: base + (last ? 2800 : 600),
        text: last ? 'E il vincitore è…' : rank === 3 ? 'Al terzo posto…' : 'Al secondo posto…'});
    }
    const tLast = reveals.length ? reveals[reveals.length - 1].show : 5000;
    return {reveals, tBets: tLast + 3500, tAw: tLast + 6500, ranked};
  }

  function build(P) {
    el = document.createElement('div'); el.id = 'cer';
    const slot = r => { const R = P.reveals.find(x => x.rank === r); if (!R) return '';
      const p = R.pizza; return `<div class="pod p${r}" data-r="${r}"><div class="pinfo"><div class="pm">${r === 1 ? '👑' : r === 2 ? '🥈' : '🥉'}</div><div class="pn">${esc(p.name)}</div><div class="ps">${p.total.toFixed(1)}</div><div class="pp">${p.price ? eur(p.price) + ' · ' : ''}${p.n} vot${p.n === 1 ? 'o' : 'i'}</div></div><div class="pbox">${r}</div></div>`; };
    el.innerHTML = `<canvas id="cfx"></canvas><button class="cx" aria-label="Chiudi">✕</button>
      <div class="cin"><div class="ctitle">🏆 Il verdetto</div><div class="ccap" id="ccap">Preparatevi…</div><div class="ccount" id="ccount"></div>
      <div class="podium">${slot(2)}${slot(1)}${slot(3)}</div><div class="cbets" id="cbets"></div>
      <div class="cawh" id="cawh">Premi speciali</div>
      <button class="cshare" id="cshare">📣 Condividi il verdetto</button>
      <div class="awards">${data.awards.map(a => `<div class="aw"><div class="ai">${a.icon}</div><div class="at">${esc(a.title)}</div><div class="aq">${esc(a.who)}</div><div class="ad">${esc(a.detail || '')}</div></div>`).join('')}</div><a class="cstats" id="cstats" href="/stats" target="_blank" rel="noopener">📊 Statistiche per smanettoni →</a></div>`;
    document.body.appendChild(el);
    fx = $('cfx'); fctx = fx.getContext('2d'); const dpr = Math.min(2, devicePixelRatio || 1);
    fx.width = innerWidth * dpr; fx.height = innerHeight * dpr; fctx.setTransform(dpr, 0, 0, dpr, 0, 0); fx.width = innerWidth; fx.height = innerHeight; fctx.setTransform(1, 0, 0, 1, 0, 0);
    fxTick.l = 0; fxRaf = requestAnimationFrame(fxTick);
    $('cshare').onclick = () => {
      const top = data.pizzas.filter(p => p.total != null).slice(0, 3), med = ['🥇', '🥈', '🥉'], f1 = v => v.toFixed(1).replace('.', ',');
      const text = '🏆 Il verdetto della sfida delle pizze surgelate!\n' + top.map((p, i) => `${med[i]} ${p.name} (${f1(p.total)})`).join('\n') + '\n#SfidaPizze 🍕';
      window.shareSheet && shareSheet({text, card: {title: 'Il verdetto', subtitle: 'Sfida delle pizze surgelate', rows: top.map((p, i) => ({icon: med[i], label: p.name, value: f1(p.total)}))}});
    };
    el.querySelector('.cx').onclick = () => { if (isDash) { fetch('/api/ceremony/stop', {method: 'POST'}); dismissed = curSeq; stop(); } else { stop(); showBtn(); } };
  }

  function showBtn() {
    if (btn) return;
    btn = document.createElement('button'); btn.id = 'cbtn'; btn.textContent = '🏆 Apri il resoconto';
    btn.onclick = () => { const s = Date.now() + off - 5000; hideBtn(); start(s, true); };
    document.body.appendChild(btn);
  }
  function hideBtn() { btn && btn.remove(); btn = null; }

  function stop() { hideBtn(); running = false; cancelAnimationFrame(raf); cancelAnimationFrame(fxRaf); fx = null; parts = []; clearInterval(burstT); el && el.remove(); el = null; }

  async function start(t0ms, openNow) {
    let d; try { const r = await fetch('/api/final', {cache: 'no-store'}); if (!r.ok) return; d = await r.json(); } catch { return; }
    if (running) stop();
    data = d; t0 = t0ms; running = true; opened = !!openNow;
    const P = plan(); build(P);
    const shown = new Set(); let lastCount = null, drummed = false, fw = false, awShown = 0, betsShown = false, awHead = false;
    const loop = () => {
      if (!running) return;
      const e = Date.now() + off - t0, fresh = ms => e - ms < 1600;
      if (e >= 5000 && !opened) { stop(); showBtn(); return; }   // finito il countdown: il resoconto si apre solo dal pulsante
      if (e < 5000) {
        const c = Math.max(1, Math.ceil((5000 - Math.max(0, e)) / 1000)), cc = $('ccount');
        if (e >= 0 && c !== lastCount) { lastCount = c; cc.textContent = c; cc.classList.remove('t'); void cc.offsetWidth; cc.classList.add('t'); window.sfx && sfx.tick(c === 1); }
        if (!drummed && e < 4500) { drummed = true; window.sfx && sfx.drum(5000 - Math.max(0, e)); }
      } else if ($('ccount').textContent) $('ccount').textContent = '';
      for (const R of P.reveals) {
        if (e >= R.cap) $('ccap').textContent = R.text;
        if (e >= R.show && !shown.has(R.rank)) {
          shown.add(R.rank); el.querySelector(`.p${R.rank}`)?.classList.add('show');
          if (fresh(R.show) && window.sfx) R.rank === 1 ? (sfx.boom(), sfx.fanfare()) : sfx.boom();
          if (R.rank === 1) { fw = true; $('cshare').classList.add('show'); $('ccap').textContent = '🎉 ' + R.pizza.name + ' 🎉';
            for (let k = 0; k < 5; k++) setTimeout(() => fx && burst(innerWidth * (.15 + Math.random() * .7), innerHeight * (.15 + Math.random() * .35)), k * 280);
            burstT = setInterval(() => fx && burst(innerWidth * (.1 + Math.random() * .8), innerHeight * (.1 + Math.random() * .4)), 900); }
        }
      }
      if (e >= P.tBets && !betsShown) { betsShown = true; const b = data.bets, box = $('cbets');
        if (b.total) { box.innerHTML = b.correct.length ? `🔮 Pronostico azzeccato da: <span style="color:var(--gold)">${b.correct.map(esc).join(', ')}</span>` : '🔮 Nessuno aveva indovinato il vincitore!'; box.classList.add('show'); fresh(P.tBets) && window.sfx && sfx.award(); } else box.remove(); }
      if (e >= P.tAw && !awHead) { awHead = true; $('cawh').classList.add('show'); }
      const aws = el.querySelectorAll('.aw');
      while (awShown < aws.length && e >= P.tAw + awShown * 2400) { const a = aws[awShown++]; a.classList.add('show'); if (fresh(P.tAw + (awShown - 1) * 2400) && window.sfx) sfx.award(); if (awShown > 2 && fresh(P.tAw + (awShown - 1) * 2400)) a.scrollIntoView({behavior: 'smooth', block: 'nearest'}); }
      if (e >= P.tAw + aws.length * 2400 + 800) $('cstats').classList.add('show');
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  async function poll() {
    try {
      const r = await (await fetch('/api/ceremony', {cache: 'no-store'})).json();
      off = r.now * 1000 - Date.now(); window.CEREMONY = {active: r.active};
      if (r.active) { if (r.seq !== curSeq) { curSeq = r.seq; if (r.seq !== dismissed) await start(r.t0 * 1000); } }
      else { if (running) stop(); hideBtn(); }
    } catch {}
  }
  setInterval(poll, 1500); poll();
  window.CEREMONY = {active: false};
})();
