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
   color: the font color of the option, and the card's accent.
   group: which pool of squares this player draws from.         */
const STATUSES = [
  { id: 'single',      label: 'Single / Open',       color: '#3ddc84', group: 'single' },
  { id: 'taken',       label: 'Taken',               color: '#ff4d5e', group: 'taken' },
  { id: 'complicated', label: "It's… complicated",   color: '#ffd23f', group: 'complicated' },
  { id: 'flow',        label: 'Going with the flow', color: '#f4f4f7', group: 'single' }
];

/* ============================================================
   SQUARE POOLS

   Keep squares to ~5 words or fewer so they read on a phone.
   Refer to people only as "single" or "taken".
   ============================================================ */

/* ---- Everyone draws from this ---- */
const POOL_UNIVERSAL = [
  'Same birth month',
  'Speaks 3+ languages',
  'Group selfie with 5+ new people',
  'Share a spicy story or piece of tea',
  'Has a twin',
  'Learn or teach a dance move',
  'Staying in New Haven for Thanksgiving',
  'From your home state or country',
  'Phone battery under 10%',
  'Been to 15+ countries',
  'Swap “why Yale” stories',
  'See a hidden talent',
  'Wearing the same color',
  'Going to Harvard-Yale',
  'High-five 10 strangers',
  'Toast with 3 programs',
  'Share the last text you sent'
];

/* ---- By status group ----
   single      -> Single / Open and Going with the flow
   taken       -> Taken
   complicated -> It's… complicated                             */
const POOL_BY_GROUP = {

  single: [
    'Pickup line on a single',
    'A single’s worst date story',
    'Dance with a single',
    'Swap love languages with a single',
    'Same favorite pizza spot as a single',
    '30sec staring contest with a single',
    'Introduce two singles',
    'Compliment a single’s outfit',
    'Selfie with a single',
    'A single guesses your school',
    'Buy a single a drink',
    'A single picks your drink'
  ],

  taken: [
    'Show off your partner’s photo',
    'Tell your how-we-met story',
    'Wingman a single',
    'Set up two singles',
    'Dating advice to a single',
    'Find someone who has been together longer than you',
    'Selfie with new friend to your partner'
  ],

  complicated: [
    'Explain your situationship in 3 words',
    'Compare situationships',
    'Advice from someone taken',
    'Advice from a single',
    'Draft a “what are we” text',
    'Find a situationship longer than yours',
    'A stranger judges your last text'
  ]
};

/* ---- The center square ----
   Single players get the date challenge. Everyone else
   gets the plain RedLight GreenLight free space.               */
const CENTER_SINGLE = 'Plan a date with a single';

/* How many of the player's own group squares go on a card.
   The rest of the 24 is filled from POOL_UNIVERSAL.             */
const GROUP_SQUARES_PER_CARD = 12;

/* Single players (Single / Open and Going with the flow): at least
   this share of their 24 squares must come from the Single list.
   0.5 = at least 12 single squares, plus the single centre square.
   The Single list needs at least 24 x this many squares in it
   (12 at 0.5) or the rule can't be met; to go above 50%, add more
   squares to the Single list first.                              */
const SINGLE_MIN_SHARE = 0.5;

/* ---- Reset everyone's cards ----
   Bump this number and push. The next time each player opens the
   site, they get a fresh card from the current squares: marks and
   My list are cleared, but their name, phone, program and status
   are kept, so nobody has to redo the questionnaire.            */
const CARD_VERSION = 2;

/* ---- Start a brand-new game (wipe everyone's data) ----
   Change this and push. The next time any phone opens the site,
   everything saved for the old game is deleted: profile, card,
   marks and My list. Everyone starts over at the welcome screen.
   Use this between events. Use CARD_VERSION above instead if you
   only want new cards and people should keep their profiles.   */
const GAME_ID = 'game-3';
