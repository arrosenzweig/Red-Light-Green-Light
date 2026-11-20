/* ==========================================================
   Red Light, Green Light — app logic
   ========================================================== */

/* ----------------------- storage ------------------------ */
/* Single place that touches persistence. Swap the three
   methods for fetch() calls when a real backend exists.      */
const Store = {
  KEY: 'rlgl:players:v1',
  CUR: 'rlgl:current:v1',

  _all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch (e) { return {}; }
  },
  _write(all) {
    try { localStorage.setItem(this.KEY, JSON.stringify(all)); } catch (e) {}
  },

  get(phone)      { return this._all()[phone] || null; },
  save(player)    { const a = this._all(); a[player.phone] = player; this._write(a); },
  setCurrent(p)   { try { localStorage.setItem(this.CUR, p); } catch (e) {} },
  getCurrent()    { try { return localStorage.getItem(this.CUR); } catch (e) { return null; } },
  clearCurrent()  { try { localStorage.removeItem(this.CUR); } catch (e) {} },

  /* If this phone's data belongs to an older game, delete all of it. */
  GAME: 'rlgl:game',
  startGame(gameId) {
    try {
      if (localStorage.getItem(this.GAME) === gameId) return;
      Object.keys(localStorage)
        .filter(k => k.indexOf('rlgl:') === 0)
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem(this.GAME, gameId);
    } catch (e) {}
  }
};

/* ----------------------- helpers ------------------------ */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

function digits(s) { return (s || '').replace(/\D/g, ''); }

function normalizePhone(s) {
  let d = digits(s);
  if (d.length === 11 && d[0] === '1') d = d.slice(1);
  return d;
}

function formatPhone(s) {
  const d = digits(s).slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
  return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
}

function validPhone(s) { return normalizePhone(s).length === 10; }

/* Deterministic RNG so the same phone always rebuilds the same card. */
function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rngFrom(seed) {
  let s = seed || 1;
  return function () {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}
function shuffle(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function haptic(ms) { if (navigator.vibrate) navigator.vibrate(ms || 8); }

/* ----------------------- screens ------------------------ */
function show(id) {
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
}

$$('[data-go]').forEach(b => b.addEventListener('click', () => {
  $('#quiz-error').textContent = '';
  $('#return-error').textContent = '';
  if (b.dataset.go === 'screen-new') resetQuiz();   // every new player starts blank
  show(b.dataset.go);
}));

/* ------------------ phone input masking ----------------- */
['#q-phone', '#return-phone'].forEach(sel => {
  const el = $(sel);
  el.addEventListener('input', () => { el.value = formatPhone(el.value); });
});

/* ------------------- build choice lists ----------------- */
function renderChoices(container, options, onPick) {
  container.innerHTML = '';
  options.forEach(opt => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice';
    b.setAttribute('aria-pressed', 'false');
    b.dataset.id = opt.id;
    if (opt.color) b.style.setProperty('--c', opt.color);

    const bullet = document.createElement('span');
    bullet.className = 'bullet';

    const text = document.createElement('span');
    text.className = 'ctext';
    text.textContent = opt.label;
    if (opt.note) {
      const small = document.createElement('small');
      small.textContent = opt.note;
      text.appendChild(small);
    }

    b.appendChild(bullet);
    b.appendChild(text);
    b.addEventListener('click', () => {
      $$('.choice', container).forEach(c => c.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      haptic();
      onPick(opt.id);
    });
    container.appendChild(b);
  });
}

/* --------------------- quiz state ----------------------- */
const draft = { name: '', phone: '', program: '', status: '' };
let step = 0;
const LAST_STEP = 2;

renderChoices($('#q-program'), PROGRAMS, id => { draft.program = id; });
renderChoices($('#q-status'),  STATUSES, id => {
  draft.status = id;
  const s = STATUSES.find(x => x.id === id);
  document.documentElement.style.setProperty('--accent', s.color);
});

/* Wipe every answer so a shared phone never carries the last
   person's name, number, or picks into the next questionnaire. */
function resetQuiz() {
  draft.name = draft.phone = draft.program = draft.status = '';
  step = 0;
  $('#q-name').value = '';
  $('#q-phone').value = '';
  $$('#quiz .choice').forEach(c => c.setAttribute('aria-pressed', 'false'));
  document.documentElement.style.removeProperty('--accent');
  paintStep();
}

function paintStep() {
  $$('.step').forEach(s => s.classList.toggle('active', +s.dataset.step === step));
  $('#progress-bar').style.width = ((step + 1) / (LAST_STEP + 1) * 100) + '%';
  $('#btn-prev').style.visibility = step === 0 ? 'hidden' : 'visible';
  $('#btn-next').textContent = step === LAST_STEP ? 'Get my card' : 'Next';
  $('#quiz-error').textContent = '';
}

function validateStep() {
  if (step === 0) {
    draft.name  = $('#q-name').value.trim();
    draft.phone = $('#q-phone').value;
    if (draft.name.length < 2) return 'Give us a name to put on the card.';
    if (!validPhone(draft.phone)) return 'That phone number needs 10 digits.';
    return '';
  }
  if (step === 1 && !draft.program) return 'Pick a program to continue.';
  if (step === 2 && !draft.status)  return 'Pick one — it changes your squares.';
  return '';
}

$('#btn-prev').addEventListener('click', () => {
  if (step > 0) { step--; paintStep(); }
});

$('#btn-next').addEventListener('click', () => {
  const err = validateStep();
  if (err) { $('#quiz-error').textContent = err; haptic(30); return; }
  if (step < LAST_STEP) { step++; paintStep(); return; }

  const phone = normalizePhone(draft.phone);
  const existing = Store.get(phone);
  const player = {
    phone,
    name: draft.name,
    program: draft.program,
    status: draft.status,
    createdAt: existing ? existing.createdAt : Date.now(),
    card: null,
    marks: [],
    contacts: {}
  };
  player.card  = buildCard(player);
  player.cardVersion = CARD_VERSION;
  Store.save(player);
  Store.setCurrent(phone);
  openBoard(player);
});

paintStep();

/* --------------------- returning ------------------------ */
$('#btn-recover').addEventListener('click', () => {
  const phone = normalizePhone($('#return-phone').value);
  if (!validPhone(phone)) {
    $('#return-error').textContent = 'That phone number needs 10 digits.';
    haptic(30); return;
  }
  const player = Store.get(phone);
  if (!player) {
    $('#return-error').textContent = 'No card found for that number on this phone. Tap "Starting the Game instead" below to make one.';
    haptic(30); return;
  }
  Store.setCurrent(phone);
  openBoard(player);
});

$('#return-phone').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); $('#btn-recover').click(); }
});

