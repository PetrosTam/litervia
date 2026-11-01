# CHI Catalogue Physical Design Contract — PostgreSQL 18

**Revision:** v0.4 · **2026-11-01** · **Scope:** design-only · **Tracking:** Issue #17, upstream research pilot Issue #13
**Status:** D-04 and D-05 **APPROVED ARCHITECTURAL DIRECTION** (owner, 2026-11-01); detailed DDL/role implementation remains **PROPOSED / NOT FROZEN**. D-12 **OPEN**.  
**Execution evidence:** STATIC DOCUMENT REVIEW ONLY. **No migrations, database tests, importer runs, grants, runtime role changes, enrichment, data import, application changes or deployment.**

## 1. Sources and non-negotiable boundaries

Authority, in priority order: explicitly approved owner decisions; Product Engineering Specification §§5–6, 12, 14–15; [ADR-0001](adr-0001-chi-catalogue-identity.md); [CHI Normalization Contract](../research/chi-normalization-contract.md) N-01–N-14; [publication/rights policy](../research/chi-metadata-publication-rights-policy.md) PUB-01–PUB-06; [PostgreSQL foundation](../postgresql-foundation.md); dated [source review](../research/chi-source-evidence-identity-review.md); current repository. The Product Specification's initial SQLite proposal was superseded by approved PostgreSQL 18 foundation Issue #11 / PR #12; do not silently rewrite that historical specification.

**APPROVED:** (1) independent stable `research_works`, `work_appearances`, `source_records` identities; separate proceedings volumes; (2) main CHI **verified** category default, EA/Companion/workshop explicit opt-ins, unknown under All; (3) original DBLP keys, DOI candidates and source author ordering preserved; no title/year/DOI-only merge; (4) catalogue/private PostgreSQL database separation and server-enforced authorization; (5) PUB-01–PUB-06 conservative bibliographic publication policy; (6) D-04/D-05 direction as explicitly approved on 2026-11-01.

**VERIFIED BASELINE:** `litervia_catalogue`, `litervia_private` and isolated `_test` databases; existing `litervia_catalogue_app`, `litervia_catalogue_migrator` (and separate private identities), per [foundation](../postgresql-foundation.md). **Not verified/existing:** research/publication/api_public schemas, research tables, catalogue importer/publisher principals, public views, grants on future tables, ingestion and release tests. The reviewed CSV source pilot is 150 distinct records (134 `inproceedings`, 16 `proceedings`), not a database import or 150 independently verified works. Original datasets remain immutable outside Git.

**OPEN:** five collision-group same-work adjudications; ambiguous DOI parsing/ownership/resolution; publisher/volume crosswalks and exact historical contribution vocabulary; CEUR `short10.pdf` TOC membership; rights for each asset/copy; complete coverage and true historical 1984 status; D-10 search/API collation; D-11 redirects/private-reference repair; D-12 physical freeze, authority/thresholds, and privileges. Do not infer acceptance of these from design direction.

## 2. D-04 — identity and source integrity

### 2.1 Key choice and controlled schemes

**Approved direction:** random internal IDs independent of upstream identifiers. **Proposed physical default (owner-approved direction, not tested DDL):** PostgreSQL native `uuid DEFAULT gen_random_uuid()` (UUIDv4) for identity tables; no extra extension. Stable work and appearance IDs must survive identical reruns, changes of assertions and supervised work redirects; never derive IDs from title, DOI, year, author name or source key. Every research source observation has a separate immutable `source_records.id` and unique (`snapshot_id`, `source_record_key`).

Preserve immutable snapshot hashes, selector/extractor contract version and source record raw exported values. `jsonb` reflects the exporter representation, **not proof of byte-perfect original XML**. Archived original XML and source datasets stay outside Git and the application database.

Identifiers are **claims**, not automatically verified identities. `dblp_key` is primarily the source-scoped `source_record_key` and must not be duplicated in `external_identifiers` by default. Explicitly permitted candidate scheme/owner pairs: `doi` → source observation, reviewed appearance or reviewed volume; `orcid` → person (only after separate identity review); other schemes and `ror`/institution owners are **DEFERRED**. No global `UNIQUE(doi)`; preserve every raw DOI and `<ee>` candidate, its provenance, syntax status and resolver status separately. Wrong owner/scheme pairs require database-level rejection when implemented.

### 2.2 Typed mapping (candidate SQL-level invariant)

A `source_record` has kind `inproceedings` or `proceedings`. The physical proposal uses all of the following in combination:

