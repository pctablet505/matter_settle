# Matter Settle — website

This is the source for [mattersettle.com](https://mattersettle.com). It's a
handful of plain HTML/CSS/JS files — no build step, no Node, no framework.
GitHub Pages serves the files exactly as they sit in this repo.

This guide assumes no prior web-dev experience.

---

## ⚠ Launch checklist — do these before the domain goes live

1. **Test the contact route once.** The site's only contact address is
   `settleyourmatter@gmail.com` — a real inbox, so no MX records or mail
   hosting are needed for `mattersettle.com`. Open the site, submit the form,
   and confirm the message arrives, so you know the one path a stranger uses
   actually works.
2. **Point the apex at GitHub Pages** (see "DNS records" below). Until then the
   site is unreachable and link previews can't load the preview image.
3. **Keep the RLAlphaLabs line exactly where it is.** `rlalphalabs.com`
   is a separate personal project, not a Matter Settle product and not client
   work. This site references it only as an example of an engineering standard,
   and says so in plain words on the homepage, the How We Build page and every
   footer. Do not let anyone "tighten" that into ownership language — claiming
   another party's project is the single fastest way to lose a careful reader,
   and it is the one thing every reviewer of this site flagged.
4. **Confirm the location line.** The footer and contact section say
   "India · IST (UTC+5:30)". Change it if that's wrong, and add a city and a
   legal entity name when you have one.
5. **Search for `TODO(owner)`** across the `.html` and `.js` files and resolve
   or delete each one. They mark every place a real detail is still missing.

---

## How the site is organized

```
mattersettle-site/
├── index.html                       the homepage (hero, proof, services, process, contact)
├── work/index.html                  the "How We Build" page          → mattersettle.com/work/
├── privacy/index.html               the privacy notice              → mattersettle.com/privacy/
├── 404.html                         broken links land here (GitHub Pages uses it automatically)
├── css/style.css                    all styling (colors, fonts, spacing) — one file
├── js/main.js                       all interactive behaviour (theme, menu, form) — one file
├── assets/favicon.svg               the logo mark, also used as the browser-tab icon
├── assets/og-cover.png              the image shown when someone pastes a link in Slack/LinkedIn
├── assets/fonts/*.woff2             self-hosted fonts (no third-party font CDN)
├── CNAME                            tells GitHub Pages the custom domain (mattersettle.com)
├── .nojekyll                        "serve these files as-is, don't run Jekyll"
├── .gitignore                       keeps PLAN/ out of the repo (and off the website)
└── PLAN/                            internal notes — .gitignored, never committed, never published
```

There is no build step and no GitHub Actions workflow. GitHub Pages is set to
"deploy from a branch", so the live site is literally the contents of `main`.
`PLAN/` stays off the website by never being committed at all — see
`.gitignore`.

Every page is a plain `.html` file you can open and edit directly. There is
no templating — if you want to change the footer on every page, you currently
have to edit the footer in each `index.html` separately (this is intentional:
duplicated-but-readable beats a clever templating system nobody here knows
how to maintain).

## Editing content (the 90% case)

1. Open the relevant `.html` file in any text editor (VS Code, Notepad,
   whatever you have).
2. Text you want to change is usually right there in plain English between
   tags, e.g.:
   ```html
   <h1 class="hero-h1">From notebook<br />to production system.</h1>
   ```
   Just edit the words between `<h1...>` and `</h1>`, leave the tags alone.
3. Look for `<!-- TODO(owner): ... -->` comments — these mark spots that were
   deliberately left as placeholders and need your input. Search the whole
   project for `TODO(owner)` to find every one.
4. Save the file. Nothing happens until you deploy (see below) — editing
   locally never affects the live site.

### Where things live

- **Contact email**: `js/main.js` (the `CONTACT_EMAIL` line near the bottom),
  `index.html` and `privacy/index.html` (search for `settleyourmatter@gmail.com`).
  Change all of them together.
- **Colors/fonts**: at the top of `css/style.css` in the `:root` and
  `[data-theme="light"]` blocks. Change a color once there and it updates
  everywhere (every component references `var(--token-name)`, never a
  hardcoded color). The text colours `--t2/--t3/--t4` were chosen to pass
  accessibility contrast rules — if you change them, check the contrast.
- **Logo**: the same small SVG appears inline in the nav and footer of each
  page (`class="logo-mark"`) and again in `assets/favicon.svg`. Change all of
  them together or they'll disagree.
- **Link-preview image**: `assets/og-cover.png` (1200×630). Regenerate it from
  `PLAN/og-cover-source.html` — open that file in Chrome, or run the command
  written at the top of it — and overwrite the PNG.

## The two rules this site is built on

1. **Never publish a number or claim you can't point at.** The site currently
   quotes no metrics at all — deliberately. The only numbers available belonged
   to a project this studio does not own, and borrowed figures on a vendor site
   read as borrowed credibility. When Matter Settle has its own result, publish
   it with a link a stranger can open, and delete it the day it stops being
   true.
2. **No client work, testimonials, logos, or headcounts until they're real.**
   The site says plainly that the studio is new. That honesty is the entire
   pitch — replacing it with generic agency claims makes the site worse, not
   better.

## Adding a new page

1. Make a new folder, e.g. `about/`, and inside it an `index.html` file.
   This gives you the URL `mattersettle.com/about/`.
2. Copy an existing simple page (e.g. `privacy/index.html`) as your starting
   template — it already has the correct `<head>`, nav, footer, and script
   tags wired up.
3. Update the `<title>`, `<meta name="description">`, and the main content in
   the middle. The `../css/style.css` and `../js/main.js` paths already use
   `../` because the new page lives one folder deep.
4. Add a link to the new page from the nav and/or footer of the other pages,
   so people can actually find it.
5. Nothing else to configure — every committed file is published as-is, so a
   new folder goes live the moment you push it.

Only add a page when you have real content for it. A small studio with one
real project reads as more credible than a site full of thin, empty pages.

## Editing the navigation or footer

Both appear on every page and are NOT shared via a template — to change a nav
link or footer column you need to edit `index.html`, `work/index.html`,
`privacy/index.html` and (for the nav only) `404.html`. Tedious but simple,
and nothing can silently break from an included-file typo.

## Testing changes locally before deploying

```bash
cd mattersettle-site
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Click around, check the links work and
nothing looks broken. `Ctrl+C` stops the server.

## Deploying (going live)

```bash
git add -A
git commit -m "describe what you changed"
git push origin main
```

GitHub Pages watches the `main` branch and publishes whatever is in it,
exactly as-is. There is no build and no workflow to go wrong — a push is the
deploy. It usually goes live within a minute or two.

What that means for you: **anything you commit is public.** `PLAN/` is listed
in `.gitignore` so it is never committed and therefore never published, which
is the only thing keeping the internal notes off the website. Don't remove that
line, and don't force-add files from it.

### First-time setup only

- Create the GitHub repo and push this folder to it (`git init`, `git remote
  add origin …`, `git push -u origin main`).
- GitHub → repo → **Settings → Pages → Source → "Deploy from a branch"**,
  branch `main`, folder `/ (root)`. This is the same setup
  `rlalphalabs.com` uses.

### DNS records (Cloudflare, for `mattersettle.com`)

The apex domain currently has no records at all. To point it at GitHub Pages,
add these in Cloudflare's DNS tab:

| Type  | Name  | Value                          | Proxy status |
|-------|-------|--------------------------------|--------------|
| A     | `@`   | `185.199.108.153`              | DNS only     |
| A     | `@`   | `185.199.109.153`              | DNS only     |
| A     | `@`   | `185.199.110.153`              | DNS only     |
| A     | `@`   | `185.199.111.153`              | DNS only     |
| CNAME | `www` | `<your-github-username>.github.io` | DNS only |

"DNS only" (grey cloud, not orange) matters: GitHub needs to see the real
request to issue the HTTPS certificate. `rlalphalabs.com` uses the same setup
(its `www` is a CNAME to the same `<your-github-username>.github.io` host). After the records exist, GitHub → Settings → Pages →
Custom domain should show `mattersettle.com` verified, and "Enforce HTTPS"
should be ticked.

Email needs nothing here: the site's contact address is an ordinary Gmail
inbox, so `mattersettle.com` needs no MX records and no mail hosting. If you
ever switch to an address at the domain, that is when MX records become
necessary.

## Things intentionally NOT in this repo

No client logos, no testimonials, no team photos or bios, no fabricated
statistics, no pricing figures, no countdown timers or fake urgency. If
someone asks you to add any of these without real backing, that's a deliberate
design decision to push back on, not an oversight to fix.