/* ------------------- card generation -------------------- */
function fill(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function groupOf(player) {
  const s = STATUSES.find(x => x.id === player.status);
  return s ? s.group : '';
}

function buildCard(player) {
  /* version in the seed so each reset reshuffles, even with the same squares */
  const rnd = rngFrom(seedFrom(player.phone + '|' + player.status + '|v' + CARD_VERSION));
  const groupPool = (POOL_BY_GROUP[groupOf(player)] || []).slice();

  const picked = [];
  const seen = new Set();
  const take = (pool, n) => {
    shuffle(pool, rnd).forEach(line => {
      if (picked.length >= 24 || n <= 0) return;
      const txt = fill(line);
      if (seen.has(txt)) return;
      seen.add(txt); picked.push(txt); n--;
    });
  };

  take(groupPool, GROUP_SQUARES_PER_CARD);   // their own group's squares
  take(POOL_UNIVERSAL, 24);                  // fill up with the everyone pool
  take(groupPool, 24);                       // top up if the pools ran short

  while (picked.length < 24) picked.push('Meet someone new and get their name');

  const squares = shuffle(picked.slice(0, 24), rnd);
  squares.splice(12, 0, '__FREE__');
  return squares;
}

/* The centre square's wording: single players get the date
   challenge, everyone else gets the plain free space.            */
function centerText(player) {
  return isSingle(player) ? fill(CENTER_SINGLE) : 'RedLight GreenLight';
}

/* ----------------------- board -------------------------- */
let current = null;

function openBoard(player) {
  current = player;
  if (!player.contacts) player.contacts = {};

  /* Card made before the last reset: deal a fresh one. */
  if (player.cardVersion !== CARD_VERSION) {
    player.card = buildCard(player);
    player.marks = [];
    player.contacts = {};
    player.cardVersion = CARD_VERSION;
    Store.save(player);
  }

  const statusDef  = STATUSES.find(s => s.id === player.status);
  const programDef = PROGRAMS.find(p => p.id === player.program);
  document.documentElement.style.setProperty('--accent', statusDef.color);

  $('#board-hello').textContent = 'Hi, ' + player.name.split(' ')[0];
  $('#board-meta').innerHTML =
    (programDef ? programDef.label : '') +
    ' · <span class="status-chip">' + statusDef.label + '</span>';

  const grid = $('#bingo');
  grid.innerHTML = '';
  player.card.forEach((text, i) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'sq';
    cell.dataset.i = i;

    if (text === '__FREE__') {
      cell.classList.add('free');
      cell.setAttribute('aria-pressed', 'true');
      const lights = document.createElement('span');
      lights.className = 'lights';
      lights.innerHTML = '<i></i><i></i><i></i>';
      const label = document.createElement('span');
      label.textContent = centerText(player);
      cell.appendChild(lights);
      cell.appendChild(label);
      /* free either way, but single players can log the date */
      if (isSingle(player)) {
        cell.classList.add('free-task');
        cell.addEventListener('click', () => {
          haptic();
          if (player.contacts[12]) openUndo(12); else openCapture(12);
        });
      } else {
        cell.disabled = true;
      }
    } else {
      cell.textContent = text;
      cell.setAttribute('aria-pressed', player.marks.includes(i) ? 'true' : 'false');
      cell.addEventListener('click', () => onSquareTap(i, cell));
    }
    grid.appendChild(cell);
  });

  updateFooter();
  show('screen-board');
  fitAllSquares();
}