```sql
-- DESIGN PSEUDOSQL; NOT EXECUTED OR APPROVED AS A MIGRATION.
UNIQUE (source_records.id, source_records.record_kind)
FOREIGN KEY (source_record_id, source_record_kind)
  REFERENCES research.source_records (id, record_kind)
CHECK (num_nonnulls(appearance_id, volume_id) = 1)
CHECK (
  (source_record_kind = 'inproceedings' AND appearance_id IS NOT NULL)
  OR
  (source_record_kind = 'proceedings' AND volume_id IS NOT NULL)
)
```

The binding relation also has typed FKs to `work_appearances(id)` and `proceedings_volumes(id)`. Since `num_nonnulls(...)=1` excludes both-neither and both-present, and the composite FK matches the recorded kind, it cannot legitimately map a proceedings volume to a paper appearance. The actual migration must prove this with direct SQL negative tests; Laravel validation alone is insufficient. A CHECK cannot inspect a referenced table without an FK, so the composite kind FK is essential.

**Binding lifecycle choice (proposed refinement):** retain append-only `source_record_bindings` decisions and store the current mapping in a restricted `current_source_bindings` relation keyed by `source_record_id`; use a composite FK (`binding_id`, `source_record_id`) to bind the current pointer to a historical decision for **the same observation**. All pointer transitions require a transaction, an approved `identity_decisions` record, audit and server-side authority. This avoids claiming an updated `binding_state` history row is immutable. Zero current pointer is valid for unresolved/quarantined observations. The precise privilege/procedure to enforce transition audit is **OPEN D-12**, not assumed safe.

### 2.3 Byline and membership correctness

- `appearance_byline_sets` identifies a *particular appearance/source-observation* byline revision. Include `byline_observation_state` = `observed_authors | observed_empty | not_checked` (candidate values). `observed_empty` yields **zero `appearance_authorships` rows**, not a fictitious “anonymous” author.
- `appearance_authorships` primary key (`byline_set_id`, `position`), `position > 0`; preserve exact original names/attributes, including source-specific ordering and unresolved author identity. Different snapshots can disagree without overwriting history.
- **Required concrete lineage key:** `source_record_bindings` defines `UNIQUE (id, source_record_id, appearance_id)` (in addition to its ordinary PK). For an appearance byline set, all `source_binding_id`, `source_record_id`, and `appearance_id` are NOT NULL and carry `FOREIGN KEY (source_binding_id, source_record_id, appearance_id) REFERENCES research.source_record_bindings (id, source_record_id, appearance_id)`. This matches one immutable `inproceedings` binding, not three unrelated IDs. PostgreSQL `MATCH SIMPLE` permits nullable composite components to skip checks, so every referencing component is NOT NULL. Do not assume a plain FK to each column is sufficient.
- Do **not** retain `work_appearances.verified_volume_id`. Derive current verified membership from independently reviewed `appearance_volume_memberships`; preserve disputed and unverified candidates, with at most one current *confirmed* membership unless a future explicitly approved model allows multiple.
- Historical release display and work associations are pinned at release time; mutable present-day `work_appearances.work_id` must not be used to recalculate an older released result.
- Proceeding volumes never appear as research papers or inflate canonical work counts; no unsupported CHI 1984 edition is fabricated.

## 3. Proposed physical table dictionary (D-12 OPEN)

**Notation:** `!` NOT NULL; `?` nullable. All `uuid` keys below are proposed; all evidence-backed rows record created-at timestamps. Use versioned `jsonb` only for source payloads/manifested public projections, not to bypass typed relationships. Apply `ON DELETE RESTRICT` to source, canonical identity and released provenance; no unreviewed cascading deletion.

