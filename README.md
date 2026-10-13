# Litervia

**Discover research. Explore knowledge.**

Litervia is an independent research discovery and personal knowledge platform for exploring CHI research (1982–2026), discovering publications and authors, and building a personal research library.

## Project Status

**Early development — Laravel application foundation.**

The Laravel application foundation is implemented. The research catalogue, user accounts, private knowledge features, frontend integration, and deployment are not yet implemented.

Development follows a GitHub Issue, feature branch, and Pull Request workflow.

## Technology Stack

The planned application stack includes:

- **Backend:** PHP and Laravel
- **Frontend:** Blade, React (JavaScript), Tailwind CSS, and Vite
- **Data:** A normalized research catalogue and a separately secured private user data store

Laravel 13 is used for the current backend foundation. The frontend stack and final data architecture will be integrated through subsequent reviewed deliverables.

## Requirements

The current Laravel foundation requires:

- PHP 8.4.1 or later, below PHP 9.0
- Composer
- Git for cloning the repository
- PHP extensions required by the locked dependencies

The foundation has been tested locally with:

- PHP 8.5.11
- Composer 2.10.3
- Laravel Framework 13.35.0

Other operating systems and PHP versions have not yet been independently tested.

Node.js and npm are not required for the current backend-only foundation.

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

Composer installs the versions specified in `composer.lock`.

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

The current foundation provides:

- `/` — Initial application welcome page
- `/up` — Laravel health endpoint

### 6. Start the development server

```powershell
php artisan serve --host=127.0.0.1 --port=8000
```

Open http://127.0.0.1:8000 in a browser.

Stop the development server with `Ctrl+C`.

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

The current foundation includes basic tests for the home page, health endpoint, and disabled private storage routes.

These tests do not constitute comprehensive application or security coverage.

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
