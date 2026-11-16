# Tardi Coffee — website (GitHub Pages)

Static site, no build step. Everything is plain HTML/CSS/JS with self-hosted fonts.

```
index.html          ← homepage: hero animation, pre-batch, cafe, coffee, events, contact
animation.html      ← full-screen logo animation (for screens, socials, recording)
assets/css/site.css ← site styles + space mode
assets/css/anim.css ← logo animation (pure CSS, loops: 6s brew / 30s scenes)
assets/js/main.js   ← flavour picker, space mode, event enquiry → email
assets/logo/        ← logo split into layers (porta, worm, cup, rays, saturn, moon…)
assets/img/         ← labels, menu cards, favicon, social share image
```

## Publish
1. Create a repo (e.g. `tardi-coffee`) and upload the contents of this folder to the root.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)`.
3. Custom domain `tardicoffee.com.au`: add it under Settings → Pages → Custom domain (GitHub commits a
   `CNAME` file), then at your DNS host add four A records for `@` → 185.199.108.153 / .109.153 / .110.153 / .111.153
   and a CNAME `www` → `<your-github-username>.github.io`. Tick "Enforce HTTPS" once the certificate appears.

## Before going live — search for `tbc`
Yellow-highlighted placeholders (class `tbc`) mark everything that needs a real value:
bottle price, serves per bottle, stockists/delivery, cafe menu prices, rebrand date, Instagram handle.
Set the enquiry email and form endpoint at the top of `assets/js/main.js`
(`CONTACT_EMAIL`, `FORM_ENDPOINT`, and `FORM_ACCESS_KEY` if you use Web3Forms).
Flavour names, prices and notes are in the `FLAVOURS` list in the same file.

## Animation URL options
`animation.html` (logo + wherever/whenever scenes) · `animation.html?noscenes` (logo only).
Visitors with "reduce motion" turned on get a still version.