| Schema / table | Key columns and types (candidate) | Cardinality / constraint / justification |
|---|---|---|
| `research.source_snapshots` | `id uuid!`; `provider text!`; `snapshot_label text!`; `archive_sha256 char(64)?`; `dtd_sha256 char(64)?`; `source_date date?`; `retrieved_at timestamptz?`; `license_evidence_ref text?` | PK `id`; partial UNIQUE (`provider`, `archive_sha256`) when hash present; do not invent retrieval dates |
| `research.source_records` | `id uuid!`; `snapshot_id uuid!`; `source_record_key text!`; `record_kind text!`; `source_ordinal bigint!`; `source_fields_json jsonb!`; `source_attributes_json jsonb!`; `serialized_record_hash char(64)!`; `hash_algorithm_version text!`; `observed_year smallint?` | FK snapshot; UNIQUE (`snapshot_id`, `source_record_key`), (`snapshot_id`, `source_ordinal`), (`id`, `record_kind`); kind CHECK |
| `research.source_evidence` | `id uuid!`; `provider text!`; `source_uri text!`; `retrieved_at timestamptz?`; `evidence_hash char(64)?`; `rights_state text!`; `review_state text!`; `notes text?` | External publisher/rights evidence; private reviewer notes never in public projection |
| `research.source_field_assertions` | `id uuid!`; `subject_source_record_id uuid?`; `appearance_id uuid?`; `volume_id uuid?`; `work_id uuid?`; `author_id uuid?`; `field_key text!`; `raw_value jsonb?`; `availability_state text!`; `review_state text!`; `rights_state text!`; `provenance_source_record_id uuid?`; `source_evidence_id uuid?`; `derived_from_assertion_id uuid?` | Exactly one *subject* FK, including a raw unmapped source observation; at least one *provenance* FK. If an appearance-scoped claim is derived from a mapped original source claim, preserve its parent assertion and compatible source binding; do not retarget the raw claim. Retain competing claims and supporting UNIQUE (`id`, `appearance_id`) / (`id`, `volume_id`) for release selection FKs; do not silently invent canonical owners |
| `research.conference_editions` | `id uuid!`; `conference_family text!`; `edition_year smallint!`; `evidence_state text!`; `source_evidence_id uuid?` | Evidence-backed edition only; no unsupported year; co-located workshops need distinct identities |
| `research.proceedings_volumes` | `id uuid!`; `edition_id uuid?`; `title text!`; `source_category text!`; `category_review_state text!`; `membership_state text!`; `source_evidence_id uuid?` | FK edition; no title/DOI uniqueness or automatic main-CHI inference |
| `research.research_works` | `id uuid!`; `identity_state text!`; `retired_at timestamptz?` | Stable canonical identity; never reused/deleted on a supervised redirect |
| `research.work_appearances` | `id uuid!`; `work_id uuid!`; `source_year smallint?`; `contribution_type text!`; `classification_state text!` | FK work; no duplicate volume pointer; no title/year or DOI automatic merge |
| `research.appearance_volume_memberships` | `id uuid!`; `appearance_id uuid!`; `volume_id uuid!`; `membership_state text!`; `source_evidence_id uuid?`; `classification_decision_id uuid?`; `superseded_at timestamptz?` | Typed appearance/volume FKs; `CHECK (membership_state <> 'confirmed' OR (source_evidence_id IS NOT NULL AND classification_decision_id IS NOT NULL))`; **also** validate the decision's exact subject-pair and approved evidence status through a reviewed database-enforced transition/promotion boundary. Preserve disputed history; one current confirmed association at most |
| `research.identity_decisions` | `id uuid!`; `decision_kind text!`; `decision_state text!`; `source_evidence_id uuid?`; `rationale text!`; `reviewer_ref text?`; `recorded_at timestamptz!`; `supersedes_decision_id uuid?` | Internal reviewer/audit envelope; decision authority OPEN |
| `research.classification_decisions` | `id uuid!`; `appearance_id uuid?`; `volume_id uuid?`; `source_category text?`; `contribution_type text?`; `membership_state text?`; `decision_state text!`; `source_evidence_id uuid!`; `rationale text!`; `recorded_at timestamptz!` | Exactly one typed subject, documented status and evidence; membership approval must be checked against both appearance and volume context, not inferred from a decision ID alone. A single row CHECK cannot verify the referenced decision's reviewed state |
| `research.source_record_bindings` | `id uuid!`; `source_record_id uuid!`; `source_record_kind text!`; `appearance_id uuid?`; `volume_id uuid?`; `identity_decision_id uuid?`; `source_evidence_id uuid?`; `recorded_at timestamptz!` | Immutable binding decisions; NOT NULL kind + composite FK to source kind + target XOR + typed target FKs; UNIQUE (`id`, `source_record_id`), **UNIQUE (`id`, `source_record_id`, `appearance_id`)** for exact byline provenance |
| `research.current_source_bindings` | `source_record_id uuid!`; `binding_id uuid!`; `selected_decision_id uuid!`; `selected_at timestamptz!` | PK source; composite FK (`binding_id`, `source_record_id`) into binding history; guarded/audited transition, may be absent |
| `research.authors` | `id uuid!`; `display_name text!`; `identity_state text!` | Optional resolved person; **no uniqueness by name** |
| `research.appearance_byline_sets` | `id uuid!`; `appearance_id uuid!`; `source_record_id uuid!`; `source_binding_id uuid!`; `byline_observation_state text!`; `source_hash char(64)!` | All three source/appearance binding FK components NOT NULL; FK (`source_binding_id`, `source_record_id`, `appearance_id`) → `source_record_bindings(id, source_record_id, appearance_id)`; UNIQUE (`id`, `appearance_id`); byline observations remain versioned. Cross-row `observed_empty`/positive-count checks require a deferred validator |
| `research.appearance_authorships` | `byline_set_id uuid!`; `position integer!`; `original_name text!`; `original_attributes_json jsonb!`; `author_id uuid?` | PK (`byline_set_id`, `position`), `position > 0`; no invented author for empty source |
| `research.external_identifiers` | `id uuid!`; `scheme text!`; `raw_value text!`; `normalized_key text?`; `rule_version text?`; typed `owner_source_record_id` / `owner_appearance_id` / `owner_volume_id` / `owner_author_id` nullable FKs; `source_evidence_id uuid?`; `provenance_source_record_id uuid?`; `validation_state text!`; `resolver_state text!` | One typed owner; one evidence anchor; explicit scheme/owner CHECK; no global DOI UNIQUE and no fabricated DOI resolution |
| `research.appearance_relationships` | `id uuid!`; `from_appearance_id uuid!`; `to_appearance_id uuid!`; `relation_type text!`; `identity_decision_id uuid!` | No self relation; reviewed—not inferred—candidate/supersession relation |
| `research.work_relationships` | `id uuid!`; `from_work_id uuid!`; `to_work_id uuid!`; `relation_type text!`; `identity_decision_id uuid!` | Typed work relation; cycle rules depend on relation type, validated separately |
| `research.work_redirects` | `from_work_id uuid!`; `to_work_id uuid!`; `identity_decision_id uuid!`; `recorded_at timestamptz!` | PK from; FK both ends; no self redirect; global acyclicity requires reviewed transactional logic |
| `research.ingestion_runs` | `id uuid!`; `snapshot_id uuid!`; `input_sha256 char(64)!`; `selector_version text!`; `extractor_version text!`; `contract_version text!`; `status text!`; `expected_rows integer?`; `staged_rows integer!`; `accepted_rows integer!`; `rejected_rows integer!`; `started_at timestamptz!`; `finished_at timestamptz?` | Append audit; counts are source observations, not work claims |
| `research.ingestion_record_results` | `run_id uuid!`; `input_ordinal bigint!`; `source_record_id uuid?`; `observed_source_key text?`; `outcome text!`; `reason_code text?`; `mapped_appearance_id uuid?`; `mapped_volume_id uuid?` | PK (`run_id`, `input_ordinal`); includes rejected inputs that never became stored source records |
| `publication.catalogue_releases` | `id uuid!`; `release_number bigint!`; `source_manifest_sha256 char(64)!`; `decision_manifest_sha256 char(64)!`; `validated_at timestamptz?`; `approved_at timestamptz?`; `approved_by_ref text?` | Release content becomes immutable once validated; do not mutate a `release_status` to represent promotion history |
| `publication.catalogue_release_volume_items` | `release_id uuid!`; `volume_id uuid!`; `public_title text!`; `selected_title_assertion_id uuid!`; `source_category text!`; `membership_state text!`; `selection_manifest_sha256 char(64)!` | PK (`release_id`, `volume_id`); title anchored to eligible volume assertion via composite FK; exact immutable published volume snapshot |
| `publication.catalogue_release_items` | `release_id uuid!`; `appearance_id uuid!`; `work_id uuid!`; `work_identity_basis_ref text!`; `public_title text!`; `public_year smallint?`; `volume_id uuid?`; `source_category text!`; `contribution_type text!`; `selected_title_assertion_id uuid!`; `selected_byline_set_id uuid!`; `public_links_json jsonb!`; `public_identifiers_json jsonb!`; `public_provenance_json jsonb!`; `selection_manifest_sha256 char(64)!` | PK (`release_id`, `appearance_id`); title and byline selection **both** anchored by non-null composite FKs to the *same* appearance; DBLP fallback must first become a provenance-linked appearance-scoped assertion (preserve its raw source-scoped parent). If volume set, release-scoped FK (`release_id`, `volume_id`) must match the same release's volume item; frozen work assignment requires reviewed decision or versioned deterministic source-key basis |
| `publication.catalogue_release_bylines` | `release_id uuid!`; `appearance_id uuid!`; `position integer!`; `public_name text!`; `source_record_id uuid?`; `author_id uuid?` | PK (`release_id`, `appearance_id`, `position`), FK (`release_id`, `appearance_id`) into release items; immutable byline display |
| `publication.active_release` | `singleton_key smallint!`; `release_id uuid!`; `generation bigint!`; `updated_at timestamptz!` | PK singleton, CHECK key=1 and FK to release row; **FK does not prove validated status**. A database-enforced guarded promotion operation must reject `validated_at IS NULL`, unapproved/changed manifests, withdrawn rights or missing audit; direct role UPDATE denied |
| `publication.release_transition_events` | `id uuid!`; `from_release_id uuid?`; `to_release_id uuid!`; `generation_before bigint!`; `generation_after bigint!`; `action text!`; `actor_ref text!`; `recorded_at timestamptz!` | Append-only audit; publish/rollback distinct from immutable release content |
| `publication.publication_holds` **P0 OPEN MECHANISM** | Typed `appearance_id uuid?` / `volume_id uuid?` / `source_field_assertion_id uuid?`; `reason_code text!`; `recorded_at timestamptz!`; `lifted_at timestamptz?` | Deny unsafe releases/results when rights revoked; exact hold precedence/per-field scope to be approved before real public launch |

