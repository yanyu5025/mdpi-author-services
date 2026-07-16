# MDPI Author Services — Prototype

A standalone front-end prototype of the [MDPI Author Services](https://www.mdpi.com/authors/services) portal. No build step or Node.js required.

## Features

- **Service catalog** — Standard, Rapid, and Academic language editing tiers
- **Additional services** — Figure editing, graphical abstracts, layout, video production
- **Live quote calculator** — Instant price breakdown with currency selection
- **IOAP discount demo** — Try `you@ethz.ch` or `you@mdpi.com` for 15% off
- **Responsive layout** — Mobile-friendly MDPI-inspired design

## Run locally

Open `index.html` in a browser, or serve with any static file server:

```bash
# Python
python3 -m http.server 8080

# Then visit http://localhost:8080
```

## Share with your team (GitHub Pages)

This prototype can be hosted for free on GitHub Pages.

### One-time setup

1. **Create a new repository** on GitHub (e.g. `mdpi-author-services`). Do not add a README — this project already has one.

2. **Push this project** (from your machine):

```bash
cd /Users/yanyu/Projects/mdpi-author-services
git remote add origin https://github.com/YOUR-ORG/mdpi-author-services.git
git push -u origin main
```

Replace `YOUR-ORG` with your GitHub username or organization.

3. **Enable GitHub Pages**
   - Open the repo on GitHub → **Settings** → **Pages**
   - Under **Build and deployment**, set **Source** to **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**
   - Click **Save**

4. **Share the live URL** (after 1–2 minutes):

```
https://YOUR-ORG.github.io/mdpi-author-services/
```

Team members can open that link in any browser — no install required.

### Updating the prototype

After you change files locally:

```bash
git add .
git commit -m "Describe your update"
git push
```

GitHub Pages redeploys automatically within a minute or two.

## Project structure

```
index.html          # Homepage & quote form
checkout.html       # Checkout wizard
video-production.html
app.js              # Quote calculator & interactions
checkout.js         # Checkout flow
styles.css          # MDPI-themed styling
ux-enhance.css      # UX polish layer
faq/                # FAQ pages
assets/             # Images & logo
```

## Notes

- Pricing is **illustrative** for demo purposes only
- This is a UI prototype — no backend, payments, or MDPI system integration
- Checkout payment is **simulated** for demonstration

## Demo tips

1. Click **Select Rapid** on a tier card to pre-fill the quote form
2. Enter an institutional email (e.g. `@ethz.ch`) to see the IOAP banner
3. Toggle add-on services to watch the price panel update live
