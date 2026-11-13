# Your Business Name — Website (Draft v1)

Static site for three services: **Notary**, **Loan Signing**, and **LLC Formation**, each on its own tab.
No build step — plain HTML/CSS/JS, ready for GitHub Pages.

## Structure

```
index.html            Home page with the three service tabs + request form
privacy.html          Draft privacy notice (needs review before launch)
css/styles.css        All styles; brand colors are tokens at the top
js/main.js            Tabs, deep links, form validation
assets/               logo-placeholder.svg (swap for the real logo), logo-mark.svg (favicon)
.well-known/security.txt
docs/ron-api-research.md   Remote online notarization API options
```

Deep links: `/#notary`, `/#loan-signing`, `/#llc-formation`.

## Swapping in the logo

Replace `assets/logo-placeholder.svg` (header) and `assets/logo-mark.svg` (browser tab icon) with the supplied files,
keeping the same names — or update the `src`/`href` in `index.html` and `privacy.html`.
Then adjust the color tokens at the top of `css/styles.css` to match.

## Placeholders to fill in

Search the HTML for `Your Business Name`, `$__`, `[State]`, `[City, State]`, `Commission #`, and `(000) 000-0000`.

## Typography

**IBM Plex Sans** (body) + **IBM Plex Serif** (headings), from Google Fonts. Plex was designed for clarity
in corporate and financial interfaces, has tabular numerals for pricing, and the serif headings add a
"documents and seals" feel without looking old-fashioned.

## Security & compliance

What the draft already does:

- **Strict Content-Security-Policy** (meta tag): only this site's own scripts run; no inline JS, no third-party scripts, `object-src 'none'`, `base-uri 'self'`, `upgrade-insecure-requests`.
- **Referrer-Policy** `strict-origin-when-cross-origin`.
- **HTTPS**: GitHub Pages serves over HTTPS — tick *Enforce HTTPS* in repo Settings → Pages.
- **No sensitive data collected**: the form only takes name/phone/email/short note, warns users not to send SSNs, IDs, or account numbers, and blocks text that looks like an SSN or card number.
- **Spam honeypot**, input length limits, `credentials: 'omit'` on form submissions.
- **Legal disclaimers**: notary "not an attorney" statement (required wording in several states — confirm yours), and "not a law firm" for LLC services to avoid unauthorized-practice-of-law issues.
- **security.txt** for responsible disclosure.

Before launch:

1. **Form backend** — connect the form to a provider with HTTPS + spam protection (e.g. Formspree, Basin, or a serverless function). Set `FORM_ENDPOINT` in `js/main.js` and add that origin to `connect-src` and `form-action` in the CSP.
2. **Document uploads** — never through this site. Use your RON platform or a secure, encrypted portal.
3. **Response headers** — GitHub Pages can't set custom headers (HSTS, `X-Frame-Options`/`frame-ancestors`, `Permissions-Policy`). If you want them, put Cloudflare (free) in front, or host on Netlify/Cloudflare Pages with a `_headers` file.
4. **Custom domain** — add it in Settings → Pages, and turn on DNSSEC at your registrar if offered.
5. **Repo hygiene** — enable 2FA on the GitHub account, turn on Dependabot/secret scanning, and never commit API keys (the RON integration must run server-side, not in this static site).
6. **Legal review** — have the privacy notice and disclaimers checked against your state's notary rules; display commission number/expiry if your state requires it.

## Local preview

Open `index.html` in a browser, or run `python -m http.server 8000` in this folder and visit http://localhost:8000.