**Enforceability clarification (REV-01/02/03/04):** A typed CHECK proves only same-row conditions. Cross-row evidence status, byline cardinality, source-to-canonical claim lineage, approval state, and effective rights must be validated by a reviewed transaction/trigger/controlled function or a more precise relation shape before they can be claimed database-enforced. Candidate FKs may require additional supporting parent UNIQUE constraints. A missingness state is not a substitute for original evidence. A confirmation cannot rely on nullable decision/evidence IDs.

**Table-list status:** These are *candidate relations*, not a frozen count or an instruction to create all tables. The `publication_holds` mechanism and publisher-specific identity, reviewer authority, source assertion subject types and several relationships need separate sign-off. Defer institutions, historical affiliations, awards, abstracts, media and enhancement adapters unless verified source facts and rights justify them.

## 4. D-05 — immutable publication and recovery contract

**Approved direction:** staged source import → validation → immutable release snapshot → explicit publication authority → catalogue-local atomic pointer → audited rollback; never infer a distributed transaction with `litervia_private`.

**Proposed candidate transaction:** (1) verify a validated, immutable release/manifest; (2) verify owner-approved completeness and rights gates; (3) BEGIN and lock singleton `active_release` row; (4) recheck expected generation and active rights holds; (5) update `active_release.release_id` and increment generation; (6) insert the matching `release_transition_events` event in **the same transaction**; (7) COMMIT. A failure before COMMIT leaves the old pointer and no committed promotion event. A trigger/controlled function or equivalent DB-enforced boundary must prevent bypass and unaudited direct UPDATE; **not currently implemented**.

