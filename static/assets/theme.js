/* Temi a rotazione: il server sceglie il tema ogni 60 s, tutti i dispositivi lo seguono in automatico. */
(() => {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const rgb = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(','); };
  const FONT = {
    sys: 'system-ui,-apple-system,"Segoe UI",sans-serif',
    serif: '"Palatino Linotype","Book Antiqua",Palatino,Georgia,serif',
    mono: 'ui-monospace,"Cascadia Mono",Consolas,"Courier New",monospace',
    spooky: 'Georgia,"Times New Roman",serif',
    soft: '"Trebuchet MS","Segoe UI",system-ui,sans-serif',
    jp: '"Hiragino Sans","Yu Gothic","Meiryo",system-ui,sans-serif',
    comic: '"Comic Sans MS","Chalkboard SE","Comic Neue","Trebuchet MS",sans-serif',
    type: '"Courier New",Courier,monospace',
  };
  const mk = o => ({
    id: o.id, name: o.name, emoji: o.emoji, rain: o.rain, fx: o.fx, fxOpacity: o.fxOpacity ?? 1, fxColor: o.fxColor, fxMult: o.fxMult, cycle: !!o.cycle, confetti: o.confetti, sub: o.sub, dc: o.dc, ground: o.ground,
    vars: {
      '--bg': o.bg, '--bg2': o.bg2, '--bar': `rgba(${rgb(o.bg)},.8)`, '--ink': o.ink, '--mut': o.mut,
      '--gold': o.gold, '--red': o.red, '--gold-rgb': rgb(o.gold), '--red-rgb': rgb(o.red),
      '--glass': o.glass || 'rgba(255,255,255,.07)', '--line': o.line || 'rgba(255,255,255,.12)',
      '--a1': o.a1, '--a2': o.a2, '--a3': o.a3, '--font': FONT[o.font || 'sys'],
    },
  });

  const THEMES = [
    mk({ id:'classica', name:'Pizza Classica', emoji:'🍕', sub:'il gusto di sempre', bg:'#14090a', bg2:'#1d0f0d', ink:'#fff4e6', mut:'#b9a392', gold:'#ffb703', red:'#ff4d2e', a1:'#ff4d2e', a2:'#ffb703', a3:'#c2185b',
         rain:['🍕','🧀','🍅','🌶️'], fx:null, confetti:['#ffb703','#ff4d2e','#fff4e6','#4cc9f0','#7bd88f','#ff7eb6'] }),
    mk({ id:'pride', name:'Gay Pride', emoji:'🏳️‍🌈', sub:'love is love', bg:'#120a1c', bg2:'#1d1030', ink:'#ffffff', mut:'#cdb9e8', gold:'#ff4fa3', red:'#7c4dff', a1:'#ff3b6b', a2:'#ffd23f', a3:'#3dd6ff', cycle:true,
         rain:['🌈','💖','🦄','✨','🏳️‍🌈','💜'], fx:'confetti', fxOpacity:.9, confetti:['#e40303','#ff8c00','#ffed00','#008026','#24408e','#732982','#ff69b4'] }),
    mk({ id:'natale', name:'Natale', emoji:'🎄', sub:'ho ho ho!', bg:'#07140d', bg2:'#0e2218', ink:'#fff8f0', mut:'#a9c4b0', gold:'#ffd54a', red:'#e53935', a1:'#c62828', a2:'#2e7d32', a3:'#ffd54a',
         rain:['🎄','⛄','🎁','❄️','🦌','🔔'], fx:'snow', confetti:['#e53935','#2e7d32','#ffffff','#ffd54a'] }),
    mk({ id:'medievale', name:'Medievale', emoji:'🏰', sub:'per il re e per la pizza', bg:'#17110b', bg2:'#241a10', ink:'#f3e6c8', mut:'#b9a47c', gold:'#d4a935', red:'#b3261e', a1:'#8b1a1a', a2:'#d4a935', a3:'#3b2a14', font:'serif',
         rain:['🏰','⚔️','🛡️','🐉','👑','🍗'], fx:'embers', confetti:['#d4a935','#b3261e','#f3e6c8','#6b4a1f'] }),
    mk({ id:'matrix', name:'Matrix', emoji:'💻', sub:'segui il bianconiglio', bg:'#020a04', bg2:'#04140a', ink:'#d6ffe0', mut:'#6fae80', gold:'#7dff9b', red:'#00b34a', a1:'#00ff66', a2:'#00aa44', a3:'#003d1a', font:'mono', glass:'rgba(0,255,100,.06)', line:'rgba(0,255,100,.22)',
         rain:['💻','💾','🕶️','🔌'], fx:'matrix', fxOpacity:.6, confetti:['#7dff9b','#00b34a','#d6ffe0','#00ff66'] }),
    mk({ id:'spazio', name:'Spazio', emoji:'🚀', sub:'a un milione di miglia dal forno', bg:'#05071a', bg2:'#0c1030', ink:'#eaf0ff', mut:'#8fa0d0', gold:'#6ee7ff', red:'#a259ff', a1:'#5b3bff', a2:'#00d4ff', a3:'#ff4fd8',
         rain:['🚀','🪐','👽','🛸','⭐','🌙'], fx:'stars', confetti:['#6ee7ff','#a259ff','#ffffff','#ff4fd8'] }),
    mk({ id:'tropicale', name:'Tropicale', emoji:'🍍', sub:'sì, l’ananas… ma solo qui', bg:'#04222a', bg2:'#07323d', ink:'#fffbe8', mut:'#9fd3cf', gold:'#ffd23f', red:'#ff6b5a', a1:'#ff6b5a', a2:'#00c9b7', a3:'#ffd23f', font:'soft',
         rain:['🍍','🌴','🥥','🌺','🍹','🦩'], fx:'bubbles', confetti:['#ffd23f','#ff6b5a','#00c9b7','#ffffff'] }),
    mk({ id:'halloween', name:'Halloween', emoji:'🎃', sub:'dolcetto o pizzetto?', bg:'#0c0712', bg2:'#170d22', ink:'#fff0e0', mut:'#b79fcc', gold:'#ff8a1f', red:'#8e2de2', a1:'#ff6a00', a2:'#7b2ff7', a3:'#1b0b2e', font:'spooky',
         rain:['🎃','👻','🦇','🕷️','💀','🕸️'], fx:'bats', confetti:['#ff8a1f','#8e2de2','#a6ff3d','#fff0e0'] }),
    mk({ id:'synthwave', name:'Synthwave ’80', emoji:'🕹️', sub:'neon, palme e tramonti', bg:'#12041f', bg2:'#1e0836', ink:'#ffeefc', mut:'#c59ad8', gold:'#ff4fd8', red:'#00e5ff', a1:'#ff2e97', a2:'#00e5ff', a3:'#7b2ff7', font:'soft',
         rain:['🕹️','🌴','🎧','📼','💿','🌆'], fx:'grid', fxOpacity:.55, confetti:['#ff4fd8','#00e5ff','#ffe14d','#ffffff'] }),
    mk({ id:'giappone', name:'Giappone', emoji:'🌸', sub:'itadakimasu!', bg:'#1a0c12', bg2:'#2a1019', ink:'#fff1f4', mut:'#d3a5b3', gold:'#ffb3c7', red:'#e63946', a1:'#e63946', a2:'#ffb3c7', a3:'#7a1f3d', font:'jp',
         rain:['🌸','🎏','🍣','🍜','⛩️','🥢'], fx:'petals', confetti:['#ffb3c7','#e63946','#ffffff','#ff9ebb'] }),

    mk({ id:'western', name:'Far West', emoji:'🤠', sub:'in questa città la pizza è legge', bg:'#1c120a', bg2:'#2b1b0e', ink:'#f6e7c8', mut:'#c0a37a', gold:'#e8a33d', red:'#b5441f', a1:'#b5441f', a2:'#e8a33d', a3:'#5a3418', font:'serif',
         rain:['🌵','🤠','🐎','🐂','🥃','⭐'], fx:'dust', fxColor:'rgba(232,190,120,', fxOpacity:.9, confetti:['#e8a33d','#b5441f','#f6e7c8','#5a3418'] }),
    mk({ id:'abissi', name:'Abissi', emoji:'🐙', sub:'ventimila pizze sotto i mari', bg:'#021524', bg2:'#052a45', ink:'#e6f6ff', mut:'#86b8d6', gold:'#5de0ff', red:'#1e88e5', a1:'#0077b6', a2:'#00b4d8', a3:'#90e0ef',
         rain:['🐙','🐠','🦑','🐋','🦈','🐚'], fx:'fish', confetti:['#5de0ff','#1e88e5','#ffffff','#90e0ef'] }),
    mk({ id:'foresta', name:'Foresta incantata', emoji:'🧚', sub:'c’era una volta una pizza', bg:'#07140f', bg2:'#0d2419', ink:'#eafff0', mut:'#8fc4a0', gold:'#d4ff7a', red:'#19b37a', a1:'#1b8f5a', a2:'#b6ff6a', a3:'#7b5cff', font:'soft',
         rain:['🧚','🍄','🦋','🌿','🦉','🌙'], fx:'fireflies', confetti:['#d4ff7a','#19b37a','#7b5cff','#ffffff'] }),
    mk({ id:'inferno', name:'Inferno', emoji:'🌋', sub:'cottura a puntino… e oltre', bg:'#140404', bg2:'#260707', ink:'#fff0e6', mut:'#d09a8a', gold:'#ff9f1c', red:'#e5252a', a1:'#e5252a', a2:'#ff9f1c', a3:'#7a0c0c',
         rain:['🌋','🔥','😈','🧨','🌶️','💥'], fx:'embers', fxMult:2.4, confetti:['#ff9f1c','#e5252a','#fff0e6','#ffd23f'] }),
    mk({ id:'tempesta', name:'Tempesta pirata', emoji:'🏴‍☠️', sub:'yo-ho-ho e una pizza di rum', bg:'#060d1a', bg2:'#0e1c33', ink:'#e8efff', mut:'#8ea3c9', gold:'#f2c14e', red:'#c0392b', a1:'#1d3b6b', a2:'#f2c14e', a3:'#c0392b', font:'serif',
         rain:['🏴‍☠️','⚓','🦜','🗡️','💰','🌊'], fx:'rain', confetti:['#f2c14e','#c0392b','#e8efff','#1d3b6b'] }),
    mk({ id:'egitto', name:'Antico Egitto', emoji:'🏺', sub:'la pizza dei faraoni', bg:'#1a1206', bg2:'#2a1d0a', ink:'#fdf1cf', mut:'#cdb07a', gold:'#ffc83d', red:'#1fb5a8', a1:'#1fb5a8', a2:'#ffc83d', a3:'#8c5a14', font:'serif',
         rain:['🏺','🐪','🔺','🐍','👁️','🌴'], fx:'dust', fxColor:'rgba(255,205,110,', confetti:['#ffc83d','#1fb5a8','#fdf1cf','#8c5a14'] }),
    mk({ id:'disco', name:'Discoteca', emoji:'🪩', sub:'saturday night pizza fever', bg:'#0a0614', bg2:'#150a28', ink:'#ffffff', mut:'#c9b2f0', gold:'#ffe14d', red:'#ff3dcb', a1:'#ff3dcb', a2:'#3d8bff', a3:'#3dff9a',
         rain:['🪩','🕺','💃','🎶','🎤','✨'], fx:'disco', confetti:['#ffe14d','#ff3dcb','#3d8bff','#3dff9a'] }),
    mk({ id:'comics', name:'Fumetti', emoji:'💥', sub:'pow! bam! pizza!', bg:'#14153a', bg2:'#1d2054', ink:'#fffbe6', mut:'#b9bce8', gold:'#ffd400', red:'#ff2e4d', a1:'#ff2e4d', a2:'#ffd400', a3:'#2e6bff', font:'comic',
         rain:['💥','🦸','🦹','⚡','🛡️','🕷️'], fx:'comic', confetti:['#ffd400','#ff2e4d','#2e6bff','#ffffff'] }),
    mk({ id:'candy', name:'Caramelle', emoji:'🍭', sub:'dopo la pizza, il dolce', bg:'#1c0f24', bg2:'#2c1738', ink:'#fff0fa', mut:'#d7b3d9', gold:'#ff9ccf', red:'#7fe3c9', a1:'#ff7eb6', a2:'#7fe3c9', a3:'#ffd86b', font:'soft',
         rain:['🍭','🍬','🧁','🍩','🍰','🍫'], fx:'sprinkles', confetti:['#ff7eb6','#7fe3c9','#ffd86b','#b39bff'] }),
    mk({ id:'noir', name:'Cinema Noir', emoji:'🎬', sub:'ho assaggiato cose che voi umani…', bg:'#0b0b0c', bg2:'#161617', ink:'#eeeeee', mut:'#9a9a9a', gold:'#e8d9a0', red:'#b0262b', a1:'#3a3a3c', a2:'#e8d9a0', a3:'#b0262b', font:'type', glass:'rgba(255,255,255,.05)',
         rain:['🎬','🕵️','🚬','🎞️','🎩','🔍'], fx:'grain', confetti:['#e8d9a0','#b0262b','#eeeeee','#9a9a9a'] }),
  ];

  /* altri 40 temi pazzi: stessa struttura, definiti in modo compatto (colori derivati da sfondo/oro/rosso) */
  const mix = (a, b, t) => { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), c = s => Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t);
    return '#' + ((1 << 24) | (c(16) << 16) | (c(8) << 8) | c(0)).toString(16).slice(1); };
  const Q = (id, name, emoji, sub, bg, gold, red, fx, rain, o = {}) => { const ink = o.ink || '#ffffff';
    THEMES.push(mk({ id, name, emoji, sub, bg, bg2: o.bg2 || mix(bg, '#ffffff', .08), ink, mut: mix(ink, bg, .4), gold, red, a1: o.a1 || red, a2: o.a2 || gold, a3: o.a3 || mix(bg, gold, .4),
      font: o.font, glass: o.glass, line: o.line, rain, fx, fxOpacity: o.op, fxColor: o.col, fxMult: o.mult, cycle: o.cycle, dc: o.dc, ground: o.ground,
      confetti: o.conf || [gold, red, ink, mix(bg, gold, .5)] })); };

  Q('vichinghi', 'Vichinghi', '🛡️', 'al Valhalla con la pizza in mano', '#0b1219', '#d9b26a', '#b23a2e', 'snow', ['🛡️','🪓','⛵','🍖','🐺','⚡'], { font:'serif', ink:'#eaf0f5', dc:'⚔️', ground:'rgba(200,220,240,.2)' });
  Q('zombie', 'Zombie', '🧟', 'cervelli? no, solo mozzarella', '#0a1208', '#a6ff3d', '#c0392b', 'fireflies', ['🧟','🧠','🦴','⚰️','🩸','🪦'], { font:'spooky', ink:'#e4ffd6', dc:'🌕', ground:'rgba(120,255,60,.22)', op:.8 });
  Q('vampiri', 'Vampiri', '🧛', 'solo pizza all’aglio. no wait…', '#13040a', '#e8c46a', '#d1203c', 'bats', ['🧛','🦇','🩸','🏰','🌹','⚰️'], { font:'spooky', ink:'#ffe9ee', dc:'🌕', ground:'rgba(209,32,60,.25)' });
  Q('robot', 'Robot', '🤖', 'bip bop, tre minuti di forno', '#0b1018', '#7cf0ff', '#ff7a45', 'grid', ['🤖','⚙️','🔋','🦾','📡','💡'], { font:'mono', ink:'#e6f8ff', op:.4, line:'rgba(124,240,255,.22)', dc:'📡' });
  Q('alieni', 'Alieni', '👽', 'portami al tuo forno', '#06140f', '#9dff6a', '#b24dff', 'stars', ['👽','🛸','🌌','🛰️','☄️','🧪'], { ink:'#eaffe8', dc:'🛸', ground:'rgba(157,255,106,.18)' });
  Q('dinosauri', 'Dinosauri', '🦖', 'estinti… ma non le pizze', '#161006', '#ffb347', '#d9482b', 'dust', ['🦖','🦕','🥚','🌋','🌿','🦴'], { font:'soft', col:'rgba(255,170,80,', ink:'#fff1da', dc:'🌋', ground:'rgba(255,120,40,.25)' });
  Q('ghiaccio', 'Era Glaciale', '🧊', 'pizza surgelata, dal 20000 a.C.', '#071a26', '#9fe8ff', '#4aa8ff', 'snow', ['🧊','❄️','🦣','🐧','⛄','🥶'], { font:'soft', ink:'#eefaff', mult:1.8, dc:'❄️', ground:'rgba(200,240,255,.25)' });
  Q('deserto', 'Deserto', '🏜️', 'miraggio di mozzarella', '#21140a', '#ffc766', '#d1642a', 'dust', ['🏜️','🌵','🐪','🦂','☀️','🥵'], { font:'serif', col:'rgba(255,200,130,', mult:1.6, ink:'#fff0d6', dc:'☀️', ground:'rgba(255,170,70,.25)' });
  Q('giungla', 'Giungla', '🦜', 'benvenuti nella giungla (di basilico)', '#06170a', '#ffe14d', '#ff5a36', 'fireflies', ['🦜','🐒','🐍','🌴','🦧','🍌'], { font:'soft', ink:'#efffe0', dc:'🐒', ground:'rgba(60,200,90,.22)' });
  Q('circo', 'Circo', '🎪', 'signore e signori… la pizza!', '#1b0a2a', '#ffd23f', '#ff3b4e', 'confetti', ['🎪','🤹','🎠','🤡','🎈','🐘'], { font:'comic', ink:'#fff5e6', conf:['#ff3b4e','#ffd23f','#ffffff','#3b8bff'], dc:'🎈' });
  Q('carnevale', 'Carnevale', '🎭', 'a Carnevale ogni pizza vale', '#190a24', '#ffcf3d', '#ff4fa3', 'confetti', ['🎭','🎊','🎉','🪅','🃏','🎶'], { font:'soft', conf:['#ffcf3d','#ff4fa3','#34d6c9','#9b5cff'], dc:'🎭' });
  Q('calcio', 'Calcio', '⚽', 'fischio d’inizio: si mangia!', '#06210f', '#ffffff', '#ffd400', 'confetti', ['⚽','🥅','🏆','🧤','👟','📣'], { font:'comic', a3:'#0f6a2e', conf:['#ffffff','#ffd400','#1faa59','#ff3b3b'], dc:'🏆', ground:'rgba(60,200,100,.28)' });
  Q('formula1', 'Formula 1', '🏎️', 'pizza al pit stop in 2 secondi', '#120a0a', '#ffdd00', '#e10600', 'grid', ['🏎️','🏁','🛞','⛽','🏆','🚦'], { font:'mono', op:.4, ink:'#fff4f0', dc:'🏁', ground:'rgba(225,6,0,.3)' });
  Q('samba', 'Samba', '💃', 'carnevale a Rio, farcito', '#0a1f12', '#ffe600', '#00c853', 'confetti', ['💃','🥁','🦜','🎺','🌴','🎉'], { font:'soft', conf:['#ffe600','#00c853','#1e88e5','#ffffff'], dc:'🥁' });
  Q('messico', 'Messico', '🌮', 'ay caramba, che pizza!', '#1f0c10', '#ffc93c', '#ff3d6e', 'confetti', ['🌮','🌶️','🪇','🎺','🌵','💀'], { font:'soft', conf:['#ff3d6e','#ffc93c','#26c6a6','#9b5cff'], dc:'🪅' });
  Q('india', 'India', '🛕', 'pizza masala extra piccante', '#1f0d06', '#ffb21f', '#e8431a', 'petals', ['🛕','🐘','🪔','🌶️','🪷','🍛'], { font:'serif', ink:'#fff0db', dc:'🪔', ground:'rgba(255,150,40,.25)' });
  Q('grecia', 'Grecia', '🏛️', 'filosofia, feta e forno', '#06182a', '#ffffff', '#2f8cff', 'dust', ['🏛️','⚱️','🫒','🔱','🌊','🍇'], { font:'serif', col:'rgba(180,215,255,', a3:'#0d5eaf', dc:'🏛️', ground:'rgba(47,140,255,.28)' });
  Q('gladiatori', 'Gladiatori', '🏟️', 'siete pronti a mangiare?!', '#1d0f08', '#e8b04a', '#b2271f', 'embers', ['🏟️','⚔️','🛡️','🦁','🏛️','🍇'], { font:'serif', ink:'#fbead2', mult:1.3, dc:'🏟️', ground:'rgba(232,176,74,.22)' });
  Q('chef', 'Chef Stellato', '👨‍🍳', 'un tocco di basilico, e passa la paura', '#1a1a1a', '#f5f5f5', '#d33a2c', 'embers', ['👨‍🍳','🔪','🍳','🧑‍🍳','🥄','🍽️'], { font:'serif', mult:.6, a3:'#7a7a7a', dc:'🍽️' });
  Q('gelato', 'Gelateria', '🍦', 'pizza e gelato: sì, no, forse', '#241226', '#ffe0a3', '#ff6fa8', 'bubbles', ['🍦','🍨','🍧','🍒','🍓','🧁'], { font:'soft', ink:'#fff3fb', dc:'🍦', ground:'rgba(255,111,168,.2)' });
  Q('burger', 'Fast Food', '🍔', 'tradimento: panino contro pizza', '#1f0f06', '#ffc41f', '#e8331c', 'sprinkles', ['🍔','🍟','🥤','🌭','🥓','🍗'], { font:'comic', ink:'#fff2dc', dc:'🍔', ground:'rgba(255,196,31,.22)' });
  Q('autunno', 'Autunno', '🍂', 'foglie, funghi e pizza ai porcini', '#1a0f06', '#ff9a3c', '#c8431f', 'petals', ['🍂','🍁','🍄','🌰','🎃','🍇'], { font:'serif', ink:'#ffeede', dc:'🍁', ground:'rgba(255,140,50,.2)' });
  Q('unicorni', 'Unicorni', '🦄', 'scintillii di mozzarella magica', '#1d1033', '#ffd1f0', '#a77bff', 'sprinkles', ['🦄','🌈','✨','🍭','☁️','💖'], { font:'soft', cycle:true, conf:['#ff9ccf','#a77bff','#7fe3ff','#fff1a8'], dc:'🌈' });
  Q('streghe', 'Streghe e Maghi', '🧙', 'abracadabra: pizza!', '#10061f', '#c88bff', '#3ddc97', 'fireflies', ['🧙','🔮','🧪','📜','🪄','🕯️'], { font:'spooky', ink:'#f3e8ff', dc:'🔮', ground:'rgba(200,139,255,.22)' });
  Q('cyberpunk', 'Cyberpunk', '🌃', 'pizza 2077, consegna in drone', '#0a0714', '#faff3d', '#ff2a6d', 'rain', ['🌃','🤖','🦾','💊','📺','🏙️'], { font:'mono', glass:'rgba(255,42,109,.07)', line:'rgba(250,255,61,.25)', ink:'#f4f5ff', dc:'📺', ground:'rgba(255,42,109,.25)' });
  Q('steampunk', 'Steampunk', '⚙️', 'forno a vapore e ingranaggi', '#1a1008', '#d9a35b', '#b4532a', 'embers', ['⚙️','🎩','🔧','🕰️','🚂','🧭'], { font:'serif', ink:'#f6e4c6', mult:.8, dc:'⚙️', ground:'rgba(217,163,91,.2)' });
  Q('polare', 'Polo Nord', '🐧', 'pinguini e pizza ai 4 formaggi', '#071522', '#bff0ff', '#ff8a4a', 'snow', ['🐧','🐻‍❄️','🧊','🦭','❄️','🎿'], { font:'soft', ink:'#f0fbff', mult:2.2, dc:'🌌', ground:'rgba(220,245,255,.28)' });
  Q('atlantide', 'Atlantide', '🔱', 'la città perduta dei crostini', '#04162b', '#7ef0e0', '#8f5bff', 'fish', ['🔱','🧜','🐬','🪸','🐚','🦀'], { font:'serif', ink:'#e6fffb', dc:'🔱', ground:'rgba(126,240,224,.2)' });
  Q('safari', 'Safari', '🦁', 'nella savana nessuno ti sente mangiare', '#1d1307', '#ffcf5a', '#d35a1f', 'dust', ['🦁','🦒','🐘','🦓','🐆','🦏'], { font:'soft', col:'rgba(255,210,120,', ink:'#fff3d9', dc:'🌅', ground:'rgba(255,170,60,.28)' });
  Q('rock', 'Rock’n’Roll', '🎸', 'we will, we will… pizza!', '#0d0d10', '#ff3b3b', '#f5c518', 'embers', ['🎸','🤘','🥁','🎤','⚡','🔊'], { font:'comic', ink:'#fff', mult:1.2, dc:'🤘', ground:'rgba(255,59,59,.25)' });
  Q('jazz', 'Jazz Club', '🎷', 'sax, fumo e mozzarella blu', '#0a0f1f', '#ffc766', '#4f7bff', 'grain', ['🎷','🎹','🎺','🥃','🎶','🎩'], { font:'serif', ink:'#eef2ff', glass:'rgba(255,255,255,.05)', dc:'🎷', ground:'rgba(79,123,255,.2)' });
  Q('hippie', 'Anni ’70 Hippie', '☮️', 'peace, love & pizza', '#241008', '#ffd23a', '#ff6b2b', 'petals', ['☮️','🌻','🌼','🕊️','🚐','🎸'], { font:'soft', ink:'#fff3d8', cycle:true, conf:['#ffd23a','#ff6b2b','#7ac943','#ff5fa2'], dc:'🌻' });
  Q('pigiama', 'Pigiama Party', '🛏️', 'cuscini, film e pizza a mezzanotte', '#0d1030', '#ffd6f0', '#8ea2ff', 'stars', ['🛏️','🧸','😴','🌙','🍿','🧦'], { font:'soft', ink:'#f3f1ff', dc:'🌙', ground:'rgba(142,162,255,.2)' });
  Q('campeggio', 'Campeggio', '⛺', 'pizza al falò sotto le stelle', '#08140f', '#ffb347', '#ff5a1f', 'fireflies', ['⛺','🔥','🌲','🦉','🪵','🌌'], { font:'soft', ink:'#f0fff0', dc:'🔥', ground:'rgba(255,140,40,.28)' });
  Q('parigi', 'Parigi', '🥐', 'oui oui, la pizza è un po’ francese', '#13152b', '#f5d9a0', '#ef476f', 'petals', ['🥐','🗼','🥖','🧀','🍷','🎨'], { font:'serif', ink:'#fff4f4', dc:'🗼', ground:'rgba(239,71,111,.2)' });
  Q('londra', 'Londra', '☂️', 'tè delle cinque… e pizza delle sei', '#0e1219', '#e5c158', '#d12f3f', 'rain', ['☂️','🫖','🎩','🚌','👑','💂'], { font:'serif', ink:'#eef1f7', dc:'👑', ground:'rgba(209,47,63,.2)' });
  Q('casino', 'Casinò', '🎰', 'rien ne va plus: all-in sulla pizza', '#0a1d12', '#ffd700', '#e0222d', 'confetti', ['🎰','🃏','🎲','🪙','♠️','💰'], { font:'serif', conf:['#ffd700','#e0222d','#ffffff','#1faa59'], dc:'🎰', ground:'rgba(255,215,0,.2)' });
  Q('gaming', 'Gaming 8-bit', '👾', 'insert coin: pizza continua?', '#0a0a1f', '#ffe14d', '#ff4d6d', 'grid', ['👾','🕹️','🎮','🍄','⭐','🪙'], { font:'mono', op:.45, ink:'#eef', dc:'👾' });
  Q('kawaii', 'Kawaii', '🐱', 'nyaa~ che pizza carina!', '#2a1230', '#ffd1e8', '#7fe0ff', 'sprinkles', ['🐱','🍡','🧸','🌸','🍓','💕'], { font:'soft', cycle:true, ink:'#fff5fb', dc:'🐱' });
  Q('nonna', 'Cucina della Nonna', '👵', 'la pizza di nonna è un’altra cosa', '#1c140c', '#ffd9a0', '#c8472e', 'grain', ['👵','🧶','🍝','🥘','🍅','🧁'], { font:'type', ink:'#fff3e2', dc:'🧶', ground:'rgba(255,217,160,.18)' });

  /* decorazioni dei nuovi temi: emoji fluttuante in un angolo + sfumatura sul fondo */
  const decoCss = THEMES.filter(t => t.dc || t.ground).map((t, i) => { const s = `html[data-theme=${t.id}] #tdeco`; return `
  ${t.dc ? `${s}::before { content:'${t.dc}'; display:block; ${i % 2 ? 'right:4vw' : 'left:4vw'}; top:${8 + (i % 3) * 3}vh; font-size:4rem; opacity:.3; animation:tfloat ${6 + i % 4}s ease-in-out infinite; filter:drop-shadow(0 0 24px ${t.vars['--gold']}); }` : ''}
  ${t.ground ? `${s}::after { display:block; left:0; right:0; bottom:0; height:12vh; background:linear-gradient(to top,${t.ground},transparent); }` : ''}`; }).join('');

  /* ---------- stile iniettato: decorazioni per tema, etichetta, annuncio ---------- */
  const css = document.createElement('style');
  css.textContent = `
  #tfx { position:fixed; inset:0; width:100%; height:100%; pointer-events:none; z-index:0; transition:opacity .8s; }
  #tdeco { position:fixed; inset:0; pointer-events:none; z-index:15; }
  #tdeco::before, #tdeco::after { content:""; position:absolute; display:none; }
  @keyframes tslide { to { background-position:-200% 0; } }
  @keyframes ttwinkle { 0%,100% { opacity:.55; } 50% { opacity:1; } }
  @keyframes tflick { 0%,100% { opacity:.65; } 20% { opacity:1; } 45% { opacity:.75; } 70% { opacity:.95; } }
  @keyframes tfloat { 50% { transform:translateY(-14px) rotate(8deg); } }
  @keyframes twave { to { background-position-x:-600px; } }
  @keyframes tdrift { to { transform:translateX(8vw); } }

  html[data-theme=pride] #tdeco::before { display:block; left:0; right:0; top:0; height:6px; background:linear-gradient(90deg,#e40303,#ff8c00,#ffed00,#008026,#24408e,#732982,#e40303); background-size:200% 100%; animation:tslide 5s linear infinite; box-shadow:0 0 18px rgba(255,255,255,.35); }
  html[data-theme=natale] #tdeco::before { display:block; left:0; right:0; top:0; height:34px; border-top:2px solid rgba(255,255,255,.18);
    background:radial-gradient(circle at 14px 18px,#ff3b3b 0 6px,transparent 7px),radial-gradient(circle at 44px 24px,#ffd54a 0 6px,transparent 7px),radial-gradient(circle at 74px 18px,#3ddc84 0 6px,transparent 7px),radial-gradient(circle at 104px 24px,#4fc3f7 0 6px,transparent 7px);
    background-size:120px 34px; background-repeat:repeat-x; filter:drop-shadow(0 0 6px rgba(255,220,140,.8)); animation:ttwinkle 1.4s ease-in-out infinite; }
  html[data-theme=natale] #tdeco::after { display:block; left:0; right:0; bottom:0; height:60px; background:linear-gradient(to top,rgba(255,255,255,.22),transparent); }
  html[data-theme=medievale] #tdeco::before { display:block; left:0; right:0; top:0; height:10px; background:repeating-linear-gradient(90deg,#8b1a1a 0 24px,#d4a935 24px 48px); border-bottom:2px solid #3b2a14; }
  html[data-theme=medievale] #tdeco::after { display:block; inset:0; background:radial-gradient(48vmin 48vmin at 0 100%,rgba(255,150,40,.4),transparent 70%),radial-gradient(48vmin 48vmin at 100% 100%,rgba(255,150,40,.4),transparent 70%); animation:tflick 2.2s steps(1,end) infinite; }
  html[data-theme=matrix] #tdeco::before { display:block; inset:0; background:repeating-linear-gradient(0deg,rgba(0,255,100,.05) 0 1px,transparent 1px 3px),radial-gradient(120% 90% at 50% 50%,transparent 55%,rgba(0,0,0,.55)); }
  html[data-theme=spazio] #tdeco::before { content:'🪐'; display:block; right:4vw; top:12vh; font-size:4.2rem; opacity:.28; animation:tfloat 7s ease-in-out infinite; filter:drop-shadow(0 0 20px rgba(162,89,255,.7)); }
  html[data-theme=tropicale] #tdeco::before { content:'☀️'; display:block; right:4vw; top:10vh; font-size:4rem; opacity:.35; filter:drop-shadow(0 0 30px rgba(255,210,63,.9)); animation:tfloat 8s ease-in-out infinite; }
  html[data-theme=tropicale] #tdeco::after { display:block; left:0; right:0; bottom:0; height:44px; background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 60' preserveAspectRatio='none'><path d='M0 30 Q150 0 300 30 T600 30 T900 30 T1200 30 V60 H0Z' fill='%2300c9b7' fill-opacity='.3'/></svg>") repeat-x; background-size:600px 44px; animation:twave 8s linear infinite; }
  html[data-theme=halloween] #tdeco::before { content:'🌕'; display:block; left:5vw; top:8vh; font-size:4.8rem; opacity:.35; filter:drop-shadow(0 0 28px rgba(255,200,120,.8)); }
  html[data-theme=halloween] #tdeco::after { display:block; left:-10vw; right:-10vw; bottom:0; height:34vh; background:radial-gradient(60% 100% at 20% 100%,rgba(180,140,255,.26),transparent),radial-gradient(60% 100% at 80% 100%,rgba(255,140,40,.2),transparent); animation:tdrift 12s ease-in-out infinite alternate; }
  html[data-theme=synthwave] #tdeco::before { display:block; inset:0; background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 4px),radial-gradient(130% 100% at 50% 50%,transparent 60%,rgba(0,0,0,.5)); }
  html[data-theme=giappone] #tdeco::before { display:block; right:-12vmin; top:6vh; width:56vmin; height:56vmin; border-radius:50%; background:radial-gradient(circle,rgba(230,57,70,.5),rgba(230,57,70,0) 68%); }
  html[data-theme=giappone] #tdeco::after { content:'ピザ対決'; display:block; right:10px; top:120px; writing-mode:vertical-rl; font-size:1.9rem; font-weight:900; letter-spacing:.2em; color:rgba(255,179,199,.22); }
  html[data-theme=medievale] h1 { font-variant:small-caps; letter-spacing:.03em; }
  html[data-theme=western] #tdeco::before { display:block; right:-8vmin; bottom:-14vmin; width:60vmin; height:60vmin; border-radius:50%; background:radial-gradient(circle,rgba(255,150,40,.5),rgba(255,150,40,0) 68%); }
  html[data-theme=western] #tdeco::after { content:'🌵    🐎    🌵    🤠    🌵    🌵    🐎    🌵    🌵    🤠'; display:block; left:0; right:0; bottom:2px; white-space:nowrap; overflow:hidden; font-size:2rem; opacity:.3; letter-spacing:.4em; }
  @keyframes tsway { from { transform:rotate(-4deg); } to { transform:rotate(4deg); } }
  html[data-theme=abissi] #tdeco::before { display:block; inset:-20% -10% 40% -10%; background:repeating-linear-gradient(105deg,rgba(150,230,255,.07) 0 40px,transparent 40px 110px); transform-origin:top; animation:tsway 9s ease-in-out infinite alternate; }
  html[data-theme=foresta] #tdeco::after { display:block; left:-10vw; right:-10vw; bottom:0; height:32vh; background:radial-gradient(60% 100% at 25% 100%,rgba(90,255,170,.2),transparent),radial-gradient(60% 100% at 75% 100%,rgba(150,110,255,.2),transparent); animation:tdrift 14s ease-in-out infinite alternate; }
  html[data-theme=inferno] #tdeco::after { display:block; left:0; right:0; bottom:0; height:110px; background:linear-gradient(to top,rgba(255,90,20,.75),rgba(255,160,30,.25) 55%,transparent); animation:tflick 1.7s steps(1,end) infinite; }
  html[data-theme=tempesta] #tdeco::before { display:block; inset:0; background:radial-gradient(120% 90% at 50% 40%,transparent 45%,rgba(0,0,10,.6)); }
  html[data-theme=tempesta] #tdeco::after { content:'⚓'; display:block; left:5vw; bottom:12vh; font-size:3.5rem; opacity:.18; animation:tfloat 6s ease-in-out infinite; }
  html[data-theme=egitto] #tdeco::before { content:'☀️'; display:block; right:6vw; top:9vh; font-size:4rem; opacity:.4; filter:drop-shadow(0 0 34px rgba(255,200,61,.9)); animation:tfloat 8s ease-in-out infinite; }
  html[data-theme=egitto] #tdeco::after { display:block; left:0; right:0; bottom:0; height:17vh; background:linear-gradient(180deg,rgba(255,200,61,.28),rgba(255,200,61,.06)); clip-path:polygon(0 100%,15% 45%,30% 100%,36% 100%,62% 10%,88% 100%,100% 100%); }
  @keyframes tspin { to { transform:translateX(-50%) rotate(360deg); } }
  html[data-theme=disco] #tdeco::before { content:'🪩'; display:block; left:50%; top:-6px; transform:translateX(-50%); font-size:3.4rem; animation:tspin 6s linear infinite; filter:drop-shadow(0 0 24px rgba(255,255,255,.8)); }
  html[data-theme=comics] #tdeco::before { display:block; inset:0; background:radial-gradient(circle,rgba(255,255,255,.14) 1.6px,transparent 2.2px) 0 0/14px 14px; -webkit-mask:linear-gradient(135deg,#000,transparent 70%); mask:linear-gradient(135deg,#000,transparent 70%); }
  html[data-theme=comics] .glass { border-width:2px; border-color:#111; box-shadow:5px 5px 0 rgba(0,0,0,.85); }
  html[data-theme=candy] #tdeco::before { display:block; left:0; right:0; top:0; height:9px; background:repeating-linear-gradient(45deg,#ff8fb8 0 12px,#fff 12px 24px); }
  html[data-theme=noir] #tdeco::before { display:block; inset:0; background:radial-gradient(130% 100% at 50% 50%,transparent 50%,rgba(0,0,0,.7)); box-shadow:inset 0 14px 0 #000, inset 0 -14px 0 #000; animation:tflick 3s steps(1,end) infinite; }
  #tchip.off .te, #tchip.off .tn, #tchip.off .tt, #tchip.off i { display:none; }
  #tchip .sm { pointer-events:auto; cursor:pointer; font-size:1rem; padding-left:4px; }
  html[data-theme=halloween] h1 { font-style:italic; }

  #tchip { position:fixed; left:14px; bottom:calc(14px + env(safe-area-inset-bottom)); z-index:35; pointer-events:none; display:flex; align-items:center; gap:8px; padding:7px 12px 9px; border-radius:99px;
    font:700 .75rem/1 var(--font); color:var(--ink); background:var(--bar); border:1px solid var(--line); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); box-shadow:0 8px 24px rgba(0,0,0,.35); overflow:hidden; opacity:.9; }
  #tchip .te { font-size:1.15rem; }
  #tchip .tt { color:var(--mut); font-variant-numeric:tabular-nums; }
  #tchip i { position:absolute; left:0; bottom:0; height:3px; width:100%; background:linear-gradient(90deg,var(--gold),var(--red)); transform-origin:left; }
  #tchip.btn { pointer-events:auto; cursor:pointer; }
  #tsplash { position:fixed; inset:0; z-index:200; pointer-events:none; display:grid; place-items:center; text-align:center; clip-path:circle(0% at 50% 50%); }
  #tsplash .te { font-size:min(34vw,12rem); line-height:1; animation:tpop .9s cubic-bezier(.2,1.5,.3,1) both; filter:drop-shadow(0 12px 40px rgba(0,0,0,.5)); }
  #tsplash .tn { font-size:clamp(2rem,9vw,4.6rem); font-weight:900; letter-spacing:.08em; text-transform:uppercase; margin-top:6px; text-shadow:0 6px 30px rgba(0,0,0,.45); animation:tup .7s .15s cubic-bezier(.2,.9,.3,1) both; }
  #tsplash .ts { font-size:1.05rem; opacity:.85; margin-top:6px; letter-spacing:.14em; text-transform:uppercase; animation:tup .7s .3s both; }
  @keyframes tpop { from { transform:scale(.2) rotate(-40deg); opacity:0; } 60% { transform:scale(1.2) rotate(8deg); opacity:1; } to { transform:none; } }
  @keyframes tup { from { transform:translateY(30px); opacity:0; } to { transform:none; opacity:1; } }
  @media (prefers-reduced-motion: reduce) { #tdeco *, #tdeco::before, #tdeco::after { animation:none !important; } }
  `;
  css.textContent += decoCss + `
  #tchip .sk { display:none; pointer-events:auto; cursor:pointer; font-size:.8rem; padding:3px 8px; border-radius:99px; background:rgba(var(--gold-rgb),.22); border:1px solid var(--line); }
  #tchip.canskip .sk { display:inline; }
  #tchip.off .sk { display:none; }`;
  document.head.appendChild(css);

  const deco = document.createElement('div'); deco.id = 'tdeco';
  const chip = document.createElement('div'); chip.id = 'tchip';
  chip.innerHTML = '<span class="te"></span><span class="tn"></span><span class="tt"></span><span class="sk" title="Salta questo tema">⏭️ Salta</span><span class="sm" title="Audio">🔊</span><i></i>';
  const sm = () => chip.querySelector('.sm');
  const syncSm = () => sm().textContent = (window.sfx && sfx.muted) ? '🔇' : '🔊';
  chip.addEventListener('click', e => { if (e.target.closest('.sk')) { e.stopPropagation(); chip.classList.remove('canskip'); fetch('/api/theme/skip', {method:'POST'}).then(poll); return; }
    if (e.target.closest('.sm')) { e.stopPropagation(); window.sfx && (sfx.toggle(), sfx.tap()); syncSm(); } }, true);
  setTimeout(syncSm, 300);
  const mount = () => { document.body.appendChild(deco); document.body.appendChild(chip); };
  document.body ? mount() : addEventListener('DOMContentLoaded', mount);

  /* ---------- pioggia di emoji (sfondo) ---------- */
  function setRain(list) {
    const r = document.getElementById('rain'); if (!r) return;
    r.innerHTML = '';
    for (let i = 0; i < 14; i++) {
      const s = document.createElement('span'); s.textContent = list[i % list.length];
      s.style.left = Math.random() * 100 + 'vw'; s.style.fontSize = (22 + Math.random() * 38) + 'px';
      s.style.animationDuration = (14 + Math.random() * 20) + 's'; s.style.animationDelay = (-Math.random() * 34) + 's';
      r.appendChild(s);
    }
  }

  /* ---------- effetti su canvas ---------- */
  const FX = (() => {
    const cv = document.createElement('canvas'); cv.id = 'tfx';
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, mode = null, P = [], raf = 0, last = 0, X = {};
    const R = (a, b) => a + Math.random() * (b - a);
    const place = () => { const r = document.getElementById('rain'); r ? r.after(cv) : document.body.prepend(cv); };
    document.body ? place() : addEventListener('DOMContentLoaded', place);
    function size() { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    addEventListener('resize', () => { size(); if (mode) setup[mode](); }); size();
    const N = k => Math.max(10, Math.round(W * H / (k / (X.mult || 1))));

    const setup = {
      snow() { P = Array.from({length: N(9000)}, () => ({x:R(0,W), y:R(0,H), r:R(1,4), vy:R(25,70), ph:R(0,6.3), sw:R(10,30)})); },
      stars() { P = Array.from({length: N(4500)}, () => ({x:R(0,W), y:R(0,H), z:R(.2,1), ph:R(0,6.3)})); X.shots = []; X.next = 1.5; },
      matrix() { const cols = Math.ceil(W / 18); P = Array.from({length: cols}, () => ({y:R(-H, 0), v:R(90, 300)})); X.chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓ'; },
      petals() { const pal = ['#ffc2d4','#ffb3c7','#ff9ebb','#fff0f3']; P = Array.from({length: N(16000)}, () => ({x:R(0,W), y:R(-H,H), s:R(5,10), vy:R(28,60), vx:R(10,30), rot:R(0,6.3), vr:R(-1.5,1.5), ph:R(0,6.3), c:pal[(Math.random()*4)|0]})); },
      embers() { P = Array.from({length: N(14000)}, () => ({x:R(0,W), y:R(0,H), vy:-R(25,90), vx:R(-12,12), r:R(1,3.2), ph:R(0,6.3), h:R(20,45)})); },
      confetti() { P = Array.from({length: N(12000)}, () => ({x:R(0,W), y:R(-H,H), vy:R(30,80), vx:R(-15,15), rot:R(0,6.3), vr:R(-3,3), w:R(5,10), h:R(8,16), hue:R(0,360), ph:R(0,6.3), round:Math.random()<.3})); },
      bubbles() { P = Array.from({length: N(24000)}, () => ({x:R(0,W), y:R(0,H), r:R(5,26), vy:-R(14,50), ph:R(0,6.3)})); },
      bats() { P = Array.from({length: 8}, () => ({x:R(-100,W), y:R(40,H*.7), s:R(22,40), v:R(40,110), ph:R(0,6.3), dir:Math.random()<.5 ? 1 : -1})); },
      grid() { X.phase = 0; },
      dust() { P = Array.from({length: N(9000)}, () => ({x:R(0,W), y:R(0,H), r:R(.8,2.6), vx:R(60,170), vy:R(-14,14), ph:R(0,6.3), a:+R(.15,.55).toFixed(2)})); },
      fish() { const E = ['🐟','🐠','🐡','🐟','🦈','🐠']; P = Array.from({length: 9}, () => ({x:R(0,W), y:R(60,H-60), s:R(22,42), v:R(30,95), ph:R(0,6.3), dir:Math.random()<.5 ? 1 : -1, e:E[(Math.random()*E.length)|0]}));
        X.bub = Array.from({length: 30}, () => ({x:R(0,W), y:R(0,H), r:R(2,7), vy:-R(15,45), ph:R(0,6.3)})); },
      fireflies() { P = Array.from({length: N(14000)}, () => ({x:R(0,W), y:R(0,H), vx:R(-20,20), vy:R(-20,20), ph:R(0,6.3), r:R(2,4.5)})); },
      rain() { P = Array.from({length: N(2800)}, () => ({x:R(0,W+200), y:R(0,H), l:R(12,26), v:R(650,1000)})); X.flash = 0; X.next = R(3,7); X.bolt = null; },
      disco() { P = Array.from({length: 70}, () => ({x:R(0,W), y:R(0,H), ph:R(0,6.3), hue:R(0,360), s:R(4,12)})); },
      comic() { X.words = ['POW!','BAM!','ZAP!','WOW!','BOOM!','KAPOW!','YUM!','SLURP!']; X.items = []; X.next = .3; },
      sprinkles() { const pal = ['#ff7eb6','#7fe3c9','#ffd86b','#b39bff','#ffffff','#ff9ccf']; P = Array.from({length: N(9000)}, () => ({x:R(0,W), y:R(-H,H), vy:R(25,70), vx:R(-12,12), rot:R(0,6.3), vr:R(-2,2), len:R(7,12), c:pal[(Math.random()*pal.length)|0]})); },
      grain() { X.acc = 0; },
    };
    const draw = {
      snow(dt, t) { ctx.clearRect(0,0,W,H); ctx.fillStyle = '#fff';
        for (const p of P) { p.y += p.vy*dt; p.x += Math.sin(t*.0008 + p.ph)*p.sw*dt; if (p.y > H+5) { p.y = -5; p.x = R(0,W); } ctx.globalAlpha = .4 + p.r/7; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill(); } ctx.globalAlpha = 1; },
      stars(dt, t) { ctx.clearRect(0,0,W,H); ctx.fillStyle = '#fff';
        for (const p of P) { p.x -= p.z*14*dt; if (p.x < -2) p.x = W + 2; ctx.globalAlpha = (.35 + .65*Math.abs(Math.sin(t*.0015*p.z + p.ph))) * p.z; ctx.beginPath(); ctx.arc(p.x,p.y,p.z*1.7,0,7); ctx.fill(); }
        ctx.globalAlpha = 1; X.next -= dt;
        if (X.next < 0) { X.shots.push({x:R(W*.3,W), y:R(0,H*.35), vx:-R(500,800), vy:R(250,420), life:0}); X.next = R(3,7); }
        X.shots = X.shots.filter(s => s.life < .9);
        for (const s of X.shots) { s.life += dt; s.x += s.vx*dt; s.y += s.vy*dt; const g = ctx.createLinearGradient(s.x,s.y,s.x - s.vx*.12,s.y - s.vy*.12); g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(1,'rgba(255,255,255,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(s.x - s.vx*.12, s.y - s.vy*.12); ctx.stroke(); } },
      matrix(dt) { ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.05)'; ctx.fillRect(0,0,W,H); ctx.globalCompositeOperation = 'source-over';
        ctx.font = '16px monospace'; const cs = X.chars;
        P.forEach((c, i) => { c.y += c.v*dt; if (c.y > H + 20) { c.y = R(-200, 0); c.v = R(90, 300); }
          ctx.fillStyle = '#d6ffe0'; ctx.fillText(cs[(Math.random()*cs.length)|0], i*18, c.y);
          ctx.fillStyle = '#00ff66'; ctx.fillText(cs[(Math.random()*cs.length)|0], i*18, c.y - 16); }); },
      petals(dt, t) { ctx.clearRect(0,0,W,H);
        for (const p of P) { p.y += p.vy*dt; p.x += (p.vx + Math.sin(t*.0012 + p.ph)*22)*dt; p.rot += p.vr*dt; if (p.y > H+10 || p.x > W+10) { p.y = -10; p.x = R(-50,W); }
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.scale(1, .55 + .45*Math.abs(Math.sin(t*.002 + p.ph))); ctx.fillStyle = p.c; ctx.globalAlpha = .85; ctx.beginPath(); ctx.ellipse(0,0,p.s,p.s*.55,0,0,6.3); ctx.fill(); ctx.restore(); } ctx.globalAlpha = 1; },
      embers(dt, t) { ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation = 'lighter';
        for (const p of P) { p.y += p.vy*dt; p.x += (p.vx + Math.sin(t*.002 + p.ph)*10)*dt; if (p.y < -10) { p.y = H + 10; p.x = R(0,W); }
          const a = .35 + .65*Math.abs(Math.sin(t*.004 + p.ph)), g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*4);
          g.addColorStop(0,`hsla(${p.h},100%,62%,${a})`); g.addColorStop(1,`hsla(${p.h},100%,50%,0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*4,0,7); ctx.fill(); }
        ctx.globalCompositeOperation = 'source-over'; },
      confetti(dt, t) { ctx.clearRect(0,0,W,H);
        for (const p of P) { p.y += p.vy*dt; p.x += (p.vx + Math.sin(t*.001 + p.ph)*20)*dt; p.rot += p.vr*dt; if (p.y > H+20) { p.y = -20; p.x = R(0,W); }
          ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle = `hsla(${(p.hue + t*.05) % 360},90%,62%,.85)`;
          if (p.round) { ctx.beginPath(); ctx.arc(0,0,p.w*.5,0,7); ctx.fill(); } else ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore(); } },
      bubbles(dt, t) { ctx.clearRect(0,0,W,H);
        for (const p of P) { p.y += p.vy*dt; p.x += Math.sin(t*.001 + p.ph)*12*dt; if (p.y < -30) { p.y = H + 30; p.x = R(0,W); }
          ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*.7,3.6,4.5); ctx.stroke(); } },
      bats(dt, t) { ctx.clearRect(0,0,W,H); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const p of P) { p.x += p.v*p.dir*dt; if (p.x > W+80) p.x = -80; if (p.x < -80) p.x = W+80;
          const y = p.y + Math.sin(t*.002 + p.ph)*40; ctx.save(); ctx.translate(p.x,y); ctx.scale((.55 + .45*Math.abs(Math.sin(t*.011 + p.ph))) * p.dir, 1); ctx.font = p.s + 'px serif'; ctx.globalAlpha = .75; ctx.fillText('🦇',0,0); ctx.restore(); } },
      grid(dt, t) { ctx.clearRect(0,0,W,H); X.phase = (X.phase + dt*.45) % 1;
        const hy = H*.62, cx = W/2, rad = Math.min(W,H)*.22;
        const sun = ctx.createLinearGradient(0,hy-rad*2,0,hy); sun.addColorStop(0,'#ffe14d'); sun.addColorStop(.55,'#ff6a3d'); sun.addColorStop(1,'#ff2e97');
        ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(cx, hy - rad*.95, rad, 0, 7); ctx.fill();
        ctx.globalCompositeOperation = 'destination-out'; for (let i = 1; i <= 6; i++) ctx.fillRect(cx - rad, hy - rad*.95 + rad*(.15 + i*.14), rad*2, i*2.2);
        ctx.globalCompositeOperation = 'source-over';
        const gr = ctx.createLinearGradient(0,hy,0,H); gr.addColorStop(0,'rgba(30,8,54,.0)'); gr.addColorStop(1,'rgba(18,4,31,.75)'); ctx.fillStyle = gr; ctx.fillRect(0,hy,W,H-hy);
        ctx.strokeStyle = 'rgba(255,79,216,.55)'; ctx.lineWidth = 1.2;
        for (let i = -22; i <= 22; i++) { ctx.beginPath(); ctx.moveTo(cx + i*W*.02, hy); ctx.lineTo(cx + i*W*.16, H); ctx.stroke(); }
        for (let k = 0; k < 14; k++) { const z = ((k + X.phase)/14), y = hy + (H-hy)*z*z; ctx.globalAlpha = .25 + z*.75; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); } ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(0,229,255,.7)'; ctx.beginPath(); ctx.moveTo(0,hy); ctx.lineTo(W,hy); ctx.stroke(); },
      dust(dt, t) { ctx.clearRect(0,0,W,H); const gust = 1 + .7*Math.sin(t*.0006);
        for (const p of P) { p.x += p.vx*gust*dt; p.y += (p.vy + Math.sin(t*.002 + p.ph)*12)*dt; if (p.x > W+5) { p.x = -5; p.y = R(0,H); } ctx.fillStyle = (X.col || 'rgba(232,190,120,') + p.a + ')'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill(); } },
      fish(dt, t) { ctx.clearRect(0,0,W,H); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.2;
        for (const b of X.bub) { b.y += b.vy*dt; b.x += Math.sin(t*.002 + b.ph)*10*dt; if (b.y < -10) { b.y = H+10; b.x = R(0,W); } ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,7); ctx.stroke(); }
        for (const p of P) { p.x += p.v*p.dir*dt; if (p.x > W+60) p.x = -60; if (p.x < -60) p.x = W+60; const y = p.y + Math.sin(t*.0015 + p.ph)*18;
          ctx.save(); ctx.translate(p.x,y); ctx.scale(-p.dir,1); ctx.font = p.s + 'px serif'; ctx.globalAlpha = .8; ctx.fillText(p.e,0,0); ctx.restore(); } },
      fireflies(dt, t) { ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation = 'lighter';
        for (const p of P) { p.vx += R(-30,30)*dt; p.vy += R(-30,30)*dt; p.vx *= .98; p.vy *= .98; p.x += p.vx*dt; p.y += p.vy*dt; if (p.x < -10) p.x = W+10; if (p.x > W+10) p.x = -10; if (p.y < -10) p.y = H+10; if (p.y > H+10) p.y = -10;
          const a = .15 + .85*Math.max(0, Math.sin(t*.003 + p.ph)), g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*5); g.addColorStop(0,`rgba(214,255,110,${a})`); g.addColorStop(1,'rgba(214,255,110,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*5,0,7); ctx.fill(); }
        ctx.globalCompositeOperation = 'source-over'; },
      rain(dt, t) { ctx.clearRect(0,0,W,H); ctx.strokeStyle = 'rgba(190,210,255,.45)'; ctx.lineWidth = 1.2; ctx.beginPath();
        for (const p of P) { p.y += p.v*dt; p.x -= p.v*.25*dt; if (p.y > H) { p.y = -20; p.x = R(0,W+200); } ctx.moveTo(p.x,p.y); ctx.lineTo(p.x + p.l*.25, p.y - p.l); } ctx.stroke();
        X.next -= dt; if (X.next < 0) { X.flash = 1; X.next = R(4,9); let x = R(W*.1,W*.9), y = 0; X.bolt = [[x,y]]; while (y < H*.55) { x += R(-40,40); y += R(25,60); X.bolt.push([x,y]); } }
        if (X.flash > .01) { ctx.fillStyle = `rgba(220,230,255,${X.flash*.28})`; ctx.fillRect(0,0,W,H);
          if (X.bolt && X.flash > .55) { ctx.strokeStyle = `rgba(255,255,255,${X.flash})`; ctx.lineWidth = 2.5; ctx.beginPath(); X.bolt.forEach(([bx,by],i) => i ? ctx.lineTo(bx,by) : ctx.moveTo(bx,by)); ctx.stroke(); }
          X.flash *= Math.pow(.02, dt*1.6); } },
      disco(dt, t) { ctx.clearRect(0,0,W,H); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 7; i++) { const a = t*.0004*(i%2 ? 1 : -1) + i*.9 + Math.PI/2, len = Math.max(W,H)*1.3, w = .09, c = `hsla(${(t*.04 + i*50) % 360},100%,60%,`;
          const g = ctx.createLinearGradient(W/2,-10,W/2 + Math.cos(a)*len, -10 + Math.sin(a)*len); g.addColorStop(0,c + '.30)'); g.addColorStop(1,c + '0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(W/2,-10); ctx.lineTo(W/2 + Math.cos(a-w)*len, -10 + Math.sin(a-w)*len); ctx.lineTo(W/2 + Math.cos(a+w)*len, -10 + Math.sin(a+w)*len); ctx.fill(); }
        for (const p of P) { const a = Math.max(0, Math.sin(t*.004 + p.ph)); if (a < .05) continue; ctx.fillStyle = `hsla(${p.hue},100%,75%,${a})`; ctx.fillRect(p.x - p.s/2, p.y - .6, p.s, 1.2); ctx.fillRect(p.x - .6, p.y - p.s/2, 1.2, p.s); }
        ctx.globalCompositeOperation = 'source-over'; },
      comic(dt, t) { ctx.clearRect(0,0,W,H); X.next -= dt;
        if (X.next < 0) { X.items.push({x:R(60,W-60), y:R(90,H-90), life:0, rot:R(-.35,.35), s:R(26,46), w:X.words[(Math.random()*X.words.length)|0], hue:[48,350,205][(Math.random()*3)|0]}); X.next = R(.7,1.4); }
        X.items = X.items.filter(i => i.life < 2.2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (const i of X.items) { i.life += dt; const k = i.life/2.2, sc = k < .15 ? k/.15*1.2 : 1.2 - Math.min(.2,(k-.15)*.6), al = k > .7 ? (1-k)/.3 : 1;
          ctx.save(); ctx.translate(i.x,i.y); ctx.rotate(i.rot); ctx.scale(sc,sc);
          ctx.globalAlpha = al*.5; ctx.fillStyle = `hsl(${i.hue},100%,58%)`; ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.beginPath();
          for (let j = 0; j < 20; j++) { const rr = i.s*(j%2 ? 1.1 : 1.8), a = j/20*6.283; ctx.lineTo(Math.cos(a)*rr*1.4, Math.sin(a)*rr); } ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.globalAlpha = al*.95; ctx.font = `900 italic ${i.s}px "Comic Sans MS","Trebuchet MS",sans-serif`; ctx.lineWidth = 6; ctx.strokeText(i.w,0,0); ctx.fillStyle = '#fff'; ctx.fillText(i.w,0,0); ctx.restore(); } },
      sprinkles(dt, t) { ctx.clearRect(0,0,W,H); ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.globalAlpha = .85;
        for (const p of P) { p.y += p.vy*dt; p.x += p.vx*dt; p.rot += p.vr*dt; if (p.y > H+10) { p.y = -10; p.x = R(0,W); } ctx.strokeStyle = p.c; const dx = Math.cos(p.rot)*p.len/2, dy = Math.sin(p.rot)*p.len/2; ctx.beginPath(); ctx.moveTo(p.x-dx,p.y-dy); ctx.lineTo(p.x+dx,p.y+dy); ctx.stroke(); } ctx.globalAlpha = 1; },
      grain(dt, t) { X.acc += dt; if (X.acc < .08) return; X.acc = 0; ctx.clearRect(0,0,W,H); const n = Math.round(W*H/1600);
        for (let i = 0; i < n; i++) { ctx.fillStyle = Math.random() < .5 ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.25)'; ctx.fillRect(Math.random()*W, Math.random()*H, 1.5, 1.5); }
        if (Math.random() < .3) { ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; const x = Math.random()*W; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x + R(-3,3), H); ctx.stroke(); } },
    };
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (document.hidden) { last = now; return; }
      const dt = Math.min(.05, (now - last)/1000); last = now;
      draw[mode](dt, now);
    }
    return {
      set(m, opacity, mult, col) {
        cancelAnimationFrame(raf); raf = 0; mode = null; ctx.clearRect(0,0,W,H); X = {mult: mult || 1, col};
        cv.style.opacity = opacity ?? 1;
        if (!m || RM || !draw[m]) return;
        mode = m; size(); setup[m](); last = performance.now(); raf = requestAnimationFrame(loop);
      },
    };
  })();

  /* ---------- applicazione del tema ---------- */
  let cur = null, cycleTimer = 0;
  const hsl = (h, s, l) => { s /= 100; l /= 100; const k = n => (n + h/30) % 12, a = s*Math.min(l, 1-l), f = n => l - a*Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n), 1)));
    return [Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255)]; };
  function startCycle(on) {
    clearInterval(cycleTimer); if (!on || RM) return;
    cycleTimer = setInterval(() => {
      const h = (performance.now()/28) % 360, a = hsl(h, 95, 62), b = hsl((h + 70) % 360, 95, 62), c = hsl((h + 140) % 360, 95, 60), s = root.style;
      s.setProperty('--gold', `rgb(${a})`); s.setProperty('--gold-rgb', a.join(',')); s.setProperty('--red', `rgb(${b})`); s.setProperty('--red-rgb', b.join(','));
      s.setProperty('--a1', `rgb(${a})`); s.setProperty('--a2', `rgb(${b})`); s.setProperty('--a3', `rgb(${c})`);
    }, 90);
  }
  function apply(t) {
    cur = t; window.THEME = t;
    for (const k in t.vars) root.style.setProperty(k, t.vars[k]);
    root.dataset.theme = t.id;
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', t.vars['--bg']);
    setRain(t.rain); FX.set(t.fx, t.fxOpacity, t.fxMult, t.fxColor); startCycle(t.cycle);
    chip.querySelector('.te').textContent = t.emoji; chip.querySelector('.tn').textContent = t.name;
  }

  /* annuncio spettacolare a ogni cambio: un cerchio colorato si espande, appare il nome, poi si dissolve sul nuovo tema */
  function splash(t, done) {
    const v = t.vars, el = document.createElement('div'); el.id = 'tsplash';
    el.style.background = `radial-gradient(circle at 50% 45%, ${v['--a1']}, ${v['--bg']} 78%)`; el.style.color = v['--ink']; el.style.fontFamily = v['--font'];
    el.innerHTML = `<div><div class="te">${t.emoji}</div><div class="tn">${t.name}</div><div class="ts">${t.sub || ''}</div></div>`;
    document.body.appendChild(el); navigator.vibrate && navigator.vibrate([30, 40, 30]); window.sfx && sfx.whoosh();
    el.animate([{clipPath:'circle(0% at 50% 50%)'}, {clipPath:'circle(78% at 50% 50%)'}], {duration:560, easing:'cubic-bezier(.7,0,.2,1)', fill:'forwards'}).onfinish = () => {
      done();
      setTimeout(() => el.animate([{opacity:1}, {opacity:0}], {duration:650, fill:'forwards'}).onfinish = () => el.remove(), 1000);
    };
  }

  /* ---------- sincronizzazione col server ---------- */
  let seq = -1, left = 60, total = 60, skipAfter = 15, sync = Date.now();
  const gameOpen = () => { const g = document.getElementById('game'); return g && !g.classList.contains('hidden'); };
  async function poll() {
    try {
      const r = await (await fetch('/api/theme', {cache:'no-store'})).json();
      sync = Date.now(); left = r.left; total = r.total; skipAfter = r.skip_after ?? 15; chip.classList.toggle('off', r.enabled === false);
      if (r.seq !== seq) {
        const t = THEMES.find(x => x.id === r.id) || THEMES[0], first = seq === -1; seq = r.seq;
        (first || RM || document.hidden || gameOpen()) ? apply(t) : splash(t, () => apply(t));
      }
    } catch {}
  }
  setInterval(poll, 2000); poll();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) poll(); });
  setInterval(() => {
    const rem = Math.max(0, left - (Date.now() - sync)/1000), m = Math.floor(rem/60), s = Math.floor(rem%60);
    chip.querySelector('.tt').textContent = `${m}:${String(s).padStart(2,'0')}`;
    chip.querySelector('i').style.transform = `scaleX(${Math.min(1, rem/total)})`;
    chip.classList.toggle('canskip', !chip.classList.contains('off') && total - rem >= skipAfter);
  }, 250);

  /* dalla dashboard (solo dal PC del server) un clic sul riquadro passa subito al tema successivo */
  if (location.pathname === '/dashboard') {
    chip.classList.add('btn'); chip.title = 'Clic: cambia tema ora';
    chip.addEventListener('click', e => { if (!e.target.closest('.sm')) fetch('/api/theme/next', {method:'POST'}).then(poll); });
  }
  window.PIZZA_THEMES = THEMES;
})();
