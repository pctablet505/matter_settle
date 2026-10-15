# mattersettle.com

The published files of [mattersettle.com](https://mattersettle.com), a static site served by GitHub Pages from the `main` branch (root folder). Every file in this repository is public.

- **No build step runs here.** The pages are generated elsewhere and committed as they are.
- **Keep `CNAME` and `.nojekyll`.** The first names the custom domain; the second makes GitHub Pages serve the files as they are.
- **Asset file names carry a content hash** (`assets/v2/style.<hash>.css`, `main.<hash>.js`, the fonts). When one of them changes, give it a new name and update every page that references it: the CDN in front of the site keeps old copies for hours.
- **No analytics, no third-party requests, no cookies.** The only thing the site stores in a visitor's browser is the light/dark choice.
- **Nothing on the site states a client, a result or a person that is not real.** Keep it that way.