**Snapshot immutability:** Freeze membership for appearances **and volumes**, selected title/DOI/source links, observed/missingness states, ordered public byline, reviewed category/type, exact work association and source/evidence selection. A release A→B→A must return the same authorized *historical facts*. A current correction cannot mutate A. Every selected title assertion/byline FK must be checked for *the same appearance*, not merely point to an existing row. Do not accidentally follow the latest mutable identities when reading historical snapshots.

**Publication validator (REV-02/03):** Before a release is marked validated, require every public title to match a selected, existing, evidence-backed field assertion belonging to the correct appearance/volume (the DBLP fallback must be a separately mapped derivative of a preserved source-only assertion); ensure non-null byline-set selection is appearance-compatible (including an explicitly observed-empty set); ensure volume selection is release-scoped and its membership review is approved; verify work-identity basis, attributed DOI/source links and rights state. The freeze boundary must reject subsequent INSERT/UPDATE/DELETE against validated release contents, not merely revoke DML from the public app. An FK from `active_release.release_id` to `catalogue_releases.id` proves only row existence; it **cannot** prove `validated_at IS NOT NULL`, approval, completeness, effective rights or immutability. Those are controlled publication-transaction guards requiring real negative tests. Until a reviewed guard is implemented, the design is **NOT SAFE FOR PUBLICATION**.

**Request consistency:** A catalogue HTTP request involving multiple SQL queries (results, facets, counts) must pin one active release ID or use a safe transaction snapshot; a concurrent promotion cannot mix A and B within one response. Pagination cursor/sort/API details remain D-10 OPEN.

**Rights withdrawal precedence (P0):** Immutable history is not a licence to continue serving withdrawn material. The runtime public path must check effective publication holds, or rollback to a snapshot containing disallowed material must fail closed; a particular table/function/denylist mechanism needs a dedicated review. Never let direct release queries bypass withdrawal. Explicitly test both active reads and A→B→A rollback with withdrawn assets. **No public launch while this mechanism remains unresolved.**

