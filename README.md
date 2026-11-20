# Red Light, Green Light

A phone-first mixer bingo game for Yale grad students.

- **New players** fill out a short questionnaire (name, phone, program, relationship status, who they want to meet).
- **Returning players** type their phone number to get their card and marks back.
- Each player gets a 5x5 card with a **RedLight GreenLight** free space in the middle.
- To check off a square, the player enters the **name** of the person they did it with, plus **either a phone number or a social handle**.
- A **My list** tab on the corner of the card holds everyone they collected.
- Squares are generated from the questionnaire — status, program, and who they're here to meet.

## Files

| File | What's in it |
|---|---|
| `index.html` | All four screens: welcome, returning, questionnaire, board |
| `styles.css` | Phone-first styling; the light colors live in `:root` |
| `data.js` | **Edit this to change the squares** — programs, statuses, and the prompt pools |
| `app.js` | Flow, validation, storage, card generation, partner capture, directory, bingo detection |

## Editing the squares

Open `data.js`. Prompt pools:

- `POOL_UNIVERSAL` - the "everyone" squares, any player can draw these
- `POOL_BY_LIGHT.greenwhite` - for Single / Open and Going with the flow
- `POOL_BY_LIGHT.red` - for Taken
- `POOL_BY_LIGHT.yellow` - for It's...complicated
- `CENTER_GREENWHITE` - the centre square for green/white players
- `LIGHT_SQUARES_PER_CARD` - how many of a player's own light squares go on a card (the rest come from `POOL_UNIVERSAL`)

In any prompt, `{GW}` becomes "green/white light" - or "green/white guy" / "green/white girl"
for green/white players who said who they are looking to meet. Leave `{GW}` in place when editing.

The centre square is always free. Green/white players see the date challenge there and can tap it
to log who they set the date with; red and yellow players see the plain RedLight GreenLight space.

Square text shrinks automatically to fit its tile, so longer prompts are fine.

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
