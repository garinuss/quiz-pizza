/* Effetti sonori sintetizzati con WebAudio (nessun file audio). Il browser li sblocca al primo tocco/clic. */
(() => {
  'use strict';
  let ac = null, muted = false, nbuf = null;
  try { muted = localStorage.getItem('pizza-mute') === '1'; } catch {}
  const A = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch {} return ac; };
  ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(e => addEventListener(e, A, {passive: true}));

  function tone(f, t, d, type = 'sine', v = .15, to) {
    const a = A(); if (!a || muted) return;
    const o = a.createOscillator(), g = a.createGain(), s = a.currentTime + t;
    o.type = type; o.frequency.setValueAtTime(f, s); if (to) o.frequency.exponentialRampToValueAtTime(to, s + d);
    g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(v, s + .012); g.gain.exponentialRampToValueAtTime(.0001, s + d);
    o.connect(g); g.connect(a.destination); o.start(s); o.stop(s + d + .03);
  }
  function noise(t, d, v = .2, f0 = 400, f1) {
    const a = A(); if (!a || muted) return;
    if (!nbuf) { nbuf = a.createBuffer(1, a.sampleRate, a.sampleRate); const ch = nbuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    const s = a.currentTime + t, src = a.createBufferSource(), fl = a.createBiquadFilter(), g = a.createGain();
    src.buffer = nbuf; src.loop = true; fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0, s); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, s + d);
    g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(v, s + .02); g.gain.exponentialRampToValueAtTime(.0001, s + d);
    src.connect(fl); fl.connect(g); g.connect(a.destination); src.start(s); src.stop(s + d + .03);
  }
  const seq = (n, step, type, v, d) => n.forEach((f, i) => tone(f, i * step, d, type, v));

  window.sfx = {
    get muted() { return muted; },
    setMuted(v) { muted = !!v; try { localStorage.setItem('pizza-mute', muted ? '1' : '0'); } catch {} },
    toggle() { this.setMuted(!muted); return muted; },
    tap() { tone(520, 0, .06, 'triangle', .1); },
    pop() { tone(300, 0, .12, 'sine', .14, 720); },
    join() { seq([523, 659, 784], .07, 'triangle', .12, .18); },
    ding() { tone(1175, 0, .25, 'sine', .14); tone(1568, .08, .3, 'sine', .1); },
    vote() { seq([392, 523, 659, 784, 1047], .07, 'triangle', .14, .22); },
    record() { seq([523, 659, 784, 1047, 1319, 1568], .08, 'square', .09, .25); },
    whoosh() { noise(0, .55, .22, 300, 3000); tone(180, 0, .5, 'sawtooth', .05, 700); },
    tick(hi) { tone(hi ? 1400 : 900, 0, .09, 'square', .09); },
    boom() { tone(110, 0, .8, 'sine', .4, 38); noise(0, .5, .3, 800, 100); },
    award() { tone(988, 0, .15, 'triangle', .14); tone(1319, .09, .3, 'triangle', .12); },
    fanfare() { seq([523, 659, 784, 1047], .12, 'sawtooth', .1, .35); [1047, 784, 659].forEach(f => tone(f, .5, .9, 'square', .07)); noise(.5, .8, .12, 2000, 6000); },
    drum(ms) { let t = 0, gap = .14; while (t * 1000 < ms) { tone(120, t, .09, 'sine', .3, 60); noise(t, .07, .22, 300, 150); t += gap; gap = Math.max(.045, gap * .93); } },
  };
})();