**Release approval gates OPEN:** who can validate/promote; source/sample coverage threshold; how to handle partial reviewed rejections; reviewer attestations and independent audit; emergency takedown authority; retention/correction window. **No source completeness or rights status is fabricated.**

## 5. D-12 — roles, privileges and dependent migration order (OPEN)

### 5.1 Existing and proposed roles

| Principal | Existing? | Permitted *target* access | Prohibited access |
|---|---|---|---|
| `litervia_catalogue_app` | **VERIFIED EXISTING** | `USAGE` on `api_public` + `SELECT` on reviewed public projection views *only* | `research` / `publication` base SELECT, any DML, DDL, staging, reviewer data, migration credentials, other DB CONNECT |
| `litervia_catalogue_migrator` | **VERIFIED EXISTING** | Separately approved DDL operations, migration windows only | Ordinary web requests; uncontrolled release promotion; other DB CONNECT |
| `litervia_catalogue_importer` | **PROPOSED NOT CREATED** | Narrow staging/source upsert and ingest audit in catalogue only | Publication pointer, unreviewed evidence exfiltration, DDL, private DB |
| `litervia_catalogue_publisher` | **PROPOSED NOT CREATED** | Guarded promotion and rights-action functions after sign-off | General arbitrary DML on source/provenance, DDL, private DB |
| `litervia_private_app` | **VERIFIED EXISTING** | Its own private DB subject to Laravel ownership policies | Catalogue DB connection or access |

Proposed schemas `research`, `publication` and `api_public` require explicit schema grants; the existing foundation uses `public` schema privileges. No role, table, schema or new grant is provisioned by this design.

**Public projection trust model (REV-05):** Owned by a dedicated NOLOGIN owner/migration-controlled principal, not the web login; explicit SELECT-only projections, never `SELECT *`. Use ordinary owner-privileged views only after confirming the view owner can access needed base rows and `litervia_catalogue_app` cannot access research/publication base relations directly. Do not set `security_invoker=true` blindly: it may require base-relation access for the web principal. Evaluate `security_barrier=true` **when untrusted caller predicates or optimizer reordering could expose protected rows**; it is not a substitute for verified view ownership, rights predicates, function security, or least privilege. A public view must never expose stage, reviewer notes, unrestricted historical releases, or a route bypassing an effective rights hold. Threat cases include crafted WHERE predicates/functions, views over historical releases, sensitive text in errors/logs, concurrent rights withdrawal, and untrusted `search_path`/SECURITY DEFINER functions. Restrict function/procedure EXECUTE (including PostgreSQL default PUBLIC function EXECUTE), table/sequence/schema privileges, object ownership and future-object `ALTER DEFAULT PRIVILEGES`; no runtime DDL or base-table DML. Use actual PostgreSQL 18 authenticated roles for positive and negative probes; **all such probes remain NOT RUN**.

### 5.2 Dependency-ordered migration design (NO execution approval)

1. Schema creation, role/owner trust mapping and grants plan; **do not rerun non-idempotent foundation provisioning**.
2. Source snapshots, source evidence, source records and canonical work/appearance/volume scaffolding, with simple non-circular FKs.
3. Typed source-record binding history/current pointers, independent source assertions, identifiers, byline sets and authorships, then review records; arrange subject/decision FK order without disabling constraints.
4. Membership relationships, classifications and redirects; no unreviewed identity collapse, no speculative authors/institutions/media.
5. Ingestion run audit and deterministic fixture reconciliation; all staging remains invisible to public app.
6. Immutable release content and selected-assertion/byline composite integrity; publication holds/withdrawal policy *only after approval*.
7. Controlled pointer/event transaction; view owner/ACL/default-privilege lockdown; repeat privilege probes using actual roles and PostgreSQL 18.
8. Only in future independently authorized stages: zero/positive/negative test fixtures, then approved 150-source-observation pilot and publication readiness assessment.

**Risk points:** Circular `membership → classification decision → appearance/volume` dependencies require creating decision targets before membership references or staged `ALTER TABLE` with valid FKs; do not use unchecked constraint disabling. If byline sets require a binding composite, define the parent UNIQUE first. A release FK to (`release_id`, `volume_id`) must match an actual released volume item; a source assertion selection must match its appearance. Work redirect cycles and permission/effective-withdrawal checks cannot be solved by a single same-row CHECK.

## 6. Index proposals, deliberately restrained

