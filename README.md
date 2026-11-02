# Litervia

**Discover research. Explore knowledge.**

Litervia is an independent research-discovery and personal-knowledge platform for exploring CHI research from 1982 to 2026, discovering publications and researchers, and building a personal research library.

## Project Status

**In development.** The repository currently includes a Laravel and React application foundation, an editorial Home page, a Research page indicating that the catalogue is under development, isolated PostgreSQL database connections, automated tests, and GitHub Actions CI.

Research-data ingestion, catalogue search and filtering, accounts, private notes, favourites, collections, and production deployment are not yet implemented. The target CHI coverage is a product goal, not a claim that the catalogue has been completed or independently verified.

## Technology Stack

- **Backend:** PHP 8.4+, Laravel 13, Blade
- **Frontend:** React (JavaScript), React Router, TanStack Query, Tailwind CSS 4, Vite 8
- **Data:** PostgreSQL 18, with separate catalogue and private-user databases
- **Quality:** Laravel feature/integration tests, Vitest, Laravel Pint, Composer/npm security checks, GitHub Actions

## Getting Started

The following commands use **Windows PowerShell**. You need Git, PHP 8.4.1+, Composer, Node.js 24 with npm 11, and the PHP extensions required by Composer.

PostgreSQL 18 and `pdo_pgsql` are needed for the database foundation and its integration tests. Before configuring database access, read the [PostgreSQL setup and safety instructions](docs/postgresql-foundation.md). Do not rerun one-time provisioning scripts against an existing database cluster or run application migrations without a reviewed plan.

```powershell
git clone https://github.com/PetrosTam/litervia.git
Set-Location litervia

Copy-Item .env.example .env
composer install --no-interaction --prefer-dist
npm ci
php artisan key:generate
```

Set `APP_URL=http://127.0.0.1:8000` and configure the appropriate local PostgreSQL connection credentials in the ignored `.env` file. Never commit credentials or application keys.

Start Laravel:

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

In a second PowerShell terminal, run `npm run dev`, then visit [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Tests and Quality Checks

```powershell
php artisan test
npm test
npm run build
php vendor/bin/pint --test
composer validate --strict
composer audit --locked --no-interaction
npm audit --audit-level=high
```

The PostgreSQL integration suite uses separate, explicitly configured test databases and an opt-in safety guard. See [PostgreSQL foundation](docs/postgresql-foundation.md) for the exact command and prerequisites. Passing the current tests does not establish completed catalogue functionality or production readiness.

## Documentation

- [PostgreSQL foundation, local setup, and database security](docs/postgresql-foundation.md)
- [Frontend implementation and visual QA](docs/hero-implementation-review.md)
- [Catalogue identity architecture (ADR-0001)](docs/architecture/adr-0001-chi-catalogue-identity.md)
- [Catalogue physical-design contract](docs/architecture/chi-catalogue-physical-design-contract.md)
- [CHI normalization and provenance](docs/research/chi-normalization-contract.md)
- [Research evidence and identity review](docs/research/chi-source-evidence-identity-review.md)
- [Metadata publication and rights policy](docs/research/chi-metadata-publication-rights-policy.md)

Original research datasets, local databases, and private user information are not stored in this repository. Litervia is independent and is not affiliated with ACM or SIGCHI.

## License

Copyright (c) 2026 Petros Tamboutsiaris. All rights reserved.

Litervia is proprietary software. Public visibility, if enabled, does not grant an open-source license or permission to reuse the project. See [LICENSE](LICENSE) for the applicable terms.