/* ---- shrink a square's text until it fits its tile ---- */
function fitSquare(cell) {
  cell.style.fontSize = '';
  let size = parseFloat(getComputedStyle(cell).fontSize);
  let guard = 0;
  const overflows = () =>
    cell.scrollHeight > cell.clientHeight + 1 ||   // too many lines
    cell.scrollWidth  > cell.clientWidth  + 1;     // one word too wide
  while (overflows() && size > 5.5 && guard < 30) {
    size -= 0.5;
    cell.style.fontSize = size + 'px';
    guard++;
  }
}

function fitAllSquares() {
  const run = () => $$('.sq').forEach(fitSquare);
  run();                                   // now, so nothing ever paints clipped
  setTimeout(run, 80);                     // again once layout has settled
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
}

/* re-fit when someone switches back to the tab */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && current) fitAllSquares();
});

let fitTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(fitTimer);
  fitTimer = setTimeout(fitAllSquares, 120);
});

let pendingSquare = null;

function isSingle(player) {
  return groupOf(player) === 'single';
}

function squareText(i) {
  return i === 12 ? centerText(current) : current.card[i];
}

function cellAt(i) { return $('.sq[data-i="' + i + '"]'); }

function onSquareTap(i, cell) {
  haptic();
  if (cell.getAttribute('aria-pressed') === 'true') openUndo(i);
  else openCapture(i);
}

/* ---- capture: name + number or social ---- */
function openCapture(i) {
  pendingSquare = i;
  $('#cap-task').textContent = squareText(i);
  $('#cap-name').value = '';
  $('#cap-phone').value = '';
  $('#cap-social').value = '';
  $('#cap-error').textContent = '';
  $('#capture').hidden = false;
  setTimeout(() => $('#cap-name').focus(), 60);
}

function closeCapture() { $('#capture').hidden = true; pendingSquare = null; }

$('#cap-phone').addEventListener('input', e => { e.target.value = formatPhone(e.target.value); });
$('#cap-cancel').addEventListener('click', closeCapture);
$('#capture').addEventListener('click', e => { if (e.target.id === 'capture') closeCapture(); });

$('#cap-save').addEventListener('click', () => {
  const name   = $('#cap-name').value.trim();
  const phone  = $('#cap-phone').value.trim();
  const social = $('#cap-social').value.trim();

  if (name.length < 2) {
    $('#cap-error').textContent = 'Add their name first.'; haptic(30); return;
  }
  if (!phone && !social) {
    $('#cap-error').textContent = 'Add a number or a social handle.'; haptic(30); return;
  }
  if (phone && !validPhone(phone)) {
    $('#cap-error').textContent = 'That number needs 10 digits — or leave it blank and use a handle.';
    haptic(30); return;
  }

  const i = pendingSquare;
  current.contacts[i] = {
    name: name,
    phone: phone ? normalizePhone(phone) : '',
    social: social,
    task: squareText(i),
    at: Date.now()
  };
  if (i !== 12 && !current.marks.includes(i)) current.marks.push(i);

  const cell = cellAt(i);
  if (cell) cell.setAttribute('aria-pressed', 'true');
  Store.save(current);
  updateFooter();
  closeCapture();
  haptic(14);
});

