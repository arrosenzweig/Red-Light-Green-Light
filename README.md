# Red Light, Green Light

A phone-first mixer bingo game for Yale grad students.

- **New players** fill out a short questionnaire (name, phone, program, relationship status, who they want to meet).
- **Returning players** type their phone number to get their card and marks back.
- Each player gets a 5x5 card with a **RedLight GreenLight** free space in the middle.
- Squares are generated from the questionnaire — status, program, and who they're here to meet.

## Files

| File | What's in it |
|---|---|
| `index.html` | All four screens: welcome, returning, questionnaire, board |
| `styles.css` | Phone-first styling; the light colors live in `:root` |
| `data.js` | **Edit this to change the squares** — programs, statuses, and the prompt pools |
| `app.js` | Flow, validation, storage, card generation, bingo detection |

## Editing the squares

Open `data.js`. Prompt pools:

- `POOL_UNIVERSAL` — everyone can get these
- `POOL_BY_STATUS` — keyed by `single`, `taken`, `complicated`, `flow`
- `POOL_BY_PROGRAM` — keyed by program id
- `CROSS_TEMPLATE` — "meet someone from <other program>"

In any prompt, `{TARGET}` becomes "a guy" / "a girl" / "someone" based on who the player said
they want to meet. Flirty squares only go out to **Single / Open** and **Going with the flow**
players who didn't pick "just here for friends".

Keep square text short — roughly 5 words reads best on a phone.

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
