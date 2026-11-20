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

/* ---- Q3: relationship status (drives the whole card) ----
   lightGroup: which pool of squares this player draws from.     */
const STATUSES = [
  { id: 'single',      label: 'Single / Open',       color: '#3ddc84', lightGroup: 'greenwhite' },
  { id: 'taken',       label: 'Taken',               color: '#ff4d5e', lightGroup: 'red' },
  { id: 'complicated', label: "It's… complicated",   color: '#ffd23f', lightGroup: 'yellow' },
  { id: 'flow',        label: 'Going with the flow', color: '#f4f4f7', lightGroup: 'greenwhite' }
];

/* ---- Q4: so the flirty squares point the right direction ---- */
const GENDERS = [
  { id: 'woman',     label: 'A woman' },
  { id: 'man',       label: 'A man' },
  { id: 'nonbinary', label: 'Nonbinary' },
  { id: 'private',   label: 'Rather not say' }
];

const SEEKING = [
  { id: 'men',      label: 'Men' },
  { id: 'women',    label: 'Women' },
  { id: 'everyone', label: 'Everyone' },
  { id: 'friends',  label: 'Just here for friends' }
];

/* ============================================================
   SQUARE POOLS

   {GW} is replaced with "green/white light" — or with
   "green/white guy" / "green/white girl" for players who said
   who they're looking to meet. Leave {GW} in place when you
   edit so that keeps working.
   ============================================================ */

/* ---- Everyone draws from this ---- */
const POOL_UNIVERSAL = [
  'Find someone born in the same month as you',
  'Find someone who speaks 3+ languages',
  'Take a group selfie with 5+ people you just met',
  'Learn a stranger’s most controversial food opinion',
  'Find someone with a twin',
  'Get someone to teach you a dance move',
  'Find someone procrastinating on something due this week',
  'Find someone from your home state or country',
  'Find someone whose phone battery is under 10%',
  'Find someone who’s been to 15+ countries',
  'Swap “how I ended up at Yale” stories with a stranger',
  'Find someone with a hidden talent, and make them show you',
  'Find someone wearing the same light color as you',
  'Find someone going to the Harvard-Yale Game in Boston',
  'High-five 10 strangers and get their names',
  'Toast with people from 3 different programs'
];

/* ---- By light group ---- */
const POOL_BY_LIGHT = {

  greenwhite: [
    'Get a {GW}’s number',
    'Make a {GW} laugh with your worst pickup line',
    'Ask a {GW} for their worst date story',
    'Dance with a {GW}',
    'Exchange top love languages with a {GW}',
    'Find a {GW} with the same favorite pizza spot',
    'Have a 30-second staring contest with a {GW}',
    'Introduce a {GW} to another green/white friend',
    'Compliment a {GW}’s outfit, and mean it',
    'Take a selfie with a {GW}',
    'Have a {GW} guess what school you’re in',
    'Buy a {GW} a drink (or get them to buy you one)',
    'Let a {GW} pick your next drink',
    'Get a {GW} to guess your program in three tries'
  ],

  red: [
    'Show a stranger a photo of your partner',
    'Tell the story of how you met your person',
    'Wingman a green/white light until they get a number',
    'Introduce two singles or friends to each other',
    'Give a green/white light your best dating advice',
    'Find a couple who met in grad school',
    'Find another red light and compare how long you’ve been together',
    'Send your partner a selfie from tonight'
  ],

  yellow: [
    'Describe your situation to a stranger in exactly three words',
    'Find another yellow light and compare notes',
    'Get a red light’s advice on your situation',
    'Get a green/white light’s advice on your situation',
    'Draft the “what are we” text with a stranger (do not send it)',
    'Find someone who’s been yellow longer than you',
    'Let a stranger decide whether you should go green or red tonight',
    'Find someone who had a “what are we” talk this month',
    'Get a stranger to read your last text from your situationship and give a verdict'
  ]
};

/* ---- The center square ----
   Green/white players get the date challenge. Everyone else
   gets the plain RedLight GreenLight free space.               */
const CENTER_GREENWHITE = 'Set a time to go on a date with a {GW} after this party';

/* How many of the player's own light-group squares go on a card.
   The rest of the 24 is filled from POOL_UNIVERSAL.             */
const LIGHT_SQUARES_PER_CARD = 12;
