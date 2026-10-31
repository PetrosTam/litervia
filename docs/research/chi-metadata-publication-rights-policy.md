# Litervia — CHI Metadata Publication & Rights Policy

- **Decision date:** 2026-10-31.
- **Status:** **OWNER APPROVED POLICY (PUB-01–PUB-06)**; implementation, individual asset permissions and the decisions explicitly identified below remain **OPEN / NOT RUN**.
- **Scope:** Initial public CHI 1982–2026 research catalogue, discovery, citation, provenance, external links and future content enrichment.
- **Authority:** Explicit owner approval in the Issue #13 continuation conversation; Product & Engineering Specification ``5–6, 8, 12; [ADR-0001](../architecture/adr-0001-chi-catalogue-identity.md); [Normalization Contract](chi-normalization-contract.md); [Issue #13](https://github.com/PetrosTam/litervia/issues/13).
- **Interpretation:** Product/engineering publication policy, **not legal advice**, not approval for content copying, database migrations, ingestion, external API collection, PR merge or deployment.

## 1. Approved publication decisions

| ID | Approved policy | Boundary still OPEN |
|---|---|---|
| **PUB-01** | Initial public responses display evidence-backed reusable bibliographic metadata and validated outbound source, DOI, publisher/DBLP links. Publisher abstracts, full text and images/audio/video are **off by default**. | Source verification and executable publication controls. F-03 real previews remain an evidence/rights-gated product requirement, not removed scope. |
| **PUB-02** | Preserve original source-title assertions; use the recorded DBLP title as a **provisional display fallback**. Publisher conflicts require separate, evidence-backed display decisions. | Preferred titles in conflicted records, including FLUID-IoT and AutomationXP. Never overwrite raw titles. |
| **PUB-03** | DBLP, Crossref and OpenAlex bibliographic metadata may be considered for reuse with source-scoped provenance, matching and rights evaluation. | Actual enrichment API use, quota/terms, matching logic, new ingestion adapters and publisher abstracts. No integration authorized. |
| **PUB-04** | Assess CEUR-WS Volume 3394's stated CC BY 4.0 / metadata CC0 terms **separately** from the disputed TOC membership of `short10.pdf`. | File-level/embedded third-party asset rights and final indexed-volume membership. |
| **PUB-05** | Abstracts and media require separately approved **asset/copy/version-specific** clearance with attribution, allowed uses, security/accessibility testing and withdrawal controls. | No automatic copying, scraping, proxying, mirroring, embedding or thumbnail creation. |
| **PUB-06** | Public responses must use curated evidence-backed provenance, honest missing/unknown states and versioned display/publication decisions. | Final API envelopes, SQL schema, database enum values, release mechanics and private audit review permissions. |

**APPROVED architecture, unchanged:** separate `research_works`, `work_appearances` and versioned `source_records`; stable canonical Litervia IDs, original author order/DOI assertions, no title/year-only merges; verified `main_chi` discovery default with separately selectable EA, Companion, Workshop and All/Unclassified categories; separate PostgreSQL catalogue/private databases.

## 2. Governing safety and evidence rules

1. Metadata reuse **does not confer rights** to copy publisher abstracts, photographs, covers, figures, full-text PDFs, videos, audio, event imagery or logos. Verify the *specific copy/version* and embedded third-party materials.
2. Each public field must have attributable source/snapshot evidence, availability state and reviewed selection. Contradictory titles, authorship claims, DOI candidates and historical associations remain distinct assertions, not silently reconciled.
3. A DOI string is a **candidate**, not proof of DOI resolution. A main-volume record is not necessarily a full technical paper. No inferred historical affiliation, country, award or preview.
4. Missing values must distinguish `observed`, `unknown`, `not_checked` and `not_applicable` where relevant; specific final API types remain unapproved.
5. Source links do not imply endorsement by ACM/SIGCHI, DBLP, Crossref, OpenAlex or CEUR-WS. Avoid using source logos without permission.
6. Never expose private user notes, favourites, collections, staging content, reviewer identities or sensitive internal audit discussions through public catalogue endpoints.
7. The count **28,870** represents selected DBLP bibliographic source records (including **95** volumes), not 28,870 independently verified full papers or complete publisher coverage.

## 3. Approved initial-publication defaults, subject to implementation

| Data family | Initial presentation rule | Verification or restriction |
|---|---|---|
| Stable Litervia work/appearance identifiers | Public canonical references | No exposure of private database identifiers; stable after enrichment. |
| Title, publication year, source booktitle/volume, page/article number | Display *selected, source-supported* bibliographic fields | Retain original assertions; source-volume category differs from contribution track. |
| Authors | Preserve source byline order and original name | A byline is **not** verification of unique person identity. |
| DOI candidates and source/publisher/DBLP links | Safe outbound links with attribution | Parse and validate URL scheme/host; no invented `resolved` state or arbitrary multi-DOI choice. |
| Source category | Default only verified `main_chi`; others by explicit choice | Unknown is not main; exclude proceedings-volume rows from paper counts. |
| Historical institutions, affiliations, countries | Show only verified *work-specific* claims | Never backfill from present-day institution alone. |
| Award labels, impact metrics, preview media | Only with independent source/rights proof | No fabricated zeros, awards or static unrelated home video. |
| Publisher/author abstracts, media, PDFs and copyrighted long-form text | **Do not republish or embed at initial launch** | Outbound link only until per-copy permission and separate approval. |
| Personal notes, favourites, collections | **Private only** | Separate data store and server-side ownership checks. |

