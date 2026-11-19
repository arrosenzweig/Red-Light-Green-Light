/* ============================================================
   Red Light, Green Light — questionnaire options + square pools
   This is the file to edit when you want to tune the squares.
   ============================================================ */

/* ---- Q2: programs (alphabetical, "Other" pinned last) ---- */
const PROGRAMS = [
  { id: 'business',    label: 'Business' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'environment', label: 'Environment' },
  { id: 'law',         label: 'Law' },
  { id: 'medicine',    label: 'Medicine' },
  { id: 'nursing',     label: 'Nursing / Public Health' },
  { id: 'phd',         label: 'PhD' },
  { id: 'policy',      label: 'Public Policy' },
  { id: 'other',       label: 'Other', note: 'Architecture / Art / Drama / Music / Divinity' }
];

/* ---- Q3: relationship status (drives the whole card's color) ---- */
const STATUSES = [
  { id: 'single',   label: 'Single / Open',        color: '#3ddc84', flirty: true  },
  { id: 'taken',    label: 'Taken',                color: '#ff4d5e', flirty: false },
  { id: 'complicated', label: "It's… complicated", color: '#ffd23f', flirty: false },
  { id: 'flow',     label: 'Going with the flow',  color: '#f4f4f7', flirty: true  }
];

/* ---- Q4: so flirty squares point the right direction ---- */
const GENDERS = [
  { id: 'woman',     label: 'A woman' },
  { id: 'man',       label: 'A man' },
  { id: 'nonbinary', label: 'Nonbinary' },
  { id: 'private',   label: 'Rather not say' }
];

const SEEKING = [
  { id: 'men',     label: 'Men' },
  { id: 'women',   label: 'Women' },
  { id: 'everyone',label: 'Everyone' },
  { id: 'friends', label: 'Just here for friends' }
];

/* ============================================================
   SQUARE POOLS
   {TARGET}  -> "a guy" / "a girl" / "someone", based on who they
                said they want to meet.
   {TARGETS} -> plural form.
   ============================================================ */

/* Everybody gets some of these. */
const POOL_UNIVERSAL = [
  'Meet 3 people from 3 schools',
  'Born the same month as you',
  'Trade numbers with someone new',
  'Grew up in your home state',
  'Speaks a language you don’t',
  'Find 2 people who already knew each other',
  'Meet someone wearing green',
  'Meet someone wearing red',
  'Been to the Peabody Museum',
  'Photo with someone you just met',
  'Same first initial as you',
  'Has lived abroad',
  'Same coffee order as you',
  'Ran a half marathon',
  'Also came here alone',
  'Meet a first-year',
  'Meet someone in their final year',
  'Can name 3 of your buildings'
];

/* Status-flavored squares. */
const POOL_BY_STATUS = {
  single: [
    'Ask {TARGET} their green flag',
    '{TARGET} guesses your program in 1 try',
    'Trade worst first-date stories',
    '{TARGET}’s best pickup line',
    'Get a compliment you didn’t fish for',
    'Tell {TARGET} in green you noticed',
    'Split a drink with {TARGET}',
    '{TARGET} rates your flirting /10'
  ],
  flow: [
    '{TARGET} picks your next drink',
    'Most spontaneous thing {TARGET} did this year',
    '{TARGET} teaches you something in 60s',
    'Say yes to {TARGET}’s next invite',
    'Ask {TARGET}: red, yellow or green?',
    '{TARGET} introduces you to a friend'
  ],
  taken: [
    'Set up two single people',
    'Tell how you met your partner',
    'Find another long-distance couple',
    'Give a great date-night rec',
    'Together longer than you',
    'Be a wingperson for 1 convo'
  ],
  complicated: [
    'Someone else’s status: complicated',
    'Get unsolicited advice',
    'Explain it in one sentence',
    'Has dated within their program',
    'Get 2 people to disagree about it',
    'Advice you refuse to take'
  ]
};

/* Program-flavored squares (light ribbing). */
const POOL_BY_PROGRAM = {
  business:    ['An SOM student who avoids "optionality"', 'Find someone who did consulting'],
  engineering: ['Explains their research in 10s', 'Built something you can hold'],
  environment: ['Can name the tree outside', 'Bikes to campus'],
  law:         ['A law student argues the other side', 'Has read a case for fun'],
  medicine:    ['Awake 24+ hours this month', 'Can take your pulse'],
  nursing:     ['Has worked a night shift', 'Asks about your flu shot'],
  phd:         ['A PhD student says their year', 'Someone in year 6+'],
  policy:      ['Has worked in government', 'Debate one policy'],
  other:       ['Performs on a stage', 'Made art this week']
};

/* Cross-program mixer squares, built from the other programs. */
const CROSS_TEMPLATE = 'Meet someone from {PROGRAM}';