| Relation | Candidate index | Why / gate |
|---|---|---|
| `source_records` | UNIQUE (`snapshot_id`, `source_record_key`), (`snapshot_id`, `source_ordinal`), (`id`, `record_kind`) | Source idempotency, exact original ordering and typed FK |
| `source_record_bindings` | (`source_record_id`, `recorded_at`); UNIQUE (`id`, `source_record_id`) | History and current pointer compatibility |
| `current_source_bindings` | PK `source_record_id`; UNIQUE `binding_id` if no binding decision may be shared | At most one current mapping per observation |
| `appearance_volume_memberships` | Partial UNIQUE (`appearance_id`) WHERE `membership_state='confirmed' AND superseded_at IS NULL` | One current verified hosting volume, not inferred via booktitle |
| `appearance_authorships` | PK (`byline_set_id`, `position`) | Repeatable observed author ordering |
| `source_field_assertions` | (`source_record_id`, `field_key`), composite (`id`, `appearance_id`) | Provenance and release assertion correctness |
| `external_identifiers` | (`scheme`, `normalized_key`) **non-unique** | Candidate search; ambiguity retained |
| `catalogue_release_items` | PK (`release_id`, `appearance_id`), (`release_id`, `source_category`), (`release_id`, `work_id`) | Category and work-level filtering without duplicated joins |
| `catalogue_release_bylines` | PK (`release_id`, `appearance_id`, `position`) | Exact release display ordering |
| `active_release` | PK singleton | One pointer; controlled transaction |

Additional PostgreSQL FTS/trigram/ICU indexes and search sorting are **D-10 OPEN** until query fixtures and `EXPLAIN (ANALYZE, BUFFERS)` benchmarks on representative *synthetic or authorized* data. This document does not set performance thresholds or assert measured results.

## 7. Requirement-to-test traceability — all tests NOT RUN

| Test | Requirements / evidence source | Positive and negative acceptance | State |
|---|---|---|---|
| `PC-01` | N-01/02, DBLP source audit | Exactly one source row per snapshot/key; duplicate key or mismatched SHA aborts, no partial publication | NOT RUN |
| `PC-02` | N-03/13, ADR D-04 | Forged kind/target and duplicate current binding rejected at DB layer; composite byline FK rejects mismatched source/appearance, including nullable-component bypass attempts | NOT RUN |
| `PC-03` | N-04/05, collision review | Five TC pairs remain ten source observations/appearances without auto-merge; UUID rerun stability | NOT RUN |
| `PC-04` | N-06/07, publisher policy | Ordered author claims preserved; byline set references same appearance/source binding; observed-empty rejects inserted children, observed-authors requires valid positions; not_checked stays distinct | NOT RUN |
| `PC-05` | N-07/08, DOI/identifier evidence | Preserve both `Shneiderman89` DOI URL candidates, distinct conflicted titles; no fictitious DOI resolution | NOT RUN |
| `PC-06` | N-09/14, PUB-01–PUB-06 | No unlicensed abstract/PDF/media copied or exposed; correct source attribution and availability | NOT RUN |
| `PC-07` | N-10, ADR D-05 | A→B→A reproduces frozen facts; invalid/non-evidenced selected title or byline FK fails; unvalidated release cannot become active | NOT RUN |
| `PC-08` | N-10, ADR D-05 | Failed stage/concurrent promotion preserves old release and one coherent pointer/event history | NOT RUN |
| `PC-09` | PUB-05/06, D-05 | Rights withdrawal blocks public projection and unsafe rollback, including attempts to query restricted historical release and a concurrent withdrawal | NOT RUN |
| `PC-10` | N-11, D-12, PostgreSQL foundation | Authenticated runtime public SELECT works; raw/stage/base/DML/DDL/function EXECUTE/other DB denied; hostile predicates, view owner, security_barrier and default grants tested | NOT RUN |
| `PC-11` | N-12, source pilot | 150 unique source observations = 134 `inproceedings` + 16 `proceedings`; count categories not multiplied by authors/DOI | NOT RUN |
| `PC-12` | N-13, D-04 | Binding history and current pointer remain consistent; unauthorized pointer update rejected | NOT RUN |
| `PC-13` | N-14, D-05 | Missing/wrong-owner title assertions, byline sets, unreviewed main classification, mismatched volume membership, validated-release mutation and pointer bypass rejected | NOT RUN |
| `PC-14` | ADR D-10, discovery baseline | Default verified main only; EA/Companion/workshop opt-ins; unknown under All; no volumes as papers | NOT RUN |
| `PC-15` | ADR D-11, private authorization | Redirect cycles and cross-user private reference access rejected, no cross-DB FK assumption | NOT RUN |
| `PC-16` | Specification NFRs, public rights | Invalid outbound URL schemes/internal endpoints rejected; review/private notes never in API output | NOT RUN |

