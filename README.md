# Litervia

**Discover research. Explore knowledge.**

Litervia is an independent research discovery and personal knowledge platform for exploring CHI research (1982–2026), discovering publications and authors, and building a personal research library.

## Project Status

**Early development — Laravel and React foundation with an initial editorial interface.**

The application foundation includes Laravel, Blade, React, React Router, TanStack Query, Tailwind CSS, and Vite. The Home page implements the established Editorial Research visual direction with three conceptual responsive hero compositions and a narrowly scoped public, read-only hero-image manifest; the Research route remains an explicit catalogue-under-development placeholder. Research ingestion, real search and filters, user accounts, private knowledge features, and deployment remain unimplemented. The design system is a locally reviewed foundation, not a completed or independently accessibility-certified product UI. Public release of the imagery remains separately gated.

Development follows a GitHub Issue, feature branch, and Pull Request workflow.

## Technology Stack

The application technology stack includes:

- **Backend:** PHP and Laravel
- **Frontend:** Blade, React (JavaScript), React Router, TanStack Query, Tailwind CSS 4, and Vite 8
- **Data:** PostgreSQL 18 with separate research-catalogue and private-user databases; approved schemas and ingestion remain future work

Laravel 13 owns HTTP routing and server responses. React Router handles navigation between explicitly registered application pages. TanStack Query provides the initial server-state infrastructure; research catalogue API integrations and the final data architecture remain future work. A separate public read-only hero-image manifest supports the approved local Home presentation; its route is an explicit, bounded Issue #5 scope exception.

## Requirements

Local development requires:

- PHP 8.4.1 or later, below PHP 9.0
- Composer
- Git for cloning the repository
- Node.js 24.x and npm 11.x
- PHP extensions required by the locked dependencies (`pdo_pgsql` for PostgreSQL integration)
- PostgreSQL 18.x for the local database foundation and integration tests; see `docs/postgresql-foundation.md`

The foundation has been tested locally with:

- PHP 8.5.11
- Composer 2.10.3
- Laravel Framework 13.35.0

Other operating systems and PHP versions have not yet been independently tested.

The frontend environment has been verified locally with Node.js 24.21.0 and npm 11.19.0.

## Local Development

The following commands target PowerShell on Windows.

### 1. Clone the repository

For a new working copy:

```powershell
git clone https://github.com/PetrosTam/litervia.git
cd litervia
```

Repository access depends on its current GitHub visibility. The source code is distributed under the proprietary terms in [LICENSE](LICENSE).

If the repository is already cloned, use the existing working directory instead.

### 2. Create the local environment file

```powershell
Copy-Item .env.example .env
```

The `.env` file contains local configuration and secrets and must never be committed.

For the default development server, set `APP_URL` in the local `.env` to `http://127.0.0.1:8000`.

### 3. Install PHP dependencies

```powershell
composer install --no-interaction --prefer-dist
```

Composer installs the versions specified in `composer.lock`. Also run `npm ci` to install the frontend dependencies from `package-lock.json`.

### 4. Generate the application key

```powershell
php artisan key:generate
```

Do not commit or share the generated application key.

### 5. Verify the installation

```powershell
php artisan --version
php artisan route:list
php artisan test
```

The application foundation provides:

- `/` — editorial React Home page with a locally implemented, server-selected rotating conceptual CHI/HCI-inspired hero (02/06/07); a client-side Research-to-Home transition currently uses a documented static fallback
- `/research` — React Research page that clearly states the catalogue is under development
- `/api/home/hero-images` — allowlisted public image manifest (not research data); response is `private, no-store` because the Laravel `web` middleware may set a session cookie
- `/up` — Laravel health endpoint

### 6. Start the development server

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

In a second PowerShell terminal, start the Vite development server with `npm run dev`.

After both Laravel and Vite are running, open http://127.0.0.1:8000 in a browser.

Alternatively, run `npm run build` before opening the application to serve compiled assets without the Vite development server.

Stop running development servers with `Ctrl+C`.

## Testing and Quality

Run the PHP tests:

```powershell
php artisan test
```

Validate Composer metadata:

```powershell
composer validate --strict
```

Check locked dependencies for known security advisories:

```powershell
composer audit --locked
```

Laravel feature tests cover the application shell, initial SEO metadata, routing, HTTP 404 responses, health endpoint, disabled private storage routes, and Home hero selection. The public image-manifest test checks that `Cache-Control` contains `private` and `no-store` (irrespective of directive ordering) under the normal web middleware, including the session cookie behavior.

These tests do not constitute comprehensive application or security coverage.

For the isolated local PostgreSQL 18 connection tests (after provisioning, with the four test passwords configured only in the ignored `.env`):

```powershell
php artisan config:clear
$env:LITERVIA_PG_INTEGRATION = '1'
try { php artisan test --filter=PostgreSQLConnectionTest --fail-on-skipped --fail-on-empty-test-suite }
finally { Remove-Item Env:\LITERVIA_PG_INTEGRATION -ErrorAction SilentlyContinue }
```

