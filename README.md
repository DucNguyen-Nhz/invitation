# invitation

A vintage, wax-sealed letter that opens into a dinner invitation.

## Edit

All names, date, time, place and map link live in the `CONFIG` block at the top of `script.js`.
Calendar times (`startUtc` / `endUtc`) are in UTC — Saigon is UTC+7.

## Saved progress

Progress is kept in the visitor's browser (`localStorage`): once the letter is opened, a reload skips the
envelope; once she says yes, a reload shows the "yes" card. Add `?reset` to the URL to start over.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish (GitHub Pages)

Push to `main`, then in the repo: **Settings → Pages → Deploy from a branch → `main` / root**.
The page will be live at `https://<username>.github.io/invitation/`.
