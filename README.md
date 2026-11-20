# Red Light, Green Light

A phone-first mixer bingo game for Yale grad students.

- **New players** fill out a short questionnaire (name, phone, program, relationship status).
- **Returning players** type their phone number to get their card and marks back.
- Each player gets a 5x5 card with a **RedLight GreenLight** free space in the middle.
- To check off a square, the player enters the **name** of the person they did it with, plus **either a phone number or a social handle**.
- A **My list** tab on the corner of the card holds everyone they collected.
- Squares are generated from the player's relationship status.

## Files

| File | What's in it |
|---|---|
| `index.html` | All four screens: welcome, returning, questionnaire, board |
| `styles.css` | Phone-first styling; the status colors live in `:root` |
| `data.js` | **Edit this to change the squares** — programs, statuses, and the prompt pools |
| `app.js` | Flow, validation, storage, card generation, partner capture, directory, bingo detection |

## Editing the squares

Open `data.js`. Prompt pools:

- `POOL_UNIVERSAL` - the "everyone" squares, any player can draw these
- `POOL_BY_GROUP.single` - for Single / Open and Going with the flow
- `POOL_BY_GROUP.taken` - for Taken
- `POOL_BY_GROUP.complicated` - for It's...complicated
- `CENTER_SINGLE` - the centre square for single players
- `GROUP_SQUARES_PER_CARD` - how many of a player's own group squares go on a card (the rest come from `POOL_UNIVERSAL`)

House style for squares: about 5 words or fewer, and refer to people only as "single" or "taken"
(no colors, no "light", no gender).

The centre square is always free. Single players see the date challenge there and can tap it
to log who they set the date with; everyone else sees the plain RedLight GreenLight space.

Square text shrinks automatically if a square is still too long for its tile.

## Storage

Player data lives in the browser's `localStorage`, behind the `Store` object at the top of
`app.js`. That covers the main case (someone closes the tab and comes back on the same phone).
It does **not** sync across devices. To add a real backend, swap the three methods in `Store`
for `fetch()` calls — nothing else in the app touches storage.

## Running locally

```
python -m http.server 4173
```

Then open http://localhost:4173

## Resetting everyone's cards

Bump `CARD_VERSION` in `data.js` and push to both `main` and `gh-pages`. The next time each
player opens the site (or recovers by phone number), they get a fresh card from the current
squares. Marks and My list are cleared; name, phone, program and status are kept.
