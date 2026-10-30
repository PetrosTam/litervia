# Issue #13 — Source Evidence & Identity Decision Review

- **Project:** Litervia — Discover research. Explore knowledge.
- **Review date:** 2026-10-31.
- **Status:** **RESEARCH REVIEW / EVIDENCE REGISTER** (not an approved canonical-work merge or database change).
- **Scope:** Five title/year collision pairs from the 150-record pilot, plus AutomationXP@CHI 2023.
- **Repository reference:** [Issue #13](https://github.com/PetrosTam/litervia/issues/13); this evidence register is the third documentation file in [Draft PR #14](https://github.com/PetrosTam/litervia/pull/14), alongside the ADR and Normalization Contract. Its inclusion is **not** approval of canonical work merges or of this Issue's closure.
- **Source distinction:** DBLP CSV is a dated observation; external conference/library/institution sources are later independent assertions. Different assertions are not silently reconciled.

## 1. Reproducibility and review limits
- Input: `chi_pilot_150_records_2026-10-03.csv`, SHA-256 `34360f4b1470213cf5f9c52b5bba9179bc07b1fb6b7fbc18fd82fbcff860a087`; matches uploaded pilot manifest.
- Checked with Python stdlib `csv`, `hashlib`, `json`: **150** distinct keys; **134** `inproceedings`; **16** proceedings volumes; **5** collision pairs (10 records); **20** AutomationXP `inproceedings` plus **1** volume.
- The 150-record pilot is purposive and oversamples exceptions. This review does **not** check all 28,870 CHI records, resolve all DOIs, compare all seven mandatory pilot years, or establish full official-proceedings completeness.
- Web pages were inspected as available; the `short10.pdf` server exposes extractable metadata, but an attempted browser screenshot returned a cache error. The hosted PDF's first page attributes the paper to the AutomationXP23 workshop and shows the **“Physical Controls”** wording; the TU Chemnitz bibliography and workshop programme offer separate evidence. The screenshot service returned a cache error during this review, so this is a text-level PDF observation, **not** a completed visual/forensic PDF-authenticity audit.

## 2. Evidence from source collision pairs

**Decision vocabulary:** `distinct_appearances_confirmed` = distinct bibliographic identities/DOIs; `related_contribution_candidate` = relationship is plausible but **not approved** as `same_work_confirmed`; `contribution_track_verified` requires named track evidence beyond the booktitle.

### TC-001
- **Evidence observation:** 1994 Ogozalek: main CHI paper (65–71) versus a one-page Conference Companion entry (203). Same displayed author and title, but distinct DOIs, volumes and extents.
- **A / `conf/chi/Ogozalek94a`:** `CHI`; `65-71`; DOI candidate `10.1145/191666.191700`; byline Virginia Z. Ogozalek.
- **B / `conf/chi/Ogozalek94`:** `CHI Conference Companion`; `203`; DOI candidate `10.1145/259963.260287`; byline Virginia Z. Ogozalek.
- **External references:** [DBLP main][r1], [DBLP Companion][r2], [DBLP record][r20]
- **Decision:** **VERIFIED distinct bibliographic appearances**. Preserve both DBLP keys, both DOI assertions, source-author order, volume links and original pages. **PROPOSED relationship:** `related_contribution_candidate`; `same_work_confirmed` remains **OPEN** pending publisher/content relationship evidence or explicit owner-reviewed adjudication. Neither automatic merge nor `IsIdenticalTo` is justified.

### TC-002
- **Evidence observation:** 1994 Irving/Polson/Irving: main CHI paper (344–350) versus a one-page Companion entry (224). Same ordered bylines/title, distinct DOIs, volumes and extents.
- **A / `conf/chi/IrvingPI94a`:** `CHI`; `344-350`; DOI candidate `10.1145/191666.191780`; byline Sharon Irving; Peter G. Polson; J. E. Irving.
- **B / `conf/chi/IrvingPI94`:** `CHI Conference Companion`; `224`; DOI candidate `10.1145/259963.260401`; byline Sharon Irving; Peter G. Polson; J. E. Irving.
- **External references:** [DBLP main][r1], [DBLP Companion][r2], [DBLP record][r3]
- **Decision:** **VERIFIED distinct bibliographic appearances**. Preserve both DBLP keys, both DOI assertions, source-author order, volume links and original pages. **PROPOSED relationship:** `related_contribution_candidate`; `same_work_confirmed` remains **OPEN** pending publisher/content relationship evidence or explicit owner-reviewed adjudication. Neither automatic merge nor `IsIdenticalTo` is justified.

### TC-071
- **Evidence observation:** 2000 Mankoff: main CHI (368–375) lists Mankoff, Hudson, Abowd; Extended Abstract (77–78) lists Mankoff alone. Distinct DOIs and materially different bylines.
- **A / `conf/chi/MankoffHA00`:** `CHI`; `368-375`; DOI candidate `10.1145/332040.332459`; byline Jennifer Mankoff; Scott E. Hudson; Gregory D. Abowd.
- **B / `conf/chi/Mankoff00`:** `CHI Extended Abstracts`; `77-78`; DOI candidate `10.1145/633292.633339`; byline Jennifer Mankoff.
- **External references:** [DBLP main][r4], [DBLP Extended Abstracts][r5]
- **Decision:** **VERIFIED distinct bibliographic appearances**. Preserve both DBLP keys, both DOI assertions, source-author order, volume links and original pages. **PROPOSED relationship:** `related_contribution_candidate`; `same_work_confirmed` remains **OPEN** pending publisher/content relationship evidence or explicit owner-reviewed adjudication. Neither automatic merge nor `IsIdenticalTo` is justified.

### TC-140
- **Evidence observation:** 2023 HUGO: main CHI article 746 (15 pages) versus Extended Abstracts article 458 (4 pages). Same three authors, distinct DOIs, volumes, and extents.
- **A / `conf/chi/HerbstWZ23`:** `CHI`; `746:1-746:15`; DOI candidate `10.1145/3544548.3581064`; byline Yair Herbst; Alon Wolf; Lihi Zelnik-Manor.
- **B / `conf/chi/HerbstWZ23a`:** `CHI Extended Abstracts`; `458:1-458:4`; DOI candidate `10.1145/3544549.3583892`; byline Yair Herbst; Alon Wolf; Lihi Zelnik-Manor.
- **External references:** [Technion main][r6], [Technion EA][r7], [DBLP EA][r19]
- **Decision:** **VERIFIED distinct bibliographic appearances**. Preserve both DBLP keys, both DOI assertions, source-author order, volume links and original pages. **PROPOSED relationship:** `related_contribution_candidate`; `same_work_confirmed` remains **OPEN** pending publisher/content relationship evidence or explicit owner-reviewed adjudication. Neither automatic merge nor `IsIdenticalTo` is justified.

### TC-141
- **Evidence observation:** 2025 GestureSock: Extended Abstracts article 731 (five pages) versus article 914 (two pages). Same four authors; independent institution and CHI programme evidence support Interactivity vs Video Showcase, respectively.
- **A / `conf/chi/RhedenAME25`:** `CHI Extended Abstracts`; `731:1-731:5`; DOI candidate `10.1145/3706599.3721114`; byline Vincent van Rheden; Sasindu Abewickrema; Florian 'Floyd' Mueller; Don Samitha Elvitigala.
- **B / `conf/chi/RhedenAME25a`:** `CHI Extended Abstracts`; `914:1-914:2`; DOI candidate `10.1145/3706599.3721350`; byline Vincent van Rheden; Sasindu Abewickrema; Florian 'Floyd' Mueller; Don Samitha Elvitigala.
- **External references:** [Monash article 731][r8], [Salzburg article 914][r9], [CHI Interactivity schedule][r10], [CHI Video Showcase schedule][r11], [author lab publication register][r12]
- **Decision:** **VERIFIED distinct bibliographic appearances**. Preserve both DBLP keys, both DOI assertions, source-author order, volume links and original pages. **PROPOSED relationship:** `related_contribution_candidate`; `same_work_confirmed` remains **OPEN** pending publisher/content relationship evidence or explicit owner-reviewed adjudication. Neither automatic merge nor `IsIdenticalTo` is justified.
- **Additional classification:** `RhedenAME25a` / DOI ending `3721350` maps to Video Showcase through a specifically DOI-labelled Salzburg institution record. `RhedenAME25` / DOI ending `3721114` aligns with the Interactivity paper via the distinct article 731 and the official event programme, with no direct DOI in the programme item. Both remain EA source category, while contribution track evidence is retained with its provenance.

## 3. AutomationXP@CHI 2023 — reconciliation

- **VERIFIED from pilot:** 20 workshop `inproceedings` refer to `https://ceur-ws.org/Vol-3394/short1.pdf` … `short20.pdf`, plus one independent `proceedings` record `conf/chi/2023axp`; zero recognized DOI URLs for these 20 workshop papers in `ee_json`.
- **VERIFIED from [CEUR table of contents][r13]:** 19 accepted short papers; the TOC has 19 linked titles, **does not list short10**, and identifies this as a workshop co-located with CHI 2023. The CEUR license statement is about the published volume/papers; per-record rights still need checking.
- **VERIFIED from [workshop organizer programme][r14]:** the organizer lists the Kullmann/Ehlers/Hornecker/Chuang paper in the 11:00 session, with the word **“Inputs”** in its title.
- **CORROBORATED from [TU Chemnitz bibliography][r16] and [CEUR-hosted file][r15]:** a paper of that author group is associated with CEUR 3394 as `short10.pdf`; its title uses **“Controls”**. The [independently published article reference][r18] also cites the Controls title/short10 file. The CEUR-hosted PDF itself displays the workshop name and **“Physical Controls”** on its first page [r15]. The discrepancy does *not* prove editorial acceptance, withdrawal or retraction.
- **Source category:** `workshop_colocated` is **VERIFIED** for this volume/cohort by the CEUR publisher index and organizer programme. The original selector annotation `unclassified_booktitle` remains **unchanged historical extraction output**; a reviewed derived classification can supersede it without mutating the CSV.
- **Publication membership:** 19 entries have `ceur_toc_listed=observed`. The short10 candidate has `ceur_toc_listed=false` (observed index absence), `workshop_programme_listed=observed`, `ceur_file_url_observed=observed`, and `ceur_volume_membership=disputed/open`. Do not conflate `not_in_toc`, `not_published`, `not_accepted`, and `not_presented`.
- **OPEN review question:** Request clarification from CEUR editors/workshop organizer: Why is `short10.pdf` hosted and cited but omitted from the 19-entry TOC? Is the TOC/accepted count incomplete, or was the paper excluded from the final published volume? Do not invent the answer.

### 3.1 Complete DBLP → CEUR candidate mapping in the pilot

| PDF filename | Pilot DBLP key | TOC listed | Evidence state |
|---|---|---|---|
| [short1.pdf](https://ceur-ws.org/Vol-3394/short1.pdf) | `conf/chi/PolliniP23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short2.pdf](https://ceur-ws.org/Vol-3394/short2.pdf) | `conf/chi/KullmannPLEC23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short3.pdf](https://ceur-ws.org/Vol-3394/short3.pdf) | `conf/chi/MentlerFPL23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short4.pdf](https://ceur-ws.org/Vol-3394/short4.pdf) | `conf/chi/SpitzerHVK23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short5.pdf](https://ceur-ws.org/Vol-3394/short5.pdf) | `conf/chi/SalikutlukFHBK23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short6.pdf](https://ceur-ws.org/Vol-3394/short6.pdf) | `conf/chi/SadeghianH23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short7.pdf](https://ceur-ws.org/Vol-3394/short7.pdf) | `conf/chi/WeidnerSCB23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short8.pdf](https://ceur-ws.org/Vol-3394/short8.pdf) | `conf/chi/MattioliP23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short9.pdf](https://ceur-ws.org/Vol-3394/short9.pdf) | `conf/chi/ZhengEB23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short10.pdf](https://ceur-ws.org/Vol-3394/short10.pdf) | `conf/chi/Kullmann0HC23` | **NO — disputed** | Hosted + organizer-listed + institution corroboration; not in CEUR TOC |
| [short11.pdf](https://ceur-ws.org/Vol-3394/short11.pdf) | `conf/chi/HePMBHW23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short12.pdf](https://ceur-ws.org/Vol-3394/short12.pdf) | `conf/chi/0009B023` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short13.pdf](https://ceur-ws.org/Vol-3394/short13.pdf) | `conf/chi/SenguptaM23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short14.pdf](https://ceur-ws.org/Vol-3394/short14.pdf) | `conf/chi/0003MZB23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short15.pdf](https://ceur-ws.org/Vol-3394/short15.pdf) | `conf/chi/StampfR23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short16.pdf](https://ceur-ws.org/Vol-3394/short16.pdf) | `conf/chi/KimHE23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short17.pdf](https://ceur-ws.org/Vol-3394/short17.pdf) | `conf/chi/ChenEHLSYPP23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short18.pdf](https://ceur-ws.org/Vol-3394/short18.pdf) | `conf/chi/Mirnig23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short19.pdf](https://ceur-ws.org/Vol-3394/short19.pdf) | `conf/chi/TenerL23` | YES | Source title and PDF filename mapped to CEUR TOC entry |
| [short20.pdf](https://ceur-ws.org/Vol-3394/short20.pdf) | `conf/chi/DubusBM23` | YES | Source title and PDF filename mapped to CEUR TOC entry |

**Mapping method and limit:** The 19 positive matches were manually compared by title/author with the CEUR TOC and the source PDF filenames listed in `ee_json`; the table records evidence at the *title-and-file-reference* level, not 19 independently fetched and cryptographically verified PDFs.

## 4. Proposed normalized assertions and decision register

| Decision ID | Outcome | Review status | Further acceptance evidence |
|---|---|---|---|
| ID-TC-001 | Preserve 2 appearances + 2 source DOI candidates; source volume categories as in pilot; `related_contribution_candidate` only | **PARTIAL**: appearance distinction verified; work-level relation **OPEN** | Publisher-level content/relation evidence and explicit reviewer approval before any same-work merge |
| ID-TC-002 | Preserve 2 appearances + 2 source DOI candidates; source volume categories as in pilot; `related_contribution_candidate` only | **PARTIAL**: appearance distinction verified; work-level relation **OPEN** | Publisher-level content/relation evidence and explicit reviewer approval before any same-work merge |
| ID-TC-071 | Preserve 2 appearances + 2 source DOI candidates; source volume categories as in pilot; `related_contribution_candidate` only | **PARTIAL**: appearance distinction verified; work-level relation **OPEN** | Publisher-level content/relation evidence and explicit reviewer approval before any same-work merge |
| ID-TC-140 | Preserve 2 appearances + 2 source DOI candidates; source volume categories as in pilot; `related_contribution_candidate` only | **PARTIAL**: appearance distinction verified; work-level relation **OPEN** | Publisher-level content/relation evidence and explicit reviewer approval before any same-work merge |
| ID-TC-141 | Preserve 2 appearances + 2 source DOI candidates; source volume categories as in pilot; `related_contribution_candidate` only | **PARTIAL**: appearance distinction verified; work-level relation **OPEN** | Publisher-level content/relation evidence and explicit reviewer approval before any same-work merge |
| ID-AUT23-CAT | Classification `workshop_colocated`; distinct proceedings volume (CEUR 3394) | **VERIFIED**, source-level classification evidence | Preserve CEUR index URL, workshop schedule URL and dated provenance |
| ID-AUT23-TOC | 19 CEUR TOC entries; `short10.pdf` hosted and organizer-listed but absent from TOC | **DISPUTED / OPEN** | Direct editorial/organizer correction or clarification on final volume membership |
| ID-AUT23-TITLE | DBLP and organizer: “Physical Inputs”; CEUR-hosted title and institutional catalogue: “Physical Controls” | **VERIFIED source conflict**; preferred title **OPEN** | Source-field assertions retain both original texts; publisher correction or approved display selection |

## 5. Proposed machine-checkable acceptance tests (not executed)

| Test ID | Given | Expected assertion | Current execution |
|---|---|---|---|
| EV-01 | `conf/chi/Ogozalek94a` and `conf/chi/Ogozalek94` | 2 source records, 2 distinct DOI candidates, 2 appearances; no auto merge; source authorship order unchanged | **NOT RUN** (fixtures statically checked) |
| EV-02 | `conf/chi/IrvingPI94a` and `conf/chi/IrvingPI94` | 2 source records, 2 distinct DOI candidates, 2 appearances; no auto merge; source authorship order unchanged | **NOT RUN** (fixtures statically checked) |
| EV-03 | `conf/chi/MankoffHA00` and `conf/chi/Mankoff00` | 2 source records, 2 distinct DOI candidates, 2 appearances; no auto merge; source authorship order unchanged | **NOT RUN** (fixtures statically checked) |
| EV-04 | `conf/chi/HerbstWZ23` and `conf/chi/HerbstWZ23a` | 2 source records, 2 distinct DOI candidates, 2 appearances; no auto merge; source authorship order unchanged | **NOT RUN** (fixtures statically checked) |
| EV-05 | `conf/chi/RhedenAME25` and `conf/chi/RhedenAME25a` | 2 source records, 2 distinct DOI candidates, 2 appearances; no auto merge; source authorship order unchanged | **NOT RUN** (fixtures statically checked) |
| EV-06 | `Kullmann0HC23`, CEUR 3394 | `workshop_colocated`; no inferred DOI; `TOC=false`, `PDF URL=observed`, `membership=disputed`; preserve raw “Inputs” | **NOT RUN** |
| EV-07 | 19 other AutomationXP pilot papers | Every key maps to one CEUR TOC title; no main CHI inclusion by default | **NOT RUN** |
| EV-08 | `RhedenAME25`, `RhedenAME25a` | Distinct track assertions (Interactivity/Video Showcase) with distinct DOI and source links; same-work remains open | **NOT RUN** |
| EV-09 | Source conflict “Inputs” vs “Controls” | Two source-field assertions preserved; no silent overwrite, explicit reviewed display choice | **NOT RUN** |
| EV-10 | Default main-CHI discovery | All 20 AutomationXP papers excluded; discoverable via workshop filter, respecting unresolved membership | **NOT RUN** |
| EV-11 | Re-import same source and two snapshots | No added appearances/works for exact replay; immutable source records and decision history; unresolved conflicts do not overwrite identity | **NOT RUN** |

## 6. Issue #13 acceptance impact and follow-up

- **AC-03:** New official evidence supports the distinct volume/source categories and a specific workshop crosswalk; final contribution types are not fully verified.
- **AC-04:** Five title/year pairs are documented with separate source keys, source-author order and DOI claims; canonical work relationships remain open.
- **AC-05:** Five disputed pairs and AutomationXP have source cross-checks; the **at least two records per each of seven mandatory years** requirement is not satisfied by this targeted review alone.
- **AC-06 / AC-09:** This provides a partial field-provenance and decision register; rights checks, source policy and approved decision log still need completion.
- **AC-07 / AC-08:** Design fixtures are proposed; Laravel/PostgreSQL ingest, constraints and authorization tests have **NOT RUN**.
- **AC-10:** Approval of model is not authorization for migrations, import, PR merge or GitHub Issue closure.

**Next evidence gate:** Obtain an authoritative editorial explanation for CEUR `short10.pdf`, source-level publisher comparison for the five pair relationships, and explicit approval of any new canonical merge decision. This register is included in an authorized documentation-only Draft PR update; **no approval for any merge, application/database mutation or Issue closure is implied**.

## 7. External source references

[r1]: https://dblp.org/db/conf/chi/chi1994.html
[r2]: https://dblp.org/db/conf/chi/chi1994c.html
[r3]: https://dblp.uni-trier.de/rec/conf/chi/IrvingPI94a.html
[r4]: https://dblp.uni-trier.de/rec/conf/chi/MankoffHA00.html
[r5]: https://dblp.org/db/conf/chi/chi2000a.html
[r6]: https://cris.technion.ac.il/en/publications/hugo-a-high-resolution-tactile-emulator-for-complex-surfaces-2/
[r7]: https://cris.technion.ac.il/en/publications/hugo-a-high-resolution-tactile-emulator-for-complex-surfaces/
[r8]: https://research.monash.edu/en/publications/gesturesock-exploring-toe-gestures-as-alternative-input-method-2/
[r9]: https://uni-salzburg.elsevierpure.com/en/publications/gesturesock-exploring-toe-gestures-as-alternative-input-method-vi/
[r10]: https://programs.sigchi.org/chi/2025/program/session/194795
[r11]: https://programs.sigchi.org/chi/2025/program/content/194078
[r12]: https://exertiongameslab.org/publications
[r13]: https://ceur-ws.org/Vol-3394/
[r14]: https://matthiasbaldauf.com/automationxp23/
[r15]: https://ceur-ws.org/Vol-3394/short10.pdf
[r16]: https://www.bibliothek.tu-chemnitz.de/uni_biblio/frontdoor.php?la=de&source_opus=40887
[r17]: https://dblp.dagstuhl.de/db/conf/chi/axp2023.html
[r18]: https://www.mdpi.com/2078-2489/15/8/460
[r19]: https://dblp.uni-trier.de/rec/conf/chi/HerbstWZ23a.html
[r20]: https://dblp.dagstuhl.de/rec/conf/chi/Ogozalek94a.html
[r21]: https://dblp.org/db/conf/chi/chi2023a.html
[r22]: https://research.monash.edu/en/publications/gesturesock-exploring-toe-gestures-as-alternative-input-method/