/* ---- tapping a square that's already checked off ---- */
function openUndo(i) {
  pendingSquare = i;
  const c = current.contacts[i];
  $('#undo-task').textContent = squareText(i);
  $('#undo-who').textContent = c ? c.name : 'Already checked off';
  $('#undo-contact').textContent = c ? contactLine(c) : '';
  $('#undo').hidden = false;
}

function closeUndo() { $('#undo').hidden = true; pendingSquare = null; }
$('#undo-cancel').addEventListener('click', closeUndo);
$('#undo').addEventListener('click', e => { if (e.target.id === 'undo') closeUndo(); });
$('#undo-clear').addEventListener('click', () => {
  const i = pendingSquare;
  current.marks = current.marks.filter(x => x !== i);
  delete current.contacts[i];
  const cell = cellAt(i);
  if (cell && i !== 12) cell.setAttribute('aria-pressed', 'false');
  Store.save(current);
  updateFooter();
  closeUndo();
});

/* ---- the directory ---- */
function contactLine(c) {
  if (c.phone && c.social) return formatPhone(c.phone) + ' · ' + c.social;
  if (c.phone) return formatPhone(c.phone);
  return c.social;
}

function openDirectory() {
  const list = $('#dir-list');
  list.innerHTML = '';
  const entries = Object.keys(current.contacts)
    .map(k => current.contacts[k])
    .sort((a, b) => a.at - b.at);

  if (!entries.length) {
    const p = document.createElement('p');
    p.className = 'dir-empty';
    p.textContent = 'Nobody yet. Tap a square to check it off and the person goes here.';
    list.appendChild(p);
  }

  entries.forEach(c => {
    const row = document.createElement('div');
    row.className = 'dir-row';

    const name = document.createElement('p');
    name.className = 'dir-name';
    name.textContent = c.name;
    row.appendChild(name);

    if (c.phone) {
      const a = document.createElement('a');
      a.className = 'dir-contact';
      a.href = 'tel:' + c.phone;
      a.textContent = formatPhone(c.phone);
      row.appendChild(a);
    }
    if (c.social) {
      const s = document.createElement('span');
      s.className = 'dir-contact';
      s.textContent = c.social;
      row.appendChild(s);
    }

    const task = document.createElement('p');
    task.className = 'dir-task';
    task.textContent = c.task;
    row.appendChild(task);

    list.appendChild(row);
  });

  $('#directory').hidden = false;
}

$('#btn-directory').addEventListener('click', openDirectory);
$('#dir-close').addEventListener('click', () => { $('#directory').hidden = true; });
$('#directory').addEventListener('click', e => { if (e.target.id === 'directory') $('#directory').hidden = true; });

function marked(i) { return i === 12 || current.marks.includes(i); }

function countBingos() {
  const lines = [];
  for (let r = 0; r < 5; r++) lines.push([0,1,2,3,4].map(c => r * 5 + c));
  for (let c = 0; c < 5; c++) lines.push([0,1,2,3,4].map(r => r * 5 + c));
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
  return lines.filter(l => l.every(marked)).length;
}

function updateFooter() {
  $('#marked-count').textContent = current.marks.length;
  $('#dir-count').textContent = Object.keys(current.contacts || {}).length;
  const n = countBingos();
  $('#bingo-flag').textContent =
    current.marks.length === 24 ? 'BLACKOUT 🏆' :
    n > 1 ? n + ' BINGOS!' :
    n === 1 ? 'BINGO! 🎉' : '';
}

/* ----------------------- menu --------------------------- */
$('#btn-menu').addEventListener('click', () => { $('#sheet').hidden = false; });
$('#btn-close-sheet').addEventListener('click', () => { $('#sheet').hidden = true; });
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') $('#sheet').hidden = true; });

$('#btn-reset').addEventListener('click', () => {
  current.marks = [];
  current.contacts = {};
  Store.save(current);
  $('#sheet').hidden = true;
  openBoard(current);
});

$('#btn-logout').addEventListener('click', () => {
  Store.clearCurrent();
  current = null;
  $('#return-phone').value = '';
  resetQuiz();
  $('#sheet').hidden = true;
  show('screen-welcome');
});

/* ------------------- resume on load --------------------- */
(function boot() {
  Store.startGame(GAME_ID);            // wipes this phone if the game was reset
  const phone = Store.getCurrent();
  if (!phone) return;
  const player = Store.get(phone);
  if (player && player.card) openBoard(player);
})();
