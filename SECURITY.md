# Security Policy

## Supported versions

This project is a client-only static Othello app deployed from `main` to GitHub Pages.

| Surface                            | Supported        |
| ---------------------------------- | ---------------- |
| Latest `main` (GitHub Pages build) | Yes              |
| Older commits / forks              | Best effort only |

There is no backend, authentication, or server-side game API in the current codebase.

## Reporting a vulnerability

Please report security issues through [GitHub Security Advisories](https://github.com/cozyGarage/Othello/security/advisories/new) for this repository.

Include:

- A clear description of the issue and impact
- Steps to reproduce
- Affected URL/path or package if known

You can expect an acknowledgment when the report is reviewed. Fixes for accepted issues will ship on `main` and redeploy with the normal Pages workflow.

## Scope notes

- Game state and preferences are stored in the browser (`localStorage`) and are not server-trusted.
- The AI Web Worker and service worker are same-origin static assets under `/Othello/`.
- Multiplayer is documented but not implemented; treat any future networked protocol as a new threat model.
