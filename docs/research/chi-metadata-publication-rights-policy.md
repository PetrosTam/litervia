# Litervia — CHI Metadata Publication & Rights Policy


- **Status:** **APPROVED POLICY (PUB-01–PUB-06)**; implementation, individual asset permissions and the decisions explicitly identified below remain **OPEN / NOT RUN**.
- **Scope:** Initial public CHI 1982–2026 research catalogue, discovery, citation, provenance, external links and future content enrichment.
- **Authority:** Approved decision record associated with Issue #13; Product & Engineering Specification §§5–6, 8, 12; [ADR-0001](../architecture/adr-0001-chi-catalogue-identity.md); [Normalization Contract](chi-normalization-contract.md); [Issue #13](https://github.com/PetrosTam/litervia/issues/13).
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

| ID | Fixture / action | Measurable expected result | Related Issue AC |
|---|---|---|---|
| MP-01 | Run public-field fixture with observed DBLP `title, year, authors, DOI URL, pages` | These selected metadata facts render with source attribution; no abstract/full-text/media fields leak into response | AC-06/08 |
| MP-02 | Same paper, two source title assertions (FLUID-IoT) | Original assertion unchanged, alternative retained, selected title remains existing DBLP value until documented review | AC-04/05/06 |
| MP-03 | Kullmann workshop record with `short10.pdf` | Source category workshop; PDF external link allowed; TOC membership disputed; no asserted official acceptance or main-CHI default visibility | AC-03/05/06 |
| MP-04 | Unchecked DOI from `<ee>` | DOI marked candidate; no `resolved=true` or unverified primary assignment; valid external DOI link only | AC-04/06 |
| MP-05 | Three authorless pilot records | No synthetic author; empty byline and honest missingness | AC-04/06 |
| MP-06 | Historic author with current institution only | Work-specific country remains null; no country-filter inclusion | AC-03/06 |
| MP-07 | Publisher abstract returned by Crossref but licence not cleared | No raw abstract or paraphrased copyrighted text in public payload; outbound reference permitted | AC-06 |
| MP-08 | ACM/CEUR PDF link with unspecified asset rights | No automatic PDF mirror, embed, preview image or generated thumbnail | AC-06/07 |
| MP-09 | CC BY asset with approved explicit reuse exception | Required creator, source, licence link and modification statement rendered; without documented approval asset remains off | AC-06/07 |
| MP-10 | OpenAlex work labelled OA and `locations` have different licence values | Per-location values preserved; no global work-level hosting permission inferred | AC-06 |
| MP-11 | Duplicate title/year (TC groups) | Distinct appearances, DOIs and authorships retained; no same-work merge triggered | AC-04/07 |
| MP-12 | Restricted assertion referenced by old published release | Current public response suppresses restricted asset/field; private audit preserves original source/decision history | AC-06/07 |
| MP-13 | API requests unresolved/unknown category | Not in main default; accessible only via explicit unclassified/All selection, with no falsified track | AC-03/08 |
| MP-14 | Inject unsafe external URL `javascript:` / local URL | No rendered active outbound link or server fetch; safe invalid-link state | AC-06/08 |
| MP-15 | Source conflict resolved in a later release | Earlier fixed release still auditable; default public view uses newly approved selected title and evidence | AC-06/07/08 |
| MP-16 | Attempt to read private notes through public catalogue endpoint | Forbidden/absent private data; server-side authorization enforced | AC-08 |

These are **design cases** only. No Laravel research endpoint, importer, asset media workflow, PostgreSQL catalogue schema/permission test, or UI test was executed for this policy.

## 9. Decision and execution boundaries

**APPROVED:** `PUB-01`–`PUB-06` and the non-blocking, still-disputed treatment of CEUR `short10.pdf`.

**OPEN:** `PUB-07` class of implementation matters: canonical same-work merges, DOI resolution, contribution-track taxonomy, identity algorithms, physical database constraints/types, public API/search contract, individual publisher/asset permissions and external enrichment integration.

**NOT AUTHORIZED BY POLICY (post-merge):** Migrations, ingestion, scraping, external harvesting, publisher-media hosting, application code changes and deployment are **not** approved by PUB-01–PUB-06. The original four-file documentation-only [PR #14](https://github.com/PetrosTam/litervia/pull/14) merged as `4b6b681`; the separately reviewed [AC-09 evidence reconciliation](chi-source-evidence-identity-review.md#8-ac-09--final-evidence-reconciliation-and-open-decision-register-) was delivered in [PR #15](https://github.com/PetrosTam/litervia/pull/15), merged as [`d2f4eb1`](https://github.com/PetrosTam/litervia/commit/d2f4eb13ef14f9a15cef314f9c8ea97196035cd3), and expressly accepted by the project after post-merge verification. [Issue #13](https://github.com/PetrosTam/litervia/issues/13) is **CLOSED (9/9 retained pilot criteria)**; separate implementation authorization is not implied. No individual asset licence, external API ingestion workflow or runtime publication-control implementation has been validated.
