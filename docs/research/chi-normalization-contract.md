# CHI Normalization Contract — Source Records, Identity, Classification and Provenance

- **Project:** Litervia — Discover research. Explore knowledge.
- **Issue:** [#13](https://github.com/PetrosTam/litervia/issues/13)
- **Draft date:** 2026-10-31
- **Status:** **DRAFT CONTRACT / PROPOSED operational rules** based on the [APPROVED ADR baseline](../architecture/adr-0001-chi-catalogue-identity.md). This document is **not** an authorized ingestion specification or physical migration plan.
- **Sources of truth:** Product Engineering Specification §§5–6, 8, 12; Master Project Instructions Stage 02; Engineering Playbook; dated DBLP source manifest; sampled CSV/manifest; GitHub Issue #13 and PostgreSQL foundation. See [reference register](#12-reference-register).
- **Evidence companion:** [Source Evidence & Identity Decision Review](chi-source-evidence-identity-review.md) (five candidate pairs and AutomationXP 2023). It records **source-level findings**, not approval to consolidate canonical works.
- **Publication policy:** [Metadata Publication & Rights Policy](chi-metadata-publication-rights-policy.md) — **PUB-01–PUB-06 APPROVED by owner on 2026-10-31**; physical implementation and any per-asset reuse clearance remain OPEN.

## 1. Normative language and evidence classes

**MUST / MUST NOT** below express the *proposed acceptance contract* that implementation must satisfy **after approval**, not a claim that any implementation exists. **APPROVED** names owner-approved product/architecture policy; **VERIFIED** means supported by actual uploaded source artifacts or read-only repository evidence; **PROPOSED** means not approved as a final algorithm, SQL model or API response; **OPEN** identifies a blocked decision; **NOT RUN** denotes tests not executed. **Observed source values** are not equivalent to publisher-confirmed facts. **UNKNOWN** is not `null` masquerading as a verified absence.

Source lineage has four scopes: source publication/retrieval evidence; snapshot-file identity; individual source-record identity; derived field assertion and the review that selected it. A source author's name/ORCID claim is not automatically a verified person identity.

### Verified input manifest (not to be recalculated or altered by this document)

| Artifact / measure | Value and limitation |
|---|---|
| Official DBLP snapshot date | `2026-10-03` |
| Archive SHA-256 | `20e45961bec5610dc07b8e932ccd27a2387534cfa12c92a24289fe873aebe969` |
| DTD SHA-256 | `03ec35cb34a4227572a0e89da407b06b6e44a6cc23e19cabc3b49b702a5f897d` |
| Derived CHI CSV SHA-256 | `765cc206350ff14c11c67047c3325f9c7445ca9c43ddb3806deaaa90966c564c` |
| DBLP scan / CHI selection | 12,998,506 top-level; 28,870 selected; 28,775 `inproceedings`, 95 `proceedings` |
| 150-record pilot CSV SHA-256 | `34360f4b1470213cf5f9c52b5bba9179bc07b1fb6b7fbcff860a087` |
| Sample size and shape | 150 unique keys; 134 `inproceedings` + 16 `proceedings`; 68 provisional main, 41 EA, 5 companion, 20 unclassified, 16 volumes |
| DOI candidates in pilot (`<ee>` host-checked URLs) | 127 records with one, 22 with zero, 1 with two; of the 22 zero, 21 `inproceedings`, one volume |
| Special cases | Five pairs `TC-001`, `TC-002`, `TC-071`, `TC-140`, `TC-141`; three authorless `inproceedings` |
| Pilot selection method | Selector `1.0.0`; seed `litervia-chi-pilot-150-v1-2026-10-03`; mandated edge cases plus quotas and stable SHA-256 ranking |
| Earlier historical audit | 13,022,717 scanned records in an older snapshot; not proof of row-level equivalence |

The complete dated DBLP snapshot and derived CSV are on the owner's Windows machine under `C:\Dev\LiterviaResearchData` **outside Git**. They have **not** been opened from that Windows filesystem in this documentation step. The uploaded 150-record pilot was directly checked; the full 28,870-row CSV count relies on the recorded, owner-executed source audit and manifest, not a new local full-import run.

## 2. Catalogue entity and cardinality contract

| Entity / typed relation | Essential fields (logical, not migration types) | Cardinality and required invariants |
|---|---|---|
| `source_snapshots` | `id`, `provider`, `snapshot_label`, `source_doi`, `archive_sha256`, `dtd_sha256?`, `retrieved_at?`, `license_evidence` | `source_snapshots 1 -> many source_records`; `(provider, archive_sha256)` unique when present. **Extractor/selector method versions belong to derived manifests and ingestion runs, not the immutable upstream snapshot's identity.** |
| `source_records` | `id`, `snapshot_id`, `source_record_key`, `record_kind`, `source_attributes_json`, `source_fields_json`, `source_ordinal`, `serialized_record_hash`, `hash_algorithm_version` | Unique `(snapshot_id, source_record_key)`; preserve exact *exported* values and ordering. **Do not claim this JSON is a byte-exact original XML fragment.** |
| `conference_editions` | `id`, `conference_family`, `year`, `evidence_status`, verified event facts | No fabricated 1984 edition; source zero vs historical fact kept separate |
| `proceedings_volumes` | `id`, `edition_id?`, `title`, `source_category`, `category_evidence`, `membership_status` | One volume is not a paper; workshop may be a different event with separately evidenced `colocated_with` link |
| `research_works` | Immutable `id`, `identity_state`, current display-selection reference, `retired_at?` | Canonical ID never derived from source title/DOI and never reused after merge/redirect |
| `work_appearances` | Immutable `id`, `work_id`, `volume_id?`, `source_year`, `contribution_type`, `classification_state` | Exactly one current work; multiple appearances per work permitted; volume nullable if unresolved |
| `source_record_bindings` (**PROPOSED physical shape**) | `id`, `source_record_id`, `appearance_id?`, `volume_id?`, `binding_state`, `evidence_id`, `superseded_by?` | Exactly one non-null typed target **per binding**; zero/one active binding per source observation with historical mappings retained. Reject `proceedings` -> appearance and `inproceedings` -> volume; a simple same-row CHECK cannot enforce cross-table record-kind rules. |
| `authors` | `id`, `display_name`, `identity_state` | No name-only uniqueness; a canonical author may remain unresolved |
| `appearance_authorships` | `appearance_id`, `source_record_id`, `position`, `original_name`, `source_attributes_json`, `author_id?` | One row per observed byline position; enforce stable ordered sequence **within its source context**; do not collapse differing snapshot bylines |
| `external_identifiers` (**PROPOSED physical shape**) | `id`, `scheme`, `raw_value`, `normalized_key?`, `source_record_id?`, `provider_evidence_id?`, `work_id?`, `appearance_id?`, `volume_id?`, `author_id?`, `institution_id?`, `review_state` | Exactly one typed owner FK; **at least one valid provenance anchor** (snapshot source record or separately recorded provider evidence); scheme-to-owner validation and FK enforcement; **no global DOI uniqueness**. |
| `source_field_assertions` | `id`, typed owner, `field_key`, original value/JSON, `source_record_id?`, `retrieved_at`, `availability`, `review`, `rights`, `evidence_ref`, `selection_state` | Allow contradictory claims; require evidence for selected/public facts; do not overwrite history |
| `identity_decisions`, `classification_decisions` | `id`, typed subject(s), proposed decision, evidence link, reviewer, time, supersession/reversal | Every confirmed mapping has an auditable decision or an explicit deterministic source-key contract |
| `appearance_relationships`, `work_relationships`, `work_redirects` | Typed endpoints, relation type, decision/evidence, timestamps | Preserve distinct appearance IDs; no self-link or cycles; permanent ID redirects are not deletion |
| `ingestion_runs`, `ingestion_record_results` | Run identity, source and contract versions, input hashes, staged/accepted/rejected counts, errors | Fail closed; every source record has one reconciled processing outcome in a completed run |
| `catalogue_releases`, `catalogue_release_items`, proposed `catalogue_release_volume_items` | Release status, run(s), checksum/decision-set, active pointer, versioned appearance **and volume** membership; selected display assertions, byline and decision revisions pinned by release (via mapping or immutable manifest) | Only validated completed revisions can be published; public queries never read staging or mutable latest-assertion records without release scoping |

**Optional, deferred until evidence exists:** `institutions`, `authorship_affiliations`, `work_recognitions`, `work_media`, field rights policies and provider-specific enrichment adapters. Do not create or populate speculative historical affiliation, award, video or abstract data. Implementing these optional entities is not a prerequisite to source-only catalogue truthfulness.

**Typed-FK design clarification:** Do not implement unvalidated `entity_type, entity_id` pairs with no foreign keys. A single identifier/assertion table *may* use explicit nullable FKs plus `CHECK (num_nonnulls(...) = 1)` (PostgreSQL), with scheme/target validation and per-scheme partial indexes; alternatively use dedicated per-entity tables if complexity/performance demands. A same-row `CHECK` can enforce an XOR owner/target but **cannot establish that an owner type matches a referenced row's record kind**: that requires a schema design that makes the combination enforceable (e.g. distinct binding tables/composite keys or carefully reviewed triggers) and negative database tests. This is a proposed *physical* choice, not an approval to expand the database now. Do not mix work-level and appearance-level identifiers in one uniqueness scope without a documented reason.

## 3. Normalization invariants (machine-checkable after approval)

**N-01 / Raw immutability:** The XML gzip, DTD, source export and original manifests MUST remain unchanged. Import reads with verified SHA-256 and a manifest/version match; mismatch blocks publication. Re-export into an existing evidence filename is forbidden. Source-record JSON reflects exported fields, not an asserted lossless reconstruction of XML syntax.

**N-02 / Record identity:** Only `(provider, snapshot_id, source_key)` identifies a specific source-record observation. `source_key` is never an internal work key. Exactly one staged outcome per source record; duplicate keys within the same snapshot are rejected, not silently consolidated.

**N-03 / Year and kind:** The pilot source selection used explicit `year` 1982–2026 and allowed `inproceedings` / `proceedings`. Treat `proceedings` as volumes, never in research-work result counts. Unknown or absent year must be flagged; never inferred from title/key. Do not create an unsupported CHI 1984 edition.

**N-04 / Appearance identity:** Default to separate appearances for distinct `inproceedings` keys. Exact same source-key observation on rerun reuses its existing mapping; for a new snapshot, map by its verified provenance-qualified key **only if** kind, identifiers, venue and salient source facts remain compatible. A substantive conflict enters quarantine. New title/year match alone never changes mappings.

**N-05 / Work identity:** Initial one-work-per-appearance is a **PROPOSED conservative bootstrap**, not a deduplicated scholarly count. Work merging/linking only follows approved review and retains old IDs via redirects; no merge happens as a side effect of DOI normalization or a new Crossref/OpenAlex claim.

**N-06 / Byline:** Preserve author order and the exact source-provided names/attributes (including disambiguation suffixes) per appearance/source context. For authorless source rows, create no synthetic person and record `observed` missing-author-elements as a source fact (not “anonymous author”). Person-level `author_id` is nullable until reviewed.

**N-07 / Missingness:** `observed` = explicit source value present; `unknown` = value genuinely not established; `not_checked` = enrichment not attempted; `not_applicable` = structurally inapplicable after justified rule. Do **not** map a null or missing tag to `not_applicable` without evidence. Missing DOI URL in DBLP `<ee>` is *not* proof of no DOI in the world.

**N-08 / Contradictions:** Multiple source values (e.g. competing titles) remain separate assertions. Select a display value by documented source priority plus case-specific review; keep alternatives and rationale. Record existence, validity, completeness, publication date and availability are distinct statuses.

**N-09 / Rights:** Publishing an enrichment field requires documented permission/rights status. A link to a PDF or media source is not a rehosting license; publisher abstract text, full text, images, and video are excluded by default until permitted. Store only safe identifiers and selected metadata in public responses.

**N-10 / Release isolation:** Stage, validate and publish as separate operations. Failed/partial stage must not alter the published result set. Promotion and rollback require a local atomic boundary on the **catalogue** database; do not assume a transaction spanning `litervia_catalogue` and `litervia_private`.

**N-11 / Read-only runtime:** The Laravel public catalogue connection must have grants only for approved published reads; ingestion is a restricted, separately authenticated write workflow. Database constraint and permission tests are required; passing PHP tests with in-memory SQLite is not evidence of PostgreSQL authorization.

**N-12 / Counts:** Counters MUST distinguish source records, appearances, canonical works, proceedings volumes, classified types, and published/reviewed coverage. Use only evidence-supported labels (e.g. “source entries” rather than “full technical papers”). Never compute work counts by blindly joining many-to-many authorships/DOI arrays.

**N-13 / Binding history and kind:** Each source-record observation MAY have zero or many binding history rows but MUST have no more than one active mapping. Each active mapping MUST have exactly one valid, type-compatible appearance-or-volume target; a disputed mapping MUST be reversible without rewriting the original source record or silently changing existing Litervia IDs. Re-importing the same source observation MUST not create duplicate active bindings.

**N-14 / Reproducible publication:** Each published catalogue release MUST resolve to a fixed set of appearance and proceedings-volume memberships, selected display assertions, author/byline presentation and reviewed classification/identity decisions. A later enrichment or changed claim MUST NOT change the observable results of an earlier released revision. Exact physical mapping strategy remains OPEN.

## 4. DOI and typed identifier contract

### 4.1 Source extraction vs. canonical resolution

The current extractor's `doi` field is sourced from explicit `<doi>` elements; in the selected `inproceedings` source these can be absent even when DOI URLs exist in `<ee>`. The `ee_json` field is a list of electronic edition URLs; it must be retained without lossy replacement. `doi_candidates_json` represents **recognized URI candidates**, not resolvable verified DOI registrations, not canonical DOI selection, and not unique published works.

**PROPOSED normalization algorithm for review (not executable importer code):**

1. Preserve `raw_value`, exact source tag/attribute/URL, and source record ID.
2. Detect only explicitly supported DOI forms (`doi.org`, `dx.doi.org`, URL or `doi:` prefix as separately tested); reject other hosts and deceptive lookalikes. URL-parse, strip only the known DOI resolver prefix, and decode at most those percent-encodings that safely represent DOI path characters under a versioned parser rule. Do not drop meaningful punctuation, query/fragment characters without documented handling, or a non-ASCII character on assumption.
3. Validate a DOI-looking candidate using a documented syntax rule, **not** a “DOI resolves” flag. Keep malformed candidates as raw assertions with `invalid_candidate` state; never silently drop them.
4. Create a lookup key under a versioned, explicitly tested case-equivalence rule; keep the original spelling. DOI identity/ownership confirmation and primary DOI selection are separate review steps.
5. If two distinct DOI candidates are present, store both and mark `primary_doi = undetermined` unless a reliable publisher/registration source clearly distinguishes roles.
6. Do not `UNIQUE(doi)` across all works, appearances and volumes. Scheme-specific conflicts become review events; identical candidate strings do not mandate a work merge.

**Typed identifiers:** `dblp_key` belongs to a source-record namespace and versioned snapshot; `doi` generally describes a specific publication or volume, subject to publisher evidence; `orcid` describes an asserted person identity; `ror` describes an asserted institution; `openalex_work`, `openalex_author`, and legacy CHI 2023 IDs are source-scoped candidate identifiers, not canonical Litervia IDs. Reject incompatible owner/scheme combinations by database checks plus validation. Record normalized key *and* original value, scope, validation state, provenance, and selection status.

### 4.2 Explicit DOI fixtures

| Source case | Observed from pilot | Expected handling |
|---|---|---|
| `conf/chi/Shneiderman89` | Two recognized `<ee>` DOI candidates | Preserve both; no arbitrary primary DOI or automatic merge |
| `conf/chi/Kullmann0HC23` | Workshop record with no recognized DOI URL, PDF URL present | Preserve PDF link as electronic-edition evidence; DOI remains unknown/not checked externally |
| `conf/chi/HerbstWZ23`, `HerbstWZ23a` | Two appearances with distinct DOIs in main/EA volumes | Remain distinct; relation requires review |
| `conf/chi/RhedenAME25`, `RhedenAME25a` | Two EA appearances, different DOI and page spans | Remain distinct; do not decide track solely from page count |
| `conf/chi/MankoffHA00`, `Mankoff00` | Main and EA with different author lists | Distinct author orders; candidate relation only |

## 5. Contribution taxonomy and evidence contract

### 5.1 Orthogonal dimensions

| Dimension | Allowed initial values / guidance | Policy |
|---|---|---|
| `record_kind` | `inproceedings` / `proceedings` (source); mapped to `appearance` / `volume` | Observed source fact; never call the latter a paper |
| `source_category` | `main_chi`, `extended_abstracts`, `companion_adjunct`, `workshop_colocated`, `unknown_unverified` | Derived from verified volume membership, not title heuristics alone |
| `contribution_type` | `technical_paper`, `poster`, `demo_interactivity`, `video_showcase`, `course`, `case_study`, `other_verified`, `unknown` | **PROPOSED** vocabulary; type claims require publisher/conference evidence; more types may be needed |
| `membership_status` | `confirmed`, `disputed`, `unverified`, `not_applicable` | Tracks actual belonging to edition/volume and disputed index entries |
| `classification_review` | `candidate`, `approved`, `rejected`, `needs_evidence` | Independent of source parsing success |

**APPROVED discovery policy:** verified `main_chi` appearances are selected by default. Users may opt into EA, Companion and workshops; All/Unclassified exposes unresolved records. `source_category = unknown_unverified` never silently qualifies for main defaults. A documented `proceedings` volume is not returned as a paper. A `technical_paper` filter is disabled unless its claims have been individually validated.

### 5.2 Specific classification fixtures

| Case | Source observation | Evidence-aware state | Gate |
|---|---|---|---|
| Pilot provisional main (68) | `booktitle` heuristic | Source grouping **provisional**; contribution `unknown` | Verify volume identity/official source before `main_chi` approval |
| Pilot provisional EA (41) | Source title indicates EA | EA candidate; contribution type `unknown` | Verify proceedings membership, not EA-as-document-type inference |
| Historical Companion (5) | `CHI Conference Companion` | Companion candidate, separate appearances | Confirm volume/edition mapping |
| AutomationXP@CHI 2023 (20 paper rows + 1 volume row) | The selector retains `unclassified_booktitle` for the 20 original `inproceedings`; one additional `proceedings` record represents the volume; none of the 20 paper rows has a recognized `<ee>` DOI URL | **VERIFIED** source category `workshop_colocated` from CEUR 3394 and the organizer programme; **19** TOC-linked entries; `Kullmann0HC23` is organizer-listed and CEUR-hosted as `short10.pdf` but **absent from CEUR TOC**; its final indexed-volume membership is **OPEN** | Preserve all 21 source rows and both title assertions (“Physical Inputs” and “Physical Controls”); do not change original CSV; keep the volume out of paper counts; obtain editorial clarification ([review](chi-source-evidence-identity-review.md#3-automationxpchi-2023--reconciliation)) |
| Pilot `proceedings` (16) | Source record type `proceedings` | Count as volume records only | Evidence-backed volume grouping |
| 1984 | Zero selected source records for that year | No fabricated source-backed records or edition | Do not state global historical nonexistence |

**Publication-count reporting:** expose `source_record_count`, `appearance_count`, `canonical_work_count` and `volume_count` separately. The 28,870 selected source rows include 95 volume rows. Do not call 28,870 “full papers”; do not call 28,775 “independently resolved unique works”.

## 6. Field-level provenance and rights matrix

| Field family | Initial source/evidence | Missingness and quality rule | Rights/publication decision |
|---|---|---|---|
| DBLP key, source type, year, title, booktitle, pages | Dated DBLP XML / derived source fields | `observed` if present; source conflict retained; year not inferred | DBLP metadata CC0; display with attribution/source link recommended |
| Ordered authors, editor attributes, ORCID claims | DBLP `<author>`/`<editor>` attributes | Preserve order, raw names; canonical identity `unknown` until corroborated | Bibliographic assertions may be displayed; do not falsely certify identity |
| DOI and electronic-edition URLs | DBLP `<doi>` if any, `<ee>` URLs and future publisher/registration evidence | Candidate vs resolved DOI vs selected DOI are distinct | Metadata links allowed subject to safety/URL checks; never claim link availability without validation |
| Venue, volume, category and membership | DBLP `booktitle` plus official CHI/ACM or CEUR-WS evidence | Unverified defaults to `unknown_unverified`; conflict tracked | Display verified label and supporting source; no implied conference endorsement |
| Contribution type (paper/poster/demo/video) | Official track/program metadata, never a volume-name guess | `unknown` unless individually supported | Label only with cited, dated evidence |
| Abstract | Future Crossref/OpenAlex/publisher, if allowed | `not_checked` initially; do not fabricate summaries as source text | **Rights review required**; do not republish publisher text by default |
| Authorship affiliation, institution and country | Future verified work-specific raw affiliation; ROR/OpenAlex candidate mapping | Nullable per **authorship and work**, not assumed from current author profile | Only provenance-backed claims; do not infer country from name |
| Awards/recognitions | Official SIGCHI/ACM award records | `not_checked` until work-specific corroboration | Distinguish award from funding grant; link and rights review |
| Images, video, PDF/full text | Official publisher/creator/provider; provenance of each asset | `not_checked` vs `unavailable` vs verified access clearly separated | No rehosting/embedding without rights and usage review; URLs alone not permissions |
| Legacy CHI 2023 IDs | Optional imported comparator with verified mapping | Untrusted mapping until reviewed | Never use legacy integer ID as canonical work ID |

**Required assertion envelope — PROPOSED:** `assertion_id`, target typed FK, `field_key`, `raw_value_json`, optional `normalized_value_json`, `provider`, `source_snapshot_id?`, `source_record_id?`, source URL/record identifier, `retrieved_at_utc`, `evidence_checked_at_utc?`, `availability_state`, `review_state`, `rights_state`, `selection_state`, `decision_id?`, `superseded_by?`. For offline DBLP data, `retrieved_at_utc` should not be fabricated when only the snapshot date is known; store the available source/snapshot date and an explicit unknown retrieval time. Provenance of a derived assertion may refer to its derivation/run; **do not invent a human reviewer** for automatic parsing.

**Policy versus implementation:** The owner APPROVED PUB-01–PUB-06 on 2026-10-31. The proposed SQL/API rights-state values `permitted_metadata`, `permission_required`, `restricted`, `unknown`, `not_applicable` remain **PROPOSED / NOT IMPLEMENTED**; their exact enum/table representation requires approval. Record evidence and interpretation date; do not copy a source metadata licence to third-party assets.

## 7. Collision/identity decision register (source evidence reviewed; canonical identity OPEN)

The [dated Source Evidence & Identity Decision Review](chi-source-evidence-identity-review.md) is the supporting evidence register, including DOI, author order, page spans, provenance URLs, the 20-paper AutomationXP crosswalk and proposed EV-01–EV-11 fixtures. These source-level findings **do not** constitute approval of any `same_work_confirmed` decision. **Exactly ten distinct collision source records/appearances remain preserved.**

| Decision ID | Case / source keys | Source-level evidence now established | Current decision and remaining gate |
|---|---|---|---|
| `ID-TC-001` | `Ogozalek94a` / `Ogozalek94` | Main CHI 1994, pp. 65–71, vs one-page Companion p. 203; different DOI assertions | **VERIFIED:** distinct appearances. **OPEN:** publisher-supported same-work relationship. Candidate relation only; no merge. |
| `ID-TC-002` | `IrvingPI94a` / `IrvingPI94` | Main CHI 1994, pp. 344–350, vs Companion p. 224; ordered bylines match, DOI differ | **VERIFIED:** distinct appearances. **OPEN:** whether/how these versions relate at canonical work level. |
| `ID-TC-071` | `MankoffHA00` / `Mankoff00` | Main CHI 2000 three-author byline vs EA single-author byline; different DOI/pages | **VERIFIED:** distinct appearances and author conflict. **OPEN:** work identity; no overwritten authorships. |
| `ID-TC-140` | `HerbstWZ23` / `HerbstWZ23a` | HUGO main CHI 2023 vs Extended Abstracts; same three bylines, different DOI/extents | **VERIFIED:** distinct appearances. **PROPOSED:** related candidate. **OPEN:** canonical relation pending publisher/content review. |
| `ID-TC-141` | `RhedenAME25` / `RhedenAME25a` | GestureSock EA article 731 / DOI `10.1145/3706599.3721114` and article 914 / DOI `10.1145/3706599.3721350`; independent programme/institution evidence supports Interactivity and Video Showcase respectively | **VERIFIED:** distinct appearances, separate evidence-backed track assertions (stronger direct DOI-to-Video evidence for article 914). **OPEN:** same-work status; no merge. |
| `ID-AUT23-CAT` | AutomationXP@CHI 2023 (`conf/chi/2023axp` + 20 paper keys) | Official CEUR-WS Vol. 3394 confirms workshop co-located with CHI, with 19 TOC short papers | **VERIFIED:** `workshop_colocated` source category; source pilot's historical `unclassified_booktitle` values remain unchanged. |
| `ID-AUT23-TOC` | `Kullmann0HC23`, CEUR `short10.pdf` | DBLP record + workshop programme + hosted PDF; **not** listed among 19 CEUR TOC papers | **OPEN / DISPUTED:** indexed-volume membership, pending editorial answer. Do **not** equate TOC absence with absence of a paper or assert final acceptance. |
| `ID-AUT23-TITLE` | `Kullmann0HC23` | DBLP/organizer title says “Physical Inputs”; hosted PDF/institutional record says “Physical Controls” | **VERIFIED:** conflicting source assertions. **OPEN:** preferred display title; preserve both and their source links. |

**Decision envelope — PROPOSED:** `case_id`, typed subject IDs, `decision_type`, `status` (`candidate/confirmed/rejected/reversed`), reviewer identity, timestamp, source URLs/checked dates, snapshot IDs, rationale and superseding decision link. The verified decision here is **separate appearance identity**, not canonical work equivalence. No inferred reviewer signature or editorial response may be invented.

**Evidence scope update:** The [companion source-evidence register](chi-source-evidence-identity-review.md#6-seven-year-comparison-register-14-cases) now includes **14 cases / two in each seven mandatory pilot years**, copied from the source-attributed owner evidence package with its original quality labels. Numeric comparison coverage does **not** establish publisher completeness, DOI resolution or per-asset rights. SC-05/06 need stronger primary-source checks; SC-09/12/14 retain documented conflicts or limitations. See T-17 and the open AC-05 review gate.

## 8. Import, reconciliation, release and recovery contract

1. **Preflight:** Verify exact input artifact hashes, selector/extractor method versions, column schema, UTF-8/JSON validity, expected record count, source ranges, and selected record unique keys. Refuse overwrite of existing immutable evidence. Do not reveal credentials or full private records in logs.
2. **Staging:** Use restricted separate writer credentials. Insert versioned source observations and per-record validation results; visible API reads only the active published release. Rejected rows must be visible to the administrator's audit but not as validated catalogue results.
3. **Identity mapping:** Prefer existing source-key mapping and immutable Litervia IDs. For a changed snapshot with changed material assertions, raise a reconciliation event rather than updating reviewed metadata or merging works by coincidence.
4. **Reconciliation:** Assert expected source/volume row counts and staged accepted/rejected totals; check DOI candidate preservation, author positions, membership statuses, categories, conflicting crosswalks, rights and missingness. A completed ingestion can have reviewed rejections, but a release must satisfy separately approved completeness thresholds.
5. **Release candidate:** Persist the exact set of appearance **and source-backed proceedings-volume** identifiers, plus a deterministic manifest or typed mappings to the selected field assertions, display bylines and decision versions. A change of title, classification, volume membership or byline presentation creates a new public revision; historical published releases must not read mutable current-selection flags.
6. **Promotion:** In one catalogue-database transaction, verify validated release and switch the single active pointer (guarded against concurrent promotion). On failure, old published release remains active. No assumption of atomic transaction over catalogue and private DB.
7. **Rollback:** Switch to a prior valid release through an audited command and preserve failed/previous run evidence. Explicitly test interrupted stage and promotion, rollback and retry.
8. **Idempotence:** Re-running identical artifact+contract on the same baseline is a no-op for identity mapping, published membership, original fields and canonical IDs. Use database uniqueness plus importer checks; `ON CONFLICT` alone is not a complete identity policy.

**Grant contract:** catalogue runtime principal: `SELECT` only on approved published relations/views, no `CREATE`, `INSERT`, `UPDATE`, `DELETE`, no staging or raw-evidence access. Independently test view owner/base-table permissions, `security_invoker`/`security_barrier`, function EXECUTE rights, sequences, schema grants and alternate SQL access paths; a view's name alone is not a security boundary. Separate importer principal: least-privilege limited write access, never available to web requests. Migrator: DDL only in authorized migration context. Private app role: no rights on catalogue DB; private authorization remains Laravel server-side. Existing PostgreSQL foundation confirms separate DBs/roles, **not** these future table grants.

## 9. Observable acceptance tests (design/fixtures only — NOT RUN)

The following tests are measurable contracts for **later** execution. All are **NOT RUN** against PostgreSQL/importers until a separately approved issue.

| Test ID | Input / action | Pass criteria | Issue #13 mapping |
|---|---|---|---|
| T-01 | Import pinned 150 pilot rows after verified preflight | 150/150 distinct source observations; 134 appearances and 16 volume observations (unless documented reviewed rejects); no `proceedings` work | AC-01,02,04,07 |
| T-02 | Import same fixture twice | No additional source records/work/appearances; all first-run Litervia IDs identical; no new active release absent a substantive change | AC-04,07 |
| T-03 | Tamper one CSV byte / alter archive or DTD hash | Preflight aborts with nonzero exit; active release unchanged; audit error recorded | AC-01,07 |
| T-04 | Five TC collision pairs | All 10 keys retained; no auto-merge; separate DOI, venue, author lists retained; relationship undecided until evidence | AC-03,04,05 |
| T-05 | `Shneiderman89` multi DOI | Exact distinct candidate count = 2, both raw origins retained; primary DOI undetermined | AC-04,06 |
| T-06 | 3 authorless fixtures | Exactly zero invented authors; source observed missing tag; other authors unaffected | AC-04,06 |
| T-07 | Pilot missing DOI fixtures | 21 `inproceedings` lack recognized `<ee>` DOI (22 records including one volume); no claim `DOI does not exist` | AC-04,06 |
| T-08 | Classify 20 AutomationXP `inproceedings` + 1 proceedings volume | None of the 20 paper rows appears in main defaults; workshop category only when supported by volume/event evidence; the one volume is not counted as a paper; `Kullmann0HC23` remains disputed | AC-03,05,06 |
| T-09 | Call default discovery vs explicit EA/Companion/Workshop/All | Default returns only verified main eligible appearances; other categories included only by explicit filters; volume rows excluded | AC-03,08 |
| T-10 | Contradictory sourced title and person claims | Multiple assertions retained; selected display value cites decision; no silent author-name dedup | AC-04,05,06 |
| T-11 | Import interrupted halfway / failed publisher checks | Staging unexposed; active release ID and counts unchanged; failed-run evidence available | AC-07 |
| T-12 | Promote valid candidate / then roll back | Exactly one active release at every committed state; restoration to prior release without changing source IDs | AC-07,08 |
| T-13 | Runtime catalogue principal attempts INSERT/UPDATE/DDL and staging SELECT | All denied by PostgreSQL permissions; published SELECT works; no migrator credential in HTTP env | AC-07,08 |
| T-14 | Private database references deleted/redirected work | API resolves approved acyclic redirect or refuses invalid ID without data disclosure; cross-user ownership always enforced | AC-04,08 |
| T-15 | Missing 1984 source year / long titles / invalid DOI URI | No fabricated edition/abstract; safe nullability, consistent counts, valid predictable errors | AC-03,06,08 |
| T-16 | Wrong UTF-8, malformed JSON, repeated same-snapshot key, wrong kind/owner | Structured rejection; no partial publication or overwritten original evidence | AC-01,07 |
| T-17 | At least 2 records per each of 7 mandatory years + 5 collision pairs | Each has dated source comparison, evidence URL and finding; unresolved conflict explicitly marked OPEN. [Targeted review](chi-source-evidence-identity-review.md) is **partial evidence**, not proof that the seven-year requirement passed | AC-05,09 |
| T-18 | Cross-database boundary and release counts | No cross-store SQL transaction assumption; counts independently reconcile source/appearance/work/volume; no row multiplication by authorship joins | AC-07,08 |
| T-19 | Supersede a valid source binding; attempt incompatible kind/target and duplicate active bindings | Original source observation and prior decision remain unchanged; only one active binding; kind mismatch and duplicate active binding fail at a PostgreSQL-enforced boundary, not only an HTTP validation branch | AC-04,07,08 |
| T-20 | Publish revision A, enrich a byline/title/volume membership, publish B, then roll back to A | Revision A reproduces its exact appearance+volume counts, classifications, author display and selected assertions; no unapproved latest-value leakage | AC-06,07,08 |
| T-21 | Runtime SELECT through published views vs direct staging/raw/sequence/function access | Only intended published fields are visible; disallowed base/DDL/write paths fail with expected authorization errors; view ownership and security options independently inspected | AC-07,08 |

**Evidence notation when executed:** record command + environment + source hash + expected and observed result; classify `EXECUTED PASS`, `EXECUTED FAIL`, `BLOCKED`, `STATIC REVIEW`, or `NOT RUN`. Design tables in this document are not executed tests. Requirements in the issue remain unchecked until all supporting evidence is linked and approved.

## 10. Open decision gates and handoff

| Priority | Item still needing approval or external evidence | Owner of gate / next proof |
|---|---|---|
| P0 | Five collision identities/relationships; whether same work or related/different appearances | Bibliographic reviewer + official proceedings source reconciliation |
| P0 | Verify source-volume/category crosswalk and historical CHI editions without implying technical-paper type | Source comparisons with CEUR/ACM/SIGCHI, dated evidence |
| P1 | CEUR `short10.pdf` TOC membership / title conflict **OPEN** but non-blocking for unrelated verified records | Editorial clarification desirable as follow-up; preserve disputed provenance and do not claim final acceptance |
| P0 | Final ID normalization algorithms and typed FK/uniqueness policy | Dedicated design approval plus negative/ambiguous DOI tests |
| P0 | Per-asset / per-source rights for any future abstracts, media or enrichment (**general PUB-01–PUB-06 publication policy APPROVED**) | Copy/version-specific licence, provenance and separate implementation owner approval |
| P0 | Exact physical schema, catalogue writer/grants and promotion atomicity | Reviewed migrations on disposable PostgreSQL, database permissions tests |
| P1 | Author/institution disambiguation policy incl. ORCID/ROR conflicts | Verified work-specific affiliations, no blanket profile inference |
| P1 | Public API filter naming, collation, sort/pagination and indexes | Separately approved API contract and EXPLAIN/feature tests |
| P1 | Publishing thresholds and release approval authority | Reconciliation fixture and owner decision |
| P1 | Private references, redirects and consistency repair under work mergers | Server-side authorization/integrity tests in private DB |

**Documentation review gate (2026-11-01):** The initial four-file design/policy package was merged as [PR #14](https://github.com/PetrosTam/litervia/pull/14) / `4b6b681`. [Issue #13](https://github.com/PetrosTam/litervia/issues/13) has owner-accepted **AC-01–AC-08**; **AC-09/AC-10 remain OPEN**. The [AC-09 dated evidence and open-decision register](chi-source-evidence-identity-review.md#8-ac-09--final-evidence-reconciliation-and-open-decision-register-2026-11-01) records exact pilot reproducibility and supplemental primary/institutional comparisons without approving canonical merges or silently altering historical source labels. Design-only importer/recovery/identity and PostgreSQL security fixtures remain **NOT RUN**. A documentation review/merge is not authorization for schema migrations, source enrichment or ingestion; CEUR `short10.pdf` remains disputed/non-blocking for unrelated verified records.

## 11. Short risk register

| Risk | Severity | Control |
|---|---|---|
| Erroneous merge destroys work-specific authorship / private references | Critical | Separate identities; review and redirects; no implicit cascade deletion |
| Workshop paper counted as main CHI technical paper | High | Verified venue/volume mapping plus default category gate |
| Missing DOI conflated with unregistered DOI | High | Candidate vs resolved vs unknown states |
| Publisher content copied under DBLP CC0 | High | Field-level rights restrictions and enrichment allowlist |
| Partial import or concurrent promotion reaches public APIs | High | Stage/release separation and atomic pointer tests |
| Overbuilt joins and slow discovery | Medium | Lazy optional schema, indexes/query benchmarks, no unneeded RDF stack |
| Ambiguous country based on author profile | Medium | Work-specific raw affiliation, nullable institution/country, explicit provenance |

## 12. Reference register

**Project and artefact evidence (no public URL):**

- `Litervia_Product_Engineering_Specification.pdf` §§5.1–6.4, 8, 12 and the project's Master Instructions / Engineering Playbook.
- `Litervia_CHI_1982_2026_Record_Level_Audit_Report.pdf` and the related coverage/collision CSV files; historical audit is distinct from the new snapshot.
- `chi_pilot_150_records_2026-10-03.csv` and `chi_pilot_150_manifest_2026-10-03.json` (locally supplied and checked); full DBLP source and derived CSV remain outside Git.
- [Source Evidence & Identity Decision Review](chi-source-evidence-identity-review.md) — dated source-level observations and the still-open case register; no canonical merges authorized.
- [Metadata Publication & Rights Policy](chi-metadata-publication-rights-policy.md) — PUB-01–PUB-06 approved 2026-10-31; per-asset clearance and physical rules remain open.
- [GitHub Issue #13](https://github.com/PetrosTam/litervia/issues/13), [PostgreSQL Foundation](https://github.com/PetrosTam/litervia/blob/main/docs/postgresql-foundation.md), [current README](https://github.com/PetrosTam/litervia/blob/main/README.md).

**Official external technical/research references (accessed 2026-10-31):**

- [DBLP copyright / CC0](https://dblp.org/db/about/copyright.html); [DBLP XML](https://dblp.org/xml/).
- [CEUR-WS Volume 3394](https://ceur-ws.org/Vol-3394/) — workshop ToC and accepted-paper statement.
- [DataCite metadata relationship/versioning](https://support.datacite.org/docs/versioning).
- [Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) (avoid the deprecated `CrossRef/rest-api-doc` README as a normative API contract).
- [OpenAlex authorships and raw affiliations](https://help.openalex.org/data/authorships/), [raw affiliations](https://help.openalex.org/data/raw-affiliation-strings/).
- [W3C PROV-O](https://www.w3.org/TR/prov-o/).
- [PostgreSQL 18 constraints](https://www.postgresql.org/docs/18/ddl-constraints.html), [unique indexes](https://www.postgresql.org/docs/18/indexes-unique.html), [INSERT / ON CONFLICT](https://www.postgresql.org/docs/18/sql-insert.html), [CREATE VIEW and view security](https://www.postgresql.org/docs/18/sql-createview.html).
- [OpenCitations Meta](https://github.com/opencitations/oc_meta) — surveyed reference code, not a proposed Litervia dependency.