Original Litervia-authored editorial copy would require a separately approved, reviewed workflow; it must not be an unauthorized paraphrase of publisher text.

## 4. Source licensing and attribution boundaries

- **DBLP:** Published bibliographic metadata carries a CC0 dedication; that does **not** cover publisher article text/media. [Official terms](https://dblp.org/db/about/copyright.html).
- **Crossref:** Bibliographic facts may be reused with source governance; abstract text and provider-specific content permissions are separate. [Metadata documentation](https://www.crossref.org/documentation/retrieve-metadata/).
- **OpenAlex:** Its metadata CC0 statement is not a single universal licence for every third-party work location or PDF. [Data description](https://help.openalex.org/data/how-its-built/) · [Location licences](https://help.openalex.org/data/licenses/).
- **ACM/CHI:** Open-access availability or a publisher landing page does not independently grant Litervia rights to mirror every article/figure/video; assess per asset and edition. [Publisher OA information](https://cc.acm.org/2026/open-access/).
- **CEUR-WS Volume 3394:** Its index states CC BY 4.0 for the volume/papers and CC0 for bibliographic data. Check any specific file's actual notice and embedded-content exceptions before reuse. Do not apply that licence to different CEUR volumes or infer final TOC membership from file hosting. [Volume](https://ceur-ws.org/Vol-3394/) · [CEUR submission/licensing policy](https://ceur-ws.org/HOWTOSUBMIT.html) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Rights assessment and bibliographic identity review are distinct. Source availability, metadata licence, content licence and approved Litervia *product presentation* are separate decisions.

## 5. CEUR `short10.pdf` — approved non-blocking exception

The AutomationXP@CHI 2023 pilot preserves **20** DBLP `inproceedings` source entries plus one `proceedings` volume. The CEUR Vol. 3394 index lists **19** short papers and omits `short10.pdf`, yet that file is hosted and corroborated by workshop/institution evidence. The DBLP/organizer title uses “Physical Inputs”; the PDF/institution source uses “Physical Controls”.

**Keep these assertions separate:**
- `ceur_toc_listed=false` — observed for the checked index, **not** “never published”.
- `ceur_file_url_observed=true` and `workshop_programme_listed=true` — source observations, not acceptance or licence clearance.
- `ceur_volume_membership=disputed/open` — no categorical indexed-member assertion.
- Selected source title remains provisional; both title strings and original source keys stay preserved; no inferred DOI, automatic merge, or default main-CHI visibility.

An editorial response is **desirable follow-up evidence, not an absolute blocker** to separately verified records or unrelated normalization design/review. The affected record remains honestly unresolved. Do not delete it or claim a disputed fact as confirmed.

## 6. Public release, security and correction contract

The public API must eventually return **selected published-release facts only**, excluding staging, raw snapshots, internal rights disputes and private information. Propose provenance fields such as source label, source URL, snapshot/retrieval date if known, and availability/review status without inventing dates. Validate external URL destinations; prohibit `javascript:`, `data:`, `file:`, local/internal destinations and unsafe redirects. Any future server-side fetching needs separately reviewed SSRF defenses.

A release/correction should be versioned so prior selections remain reproducible for controlled audit, while a newly restricted asset/field can be withdrawn from current **public** responses. Exact SQL, release-pointer algorithms and error payloads remain proposals.

## 7. Future asset-enrichment release gate

Require separately authorized scope and evidence of (1) source URL and retrieval date; (2) exact work/appearance, file/copy/version and third-party exceptions; (3) positive licence, legal exception or permission for the intended use; (4) attribution, permitted modifications and commercial distribution; (5) security/URL/media validation and accessibility; (6) rights withdrawal and correction procedure; (7) positive, negative and regression tests. A CC BY document may be legally reusable but still intentionally **off** for Litervia until product approval.

## 8. Planned acceptance tests — **NOT RUN**

**MP-01–MP-04:** publish source-backed bibliography without abstract/media leakage; retain conflicting titles; keep workshop TOC dispute; expose unresolved DOI only as candidate.

**MP-05–MP-08:** handle authorless records and absent historical affiliations honestly; block unlicensed abstract reproduction and automatic PDF/image/video embedding.

**MP-09–MP-12:** verify conditional CC BY attribution and per-location licence checks; preserve collision appearances; withdraw restricted old-release assets from current public responses.

**MP-13–MP-16:** exclude unknown category from main defaults; reject unsafe URLs; version title selections without changing immutable source assertions; prevent public API access to private notes.

These are **design cases** only. No Laravel research endpoint, importer, asset media workflow, PostgreSQL catalogue schema/permission test, or UI test was executed for this policy.

## 9. Decision and execution boundaries

**APPROVED:** `PUB-01`–`PUB-06` and the non-blocking, still-disputed treatment of CEUR `short10.pdf` (owner approval, 2026-10-31).

**OPEN:** `PUB-07` class of implementation matters: canonical same-work merges, DOI resolution, contribution-track taxonomy, identity algorithms, physical database constraints/types, public API/search contract, individual publisher/asset permissions and external enrichment integration.

**NOT AUTHORIZED BY POLICY:** migrations, ingestion, scraping, external harvesting, new publisher-media hosting, application code changes, Issue closure, PR merge, branch deletion or deployment. Documentation synchronization is a separately authorized, bounded operation in Draft PR #14; no independent implementation validation is implied.