**Evidence requirements for future execution:** exact reviewed Git revision, verified test DB names/roles, source/fixture hashes, commands, expected and observed results, failures and rollback evidence. Existing PHP/Node CI covers the existing app, **not** these future research permissions or importer tests. No runtime checks were executed for this documentation-only PR.

### Coverage map

| Normative controls | Design section | Future proof |
|---|---|---|
| N-01–N-03 (snapshot/key/kind) | §§2–3 | PC-01/02/11 |
| N-04–N-06 (appearance/work/byline) | §§2–3 | PC-03/04/12 |
| N-07–N-09 (missingness/claims/rights) | §§2–4 | PC-05/06/09 |
| N-10–N-11 (release/runtime) | §§4–5 | PC-07/08/10 |
| N-12–N-14 (counts/binding/history) | §§2–4 | PC-11/12/13 |
| PUB-01–PUB-06 | §§1, 2.1, 4–5 | PC-05/06/09/16 |

## 8. Open decisions and sign-off conditions

| Decision | Review state after owner approval of *direction* | Next proof/decision |
|---|---|---|
| D-01–D-03 | APPROVED (unchanged) | No unauthorized scope changes |
| **D-04** | **APPROVED DIRECTION / PHYSICAL DDL PROPOSED** | Review final scheme whitelist, binding transition authorization, composite FKs and negative SQL fixtures |
| **D-05** | **APPROVED DIRECTION / PROMOTION MECHANISM PROPOSED** | Approve release completeness thresholds, publish/revoke authority, rights holds, concurrent switch tests |
| D-06–D-08 | OPEN evidence questions | Official record review; no retrospective auto-merge or invented DOI state |
| D-09 | APPROVED policy / implementation OPEN | Asset/copy-specific permissions, safe URL behavior |
| D-10 | OPEN | Search query, filters, stable sort and measured indexes |
| D-11 | OPEN | Redirect review and private record consistency |
| **D-12** | **OPEN — NOT FROZEN** | Final DDL, schema ownership/GRANT verification, object graph, publisher/importer role authorization |
| Issue #13 AC-10 | **OPEN / NOT AUTHORIZED** | Separate explicit bounded owner authorization before any migration/importer/DB change |

**Acceptance boundary for this Issue #17:** documentation can be reviewed/accepted without freezing every physical DDL decision. A design-only merge is **not** implementation sign-off. Mark a decision "approved physical" only after its *specific* constraints, privileges, risk gates and negative-test plan are accepted. Never label unrun tests PASS.

## 9. Delivery and verification

- Planned files for Issue #17: this single consolidated design contract and a minimal ADR D-04/D-05 decision-register status sync. Other documents' historical statements remain preserved.
- **Scope exclusions:** no PHP/JS/SQL migration, provisioning/regrant, users/private data, source files, snapshots, ingestion, DOI resolution, media, API/frontend changes, deployment, PR merge or Issue #13 closure.
- Review the actual GitHub diff, internal links and the named decision register. Later PR readiness and merge require separate owner approval.
- Required implementation order remains: approved design → independently authorized disposable-test schema → database-enforced negative tests → authorized pilot importer → rights-gated public release.

## References

- [PostgreSQL 18: UUID](https://www.postgresql.org/docs/18/functions-uuid.html)
- [PostgreSQL 18: CREATE TABLE and foreign keys](https://www.postgresql.org/docs/18/sql-createtable.html)
- [PostgreSQL 18: CREATE VIEW](https://www.postgresql.org/docs/18/sql-createview.html)
- [PostgreSQL 18: GRANT](https://www.postgresql.org/docs/18/sql-grant.html)
- [PostgreSQL 18: default privileges](https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html)

**Local-first review correction, v0.4 (2026-11-01):** REV-01 typed source/byline composite lineage; REV-02 non-null title/byline selections and guarded release validation; REV-03 evidence-backed confirmed membership; REV-04 source-observation claims without fabricated canonical mapping; REV-05 public view/rights bypass threat model; REV-06 Markdown section markers. This is **DESIGN ONLY**, not PostgreSQL execution proof or a final D-12 freeze. File modifications must be reviewed and committed locally before any separately approved GitHub push.

**Last review scope:** owner-approved design direction, detailed physical contract **proposed**, database and importer tests **NOT RUN**.
