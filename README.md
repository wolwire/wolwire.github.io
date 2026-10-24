# Mayank Agrawal — portfolio

Static portfolio for GitHub Pages at `mayankagrawal.in`. No build step or JavaScript dependencies are required.

## Local preview

From this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000.

## Editing

- `index.html`: biography, project cards, experience, and writing. Each project card declares a category with `data-category`.
- `css/portfolio.css`: responsive design, project illustrations, and print styles.
- `js/portfolio.js`: accessible category filters and current footer year. Project content remains available without JavaScript.
- `assets/favicon.svg`: site icon.
- `documents/Profile.pdf`: existing downloadable résumé.
- `CNAME`: existing GitHub Pages custom domain; retained unchanged.

Project visuals are original HTML/CSS illustrations, not application screenshots. Fonts load from Google Fonts, with local serif and system font fallbacks.

## Subdomain review — 23 October 2026

Public certificate records were used for discovery, followed by read-only HTTPS checks.

| Host | Observed result | Portfolio treatment |
| --- | --- | --- |
| games.mayankagrawal.in | HTTP 200, Flowista arcade | Featured with live link |
| stock.mayankagrawal.in | HTTP 200; application redirects to sign-in | Featured, labeled sign-in required |
| property.mayankagrawal.in | HTTP 502 Bad Gateway | Not featured |
| qnawebsite.mayankagrawal.in | DNS resolution failed | Not featured |
| ntfy.mayankagrawal.in | HTTP 200, ntfy service | Infrastructure; not featured |

Historical mail/control-panel names and wildcard records were not treated as public portfolio projects. Certificate records cannot establish a complete inventory, particularly for wildcard-covered hosts. No infrastructure or DNS settings were changed.

## Deployment

This checkout retains the original GitHub Pages layout. Publish through the repository's existing Pages configuration after committing and pushing the changes. No hosted deployment has been performed by this redesign.
