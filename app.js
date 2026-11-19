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
  clearCurrent()  { try { localStorage.removeItem(this.CUR); } catch (e) {} }
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
const draft = { name: '', phone: '', program: '', status: '', gender: '', seeking: '' };
let step = 0;
const LAST_STEP = 3;

renderChoices($('#q-program'), PROGRAMS, id => { draft.program = id; });
renderChoices($('#q-status'),  STATUSES, id => {
  draft.status = id;
  const s = STATUSES.find(x => x.id === id);
  document.documentElement.style.setProperty('--accent', s.color);
});
renderChoices($('#q-gender'),  GENDERS, id => { draft.gender = id; });
renderChoices($('#q-seeking'), SEEKING, id => { draft.seeking = id; });

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
  if (step === 3) {
    if (!draft.gender)  return 'Pick one for "I am…".';
    if (!draft.seeking) return 'Pick who you want to meet.';
  }
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
    gender: draft.gender,
    seeking: draft.seeking,
    createdAt: existing ? existing.createdAt : Date.now(),
    card: null,
    marks: []
  };
  player.card  = buildCard(player);
  player.marks = existing && existing.card ? [] : [];
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
    $('#return-error').textContent = 'No card found for that number on this phone. Tap "I’m new" to make one.';
    haptic(30); return;
  }
  Store.setCurrent(phone);
  openBoard(player);
});

$('#return-phone').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); $('#btn-recover').click(); }
});

/* ------------------- card generation -------------------- */
function targetWords(seeking) {
  if (seeking === 'men')   return { one: 'a guy',     many: 'guys' };
  if (seeking === 'women') return { one: 'a girl',    many: 'girls' };
  return { one: 'someone', many: 'people' };
}

function fill(text, player) {
  const t = targetWords(player.seeking);
  const out = text.replace(/\{TARGET\}/g, t.one).replace(/\{TARGETS\}/g, t.many);
  return out.charAt(0).toUpperCase() + out.slice(1);
}

function buildCard(player) {
  const rnd = rngFrom(seedFrom(player.phone + '|' + player.status + '|' + player.program));
  const statusDef = STATUSES.find(s => s.id === player.status);

  /* flirty squares only for single / going-with-the-flow,
     and only if they're not here purely for friends          */
  const wantsFlirt = statusDef.flirty && player.seeking !== 'friends';

  const cross = PROGRAMS
    .filter(p => p.id !== player.program)
    .map(p => CROSS_TEMPLATE.replace('{PROGRAM}', p.label));

  const statusPool  = (POOL_BY_STATUS[player.status] || []).slice();
  const programPool = (POOL_BY_PROGRAM[player.program] || []).slice();

  const picked = [];
  const seen = new Set();
  const take = (pool, n) => {
    shuffle(pool, rnd).forEach(line => {
      if (picked.length >= 24 || n <= 0) return;
      const t = fill(line, player);
      if (seen.has(t)) return;
      seen.add(t); picked.push(t); n--;
    });
  };

  take(statusPool, wantsFlirt ? 8 : 6);
  take(cross, 5);
  take(programPool, 2);
  take(POOL_UNIVERSAL, 24);           // fill the rest
  take(cross, 24);                    // last-resort top-up

  while (picked.length < 24) picked.push('Free-for-all: meet anyone new');

  const squares = shuffle(picked.slice(0, 24), rnd);
  squares.splice(12, 0, '__FREE__');
  return squares;
}

/* ----------------------- board -------------------------- */
let current = null;

function openBoard(player) {
  current = player;

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
      cell.disabled = true;
      const lights = document.createElement('span');
      lights.className = 'lights';
      lights.innerHTML = '<i></i><i></i><i></i>';
      const label = document.createElement('span');
      label.textContent = 'RedLight GreenLight';
      cell.appendChild(lights);
      cell.appendChild(label);
    } else {
      cell.textContent = text;
      cell.setAttribute('aria-pressed', player.marks.includes(i) ? 'true' : 'false');
      cell.addEventListener('click', () => toggle(i, cell));
    }
    grid.appendChild(cell);
  });

  updateFooter();
  show('screen-board');
}

function toggle(i, cell) {
  const on = cell.getAttribute('aria-pressed') === 'true';
  cell.setAttribute('aria-pressed', on ? 'false' : 'true');
  if (on) current.marks = current.marks.filter(x => x !== i);
  else current.marks.push(i);
  haptic(on ? 5 : 12);
  Store.save(current);
  updateFooter();
}

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
  Store.save(current);
  $('#sheet').hidden = true;
  openBoard(current);
});

$('#btn-logout').addEventListener('click', () => {
  Store.clearCurrent();
  current = null;
  $('#sheet').hidden = true;
  show('screen-welcome');
});

/* ------------------- resume on load --------------------- */
(function boot() {
  const phone = Store.getCurrent();
  if (!phone) return;
  const player = Store.get(phone);
  if (player && player.card) openBoard(player);
})();