**Verified foundation checks:** Local PostgreSQL integration completed **6 tests / 406 assertions**; the complete Laravel suite with PostgreSQL enabled completed **25 tests / 506 assertions**. [PR #12 CI](https://github.com/PetrosTam/litervia/actions/runs/40980614901) passed all three jobs (PHP 8.4, PHP 8.5, Node.js 24), including isolated database provisioning and negative credential checks. The design system implementation passed its scoped Laravel, React, accessibility-related and production-build checks; [PR #6 CI](https://github.com/PetrosTam/litervia/actions/runs/40602725233) passed 3/3. These are recorded results from the linked deliverables, not claims of production readiness or completed catalogue ingestion. See [PostgreSQL foundation](docs/postgresql-foundation.md) and [Home implementation review](docs/hero-implementation-review.md) for methods and limitations.

## Frontend Testing, Routing and SEO

### Frontend quality checks

Run the React component integration tests:

`npm test`

Build production frontend assets:

`npm run build`

Check frontend dependencies for known security advisories:

`npm audit --audit-level=high`

The frontend tests use Vitest, React Testing Library, and jsdom. They cover initial rendering, client-side navigation, accessibility-related elements, and placeholder metadata.

The GitHub Actions workflow includes independent PHP 8.4, PHP 8.5, and Node.js 24 jobs. Their results must be verified on the actual Pull Request.

### Routing responsibilities

Laravel explicitly registers `/`, `/research`, and the public image manifest route, and serves a Blade application shell. React Router handles client-side navigation between these pages.

Unknown research routes and unmatched API endpoints must return appropriate HTTP error responses rather than silently serving the React application shell.

TanStack Query is configured as a provider. No real research API requests have been implemented.

### Technical SEO

Laravel supplies page-specific titles, descriptions, and Open Graph metadata in the initial HTML response. React updates relevant metadata during client-side navigation.

Both unfinished application pages currently use `noindex, nofollow`.

No production canonical URL, research sitemap, or publication structured data has been published.

Before creating indexable publication, author, country, or catalogue pages, the public rendering strategy must be reviewed for reliable crawlability, canonical URLs, correct HTTP statuses, source provenance, and permitted metadata.

### Design direction

Editorial Research is the approved visual direction for Litervia. The current UI foundation uses centralized semantic Tailwind CSS 4 design tokens, a cream/forest-green palette, system-following light/dark colors via `prefers-color-scheme`, and self-hosted variable Newsreader (editorial headings) and Inter (interface/body text) WOFF2 subsets. Their SIL Open Font License notices are preserved under `resources/fonts/`. The Home hero uses three conceptual AI-generated CHI/HCI-inspired scenes (02, 06 and 07) as responsive, optimized WebP images with a CSS contrast scrim; they are **not documentary CHI imagery**. The conceptual artwork has documented text-prompt generation provenance without declared third-party reference-image uploads; remaining visual and release checks are recorded below.

There is no manual theme selector, theme-preference persistence, live publication list, functional search, or account feature. The existing routes retain their server-delivered metadata and `noindex, nofollow` settings.

Manual browser checks covered Home/Research motion, responsive layouts, light/dark appearance, keyboard navigation, reduced motion, console errors, images, 200%/400% zoom and enlarged text. A recorded Home checklist covered 320, 375, 768, 1024 and 1440 CSS-pixel widths (25/25). The exported Research checklist remained 0/25 despite the reported manual inspection, so per-viewport Research evidence is incomplete. Desktop and mobile screenshots document the centered footer notice. These checks are not independent WCAG certification.

Chrome 155 Incognito local Lighthouse evidence is recorded in `docs/hero-implementation-review.md`: Home/Research scored 93/95 on Mobile and 100/100 on Desktop in the temporary Caddy/gzip environment, with Accessibility and Best Practices scores of 100 for all four page/device combinations. Earlier uncompressed Laravel Mobile Home LCP (~3.7s) and CLS (~0.001) were observed; final Caddy per-run FCP/LCP/TBT/CLS and production Core Web Vitals are **not consistently recorded**. Issue #5 records **MANUAL QA PASS** for contrast/focus, responsive, difficult-content and text-spacing checks, while some detailed original measurements and Research per-viewport records were not archived. Independent WCAG 2.2 AA conformance auditing and production performance validation remain open; the supporting evidence and limitations are tracked in PR #6 and Issue #5. No duplicate manual QA is implied by these archival limitations.

Generated frontend assets in `public/build/` and installed dependencies in `node_modules/` must not be committed to Git.

## Data and Storage

Issue #11 provisions two **empty** PostgreSQL 18 UTF8/ICU databases (`litervia_catalogue` and `litervia_private`) with independent roles and permissions, plus two isolated test databases. Named Laravel connections are configured; the research catalogue, private user tables, auth, normalization and import workflows **are not implemented**. See [`docs/postgresql-foundation.md`](docs/postgresql-foundation.md) for verified local steps, safe test opt-in, CI design and limitations.

The normal Laravel suite currently uses SQLite in-memory as a legacy isolated fixture. The PostgreSQL integration suite is a separate opt-in check and must never run against application databases. Do not run default or destructive migrations as part of this foundation setup.

The local filesystem disk does not expose Laravel temporary file-serving routes in the current configuration.

Raw research datasets, private user data, credentials, generated dependencies, and local runtime databases must not be committed to Git.

## Research Integrity

The planned catalogue covers CHI bibliographic research from 1982 through 2026. Completeness, source provenance, publication categories, and metadata availability must be verified before records are presented as authoritative.

Litervia is an independent project and is not affiliated with ACM or SIGCHI.

## License

Copyright (c) 2026 Petros Tamboutsiaris. All rights reserved.

Litervia is proprietary software and is not distributed under an open-source license. Unauthorized use, modification, or distribution of its original source code is not permitted, except as allowed by applicable law or expressly authorized in writing.

See [LICENSE](LICENSE) for details.
