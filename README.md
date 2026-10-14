# Litervia

**Discover research. Explore knowledge.**

Litervia is an independent research discovery and personal knowledge platform for exploring CHI research (1982–2026), discovering publications and authors, and building a personal research library.

## Project Status

**Early development — Laravel and React application foundation.**

The application foundation includes Laravel, Blade, React, React Router, TanStack Query, Tailwind CSS, and Vite. The current UI contains development placeholders. Research ingestion, user accounts, private knowledge features, the final Design System, and deployment remain unimplemented.

Development follows a GitHub Issue, feature branch, and Pull Request workflow.

## Technology Stack

The application technology stack includes:

- **Backend:** PHP and Laravel
- **Frontend:** Blade, React (JavaScript), React Router, TanStack Query, Tailwind CSS 4, and Vite 8
- **Data:** A normalized research catalogue and a separately secured private user data store

Laravel 13 owns HTTP routing and server responses. React Router handles navigation between explicitly registered application pages. TanStack Query provides the initial server-state infrastructure; real API integrations and the final data architecture remain future work.

## Requirements

Local development requires:

- PHP 8.4.1 or later, below PHP 9.0
- Composer
- Git for cloning the repository
- Node.js 24.x and npm 11.x
- PHP extensions required by the locked dependencies

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

The repository is private and requires authorized GitHub access.

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

- `/` — React Home placeholder
- `/research` — React Research placeholder
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

Laravel feature tests cover the application shell, initial SEO metadata, routing, HTTP 404 responses, health endpoint, and disabled private storage routes.

These tests do not constitute comprehensive application or security coverage.

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

Laravel explicitly registers `/` and `/research` and serves a Blade application shell. React Router handles client-side navigation between these pages.

Unknown research routes and unmatched API endpoints must return appropriate HTTP error responses rather than silently serving the React application shell.

TanStack Query is configured as a provider. No real research API requests have been implemented.

### Technical SEO

Laravel supplies page-specific titles, descriptions, and Open Graph metadata in the initial HTML response. React updates relevant metadata during client-side navigation.

Both unfinished application pages currently use `noindex, nofollow`.

No production canonical URL, research sitemap, or publication structured data has been published.

Before creating indexable publication, author, country, or catalogue pages, the public rendering strategy must be reviewed for reliable crawlability, canonical URLs, correct HTTP statuses, source provenance, and permitted metadata.

### Design direction

Editorial Research is the approved visual direction for Litervia. The final Design System, including typography, design tokens, dark mode, reusable components, and accessibility requirements, will be reviewed separately before major UI implementation.

Generated frontend assets in `public/build/` and installed dependencies in `node_modules/` must not be committed to Git.

## Data and Storage

The current foundation does not initialize the research catalogue or private user databases.

Database schemas, normalization, import workflows, authentication, and access controls will be implemented through separately reviewed deliverables.

Do not run database migrations as part of this foundation setup.

The local filesystem disk does not expose Laravel temporary file-serving routes in the current configuration.

Raw research datasets, private user data, credentials, generated dependencies, and local runtime databases must not be committed to Git.

## Research Integrity

The planned catalogue covers CHI bibliographic research from 1982 through 2026. Completeness, source provenance, publication categories, and metadata availability must be verified before records are presented as authoritative.

Litervia is an independent project and is not affiliated with ACM or SIGCHI.

## License

Copyright (c) 2026 Petros Tamboutsiaris. All rights reserved.

Litervia is proprietary software and is not distributed under an open-source license. Unauthorized use, modification, or distribution of its original source code is not permitted, except as allowed by applicable law or expressly authorized in writing.

See [LICENSE](LICENSE) for details.
