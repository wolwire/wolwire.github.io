# Mayank Agrawal — portfolio

Static portfolio for GitHub Pages at `mayankagrawal.in`. No build step or JavaScript dependencies are required.

## Local preview

From this directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000.

## Editing

- `index.html`: editorial page, six project panels, career history, writing, and contact.
- `css/portfolio.css`: shared resets, artwork, and foundational component styles.
- `css/studio.css`: full-screen layout, responsive project stack, typography, menu, and motion preferences.
- `js/studio.js`: procedural 3D knot, pointer and scroll interaction, native dialog navigation, motion controls, and local clock.
- `assets/favicon.svg`: site icon.
- `documents/Profile.pdf`: existing downloadable résumé.
- `CNAME`: existing GitHub Pages custom domain; retained unchanged.

The canvas sculpture is generated locally from a parametric knot. The scene renders at a maximum of 30 frames per second and stops when offscreen or in a hidden tab. System reduced-motion preferences and the saved motion toggle disable automatic motion. Mobile uses a normal vertical project layout; desktop uses stacked sticky panels without intercepting scrolling. Content and project links remain available without JavaScript, and the hero has a CSS artwork fallback.

Fonts load from Google Fonts with local fallbacks. Project artwork is original HTML/CSS illustration rather than application screenshots.

## Visual references

The new direction was informed by the oversized type and experimental composition of [FORMAT](https://format.obys.agency/), the large-scale work presentation of [Huy Phan](https://huyml.co/), and the editorial portfolio of [Brandon Yasin](https://brandonyasin.com/), discovered through Awwwards. No reference-site assets or source code were reused.

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

This checkout retains the original GitHub Pages layout. Publish through the repository's existing Pages configuration after committing and pushing the changes. Pushing to the configured publishing branch lets the existing GitHub Pages workflow publish the site.
