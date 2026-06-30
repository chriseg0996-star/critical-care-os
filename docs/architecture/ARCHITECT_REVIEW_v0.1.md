# Critical Care OS — Architect Review (v0.1)

> Status: analysis only. No existing files modified. Author: Lead Software Engineer.
> Scope: full repository read (20 modules, meta/governance, templates, examples, tests).

---

# Repository Overview

Critical Care OS is a **layered, versioned, Markdown knowledge base** intended to be
uploaded as ChatGPT Project knowledge. It behaves as an instruction set that makes the
model write ICU documentation, reason physiologically, and compute clinical values in a
consistent Spanish critical-care voice.

## Actual layout (inner root)

```
critical-care-os-v0.1/            <- redundant wrapper (unzip artifact)
└── critical-care-os-v0.1/        <- TRUE repo root
    ├── VERSION, manifest.json, README, CHANGELOG, CONTRIBUTING, LICENSE
    ├── .github/ (issue + PR templates)
    ├── docs/architecture, docs/roadmap
    ├── modules/
    │   ├── 00_core/        00..05  (system, style, doc-rules, reasoning, calc, scores)
    │   ├── 10_documentation/ 10..13 (evolution, admission, discharge, consult)
    │   ├── 20_physiology/  20..23  (vent, ABG, hemodynamics, renal+lytes+RRT)
    │   ├── 30_specialties/ 30..31  (neuro, ID/sepsis)
    │   ├── 40_imaging/     40
    │   ├── 50_research/    50
    │   └── 60_automation/  60
    ├── templates/ (1 note template, 1 prompt)
    ├── examples/  (empty — README only)
    └── tests/     (empty — README only)
```

## Mental model of the architecture

- **Layered numbering** (`00_core` → `60_automation`) with **gap numbering** (00,10,20…)
  to allow future insertion. Sound instinct, borrowed from BASIC line numbers / Linux runlevels.
- **Core = global behavior; clinical layers = specialty knowledge.** The stated contract
  ("global rules only in Core") is the right separation-of-concerns axis.
- **`manifest.json`** is a flat, hand-maintained list of module paths — the closest thing
  to a load specification.
- **"Activation principle"**: modules are supposed to "activate" when a request matches
  scope, and combine without duplicating text.

## The load-time reality (important)

ChatGPT Projects do **not** conditionally load files — all project knowledge is available to
retrieval simultaneously. Therefore:

- "Activation" is **enforced only by the model reading each module's `## Scope` header**,
  not by any runtime. It is a prompt-engineering convention, not a mechanism.
- Duplicated text across modules is not just untidy — it produces **conflicting or
  redundant instructions in the same context window**, which is the failure mode this
  system most needs to avoid.

This single fact drives most of the recommendations below.

---

# Strengths

1. **Correct separation axis.** Core (behavior) vs clinical (knowledge) is the right
   primary decomposition and is stated explicitly.
2. **Gap numbering** allows insertion without renumbering neighbors.
3. **Versioning discipline is unusually mature for v0.1**: `VERSION`, `CHANGELOG`,
   `manifest.json` version, and a multi-release `ROADMAP` all agree on `0.1.0`.
4. **Governance scaffolding exists early**: `CONTRIBUTING`, PR template, and a
   module-request issue template encode the contribution contract before contributors arrive.
5. **Clinical priorities are physiologically sound**: the reasoning ladder
   (life threats → perfusion/DO₂ → respiratory → neuro → renal → infection → heme →
   nutrition → procedures → disposition) is defensible intensivist ordering.
6. **Anti-fabrication rule is front-and-center** (`00_SYSTEM`): "never invent labs,
   imaging, dates, procedures, exam findings." This is the most important clinical-safety
   rule and it is correctly placed in Core.
7. **Language policy is explicit**: Spanish for clinical output, English for repo/technical.
8. **Style module is opinionated and useful** — it bans real filler ("se encuentra estable"
   without why, "continuar vigilancia estrecha") and mandates by-system lab integration.
   This is the kind of concrete behavior that differentiates this from a generic prompt.

---

# Weaknesses

1. **Double-nested root directory** (`.../critical-care-os-v0.1/critical-care-os-v0.1/`).
   Breaks clone-and-upload and any tooling that assumes the repo root is the git root.
2. **Documentation-vs-reality drift.** `ARCHITECTURE.md` advertises modules that do not
   exist as files: Handoffs, Family updates, Procedures, Nutrition, Sedation/analgesia,
   Cardiovascular ICU, Hematology, Liver failure, Toxicology, and most Imaging/Automation
   sub-items. The architecture document reads as a wishlist, not a map of the repo.
3. **Duplicated canonical knowledge** (the core structural problem):
   - **Formulas** appear in `00_core/04_CALCULATIONS` *and* are restated in
     `20_MECHANICAL_VENTILATION` (VT/PBW, PaFi, driving pressure, compliance, mechanical
     power, minute ventilation), `22_HEMODYNAMICS` (SV, CO, CI, SVR, DO₂/VO₂/O₂ER), and
     `23_RENAL` (urine output, corrected Na, osmolarity, free-water deficit).
   - **Scores** appear in `00_core/05_SCORES` *and* are restated in `30_NEUROCRITICAL`
     (Fisher, WFNS, Hunt-Hess, GRAEB, NIHSS, ASPECTS, ICH).
   - **Organ-system list** (Neurológico…Hematoinfeccioso) is repeated in `01_WRITING_STYLE`,
     `02_DOCUMENTATION_RULES`, `10_ICU_EVOLUTION_NOTES`, and the note template.
   There is no rule declaring which module **owns** a concept, so every duplicate is a
   future divergence.
4. **No formula/units definitions anywhere.** Calculations are named but never defined.
   "Corrected sodium," "osmolarity," "predicted body weight," "mechanical power" each have
   multiple published formulas; without pinning one, the model silently picks its own and
   reproducibility is lost. For a system claiming "clinically accurate," this is the largest
   clinical debt.
5. **No evidence/citation layer.** "Evidence-based" is asserted but there are no references
   and no guideline version pins (SSC, KDIGO, Berlin/ARDS, Surviving Sepsis, NICE-SUGAR…).
6. **No machine-readable module metadata.** No frontmatter (id, version, status, triggers,
   dependencies, owned-topics). `manifest.json` cannot express load order, criticality, or
   a dependency graph; it is a path list.
7. **`60_AUTOMATION_ENGINE` overlaps Core `04`/`05` and the roadmap's "Calculations Engine"
   (v0.3).** Its boundary is undefined — is it formulas, triggers, or output format?
8. **Empty tests and examples.** Regression testing is promised but impossible (only
   READMEs). `CONTRIBUTING` rule #4 ("include examples for any new documentation module")
   is already violated by all four documentation modules.
9. **`23_RENAL_ELECTROLYTES_RRT` bundles three responsibilities** (AKI/CKD, electrolytes/
   acid-base, RRT/CRRT) — violating the one-responsibility principle the project states.
10. **`LICENSE.md` contains no license terms** — only a data-handling note. Ambiguous for a
    project meant to "evolve for years."

---

# Scalability

The current design scales **organizationally** (folders/numbering) but not **structurally**
(no metadata, no dedupe enforcement, no generated manifest). At 100+ modules the following
break first:

- **Hand-maintained `manifest.json`** drifts from the filesystem (it already omits
  templates/examples/tests; `ARCHITECTURE.md` already drifted).
- **Duplicated formulas/scores** diverge silently across dozens of modules.
- **Filename-coupled numbering** (`20_` file inside `20_physiology/`) forces renumbering
  when a module changes layer; cross-references by filename then rot.
- **No CI** means none of the above is caught.

The scalable shape is a **two-plane architecture**:

- **Knowledge plane (data, canonical, single-owner):** formulas, units, reference ranges,
  score definitions, drug concentrations, guideline pins. Each fact owned by exactly one ID.
- **Behavior plane (instructions):** how to write, reason, document. Behavior modules
  *reference* knowledge IDs; they never restate a formula.

Plus a **metadata contract** (YAML frontmatter per module) from which `manifest.json` and a
trigger index are **generated**, validated by **CI**.

---

# Missing Modules

**Core / foundation**
- `06_SAFETY_GUARDRAILS` — decision-support scope limits, dose verification, no autonomous
  orders, escalation cues. (Currently only anti-fabrication exists.)
- `07_UNITS_AND_FORMULAS` — canonical formula + unit registry (the single source of truth).
- `08_GLOSSARY` — abbreviations and term canon (ES/EN).

**Documentation** (modules referenced by `ARCHITECTURE.md`, not built)
- Handoff / SBAR, Family update, Procedure note, Brain-death / death note, Code (RCP) note.

**Physiology**
- Sedation / analgesia / delirium (RASS, CAM-ICU), Nutrition, **standalone Acid-base**
  (currently homeless between ABG and renal), Fluids & transfusion, Temperature / TTM.

**Specialties**
- Cardiovascular ICU (ACS, arrhythmia, post-arrest), Liver failure, Toxicology,
  Hematology/coagulation, Endocrine emergencies (DKA/HHS, thyroid, adrenal),
  Trauma/burns, Obstetric critical care.

**Reference / evidence**
- `references/` citation registry with guideline version pins.

---

# Technical Debt

| # | Debt | Severity | Why it hurts |
|---|------|----------|--------------|
| 1 | Double-nested root | High | Breaks clone/upload/tooling |
| 2 | Duplicated formulas/scores, no ownership rule | High | Silent clinical divergence at scale |
| 3 | Formulas named but undefined | High (clinical) | Non-reproducible numbers |
| 4 | `ARCHITECTURE.md` ⇆ filesystem drift | Med | Misleads contributors |
| 5 | No frontmatter / metadata contract | Med | Blocks generated manifest + CI |
| 6 | Hand-maintained manifest | Med | Drifts from reality |
| 7 | Empty tests/examples | Med | No regression safety net |
| 8 | `60_AUTOMATION` boundary undefined | Med | Overlaps Core 04/05 |
| 9 | `23_RENAL` over-bundled | Low | Splits cleanly later |
| 10 | No real LICENSE / CODEOWNERS | Low | Governance gap for long life |

---

# Suggested Refactors

> Design only. None applied. Ordered by leverage.

**R1 — Flatten the nested root.** Move inner `critical-care-os-v0.1/*` up one level; the
git root becomes the repo root.

**R2 — Establish single-ownership of canonical knowledge.** Add `00_core/07_UNITS_AND_FORMULAS`
as the *only* place formulas/units are defined. Convert the restated formulas in
`20`/`22`/`23` to **references** ("calcula driving pressure — ver 07") rather than copies.
Same for scores: `05_SCORES` owns definitions; `30_NEUROCRITICAL` references them.

**R3 — Add a metadata contract (frontmatter).** Every module gains:
```yaml
---
id: PHYS-VENT
title: Mechanical Ventilation
layer: 20_physiology
version: 0.1.0
status: stub        # stub | draft | stable
owns: []            # canonical topics this module is sole source of
triggers: ["ventilador", "modo ventilatorio", "driving", "weaning"]
depends_on: [CORE-CALC, CORE-UNITS]
see_also: [PHYS-ABG]
---
```
A stable module `id` decouples identity from numeric order, killing the rename-on-move problem.

**R4 — Generate `manifest.json` and a trigger index from frontmatter.** Stop hand-editing.
Add `schemas/module.schema.json`.

**R5 — Add CI** (`.github/workflows/validate.yml`): every manifest path exists, every module
has valid frontmatter, every `owns` topic is owned by exactly one module (dedupe gate),
triggers are unique, no orphan files.

**R6 — Reconcile `ARCHITECTURE.md` to reality** and mark unbuilt modules as `planned`.

**R7 — Redefine `60_AUTOMATION` narrowly** as the trigger-routing + output-format contract,
not a formula store.

**R8 — Split `23_RENAL_ELECTROLYTES_RRT`** into renal (AKI/CKD), electrolytes, acid-base, RRT
when those modules are fleshed out (v0.6).

**R9 — Seed `tests/` and `examples/`** with one real fixture per documentation module so the
`CONTRIBUTING` rule is satisfied and regression checks become possible.

---

# Version Roadmap (architect's adjustment)

The existing roadmap is content-driven (which clinical domains ship when). It is good but
omits the **structural** work that must precede content, or duplication compounds. Proposed
interleave:

- **v0.2 — Documentation Engine + Metadata foundation** (see next section). Ship the
  documentation modules *and* the frontmatter contract / generated manifest / CI together,
  so every later module is born with metadata.
- **v0.3 — Calculations & Knowledge plane.** Build `07_UNITS_AND_FORMULAS` as canonical;
  refactor existing formula duplicates to references. (This is the original v0.3 plus R2.)
- **v0.4–v0.8** — as the existing roadmap (vent/ABG → hemodynamics → renal → neuro → ID),
  each new module born with frontmatter and references, never restating canon.
- **v1.0 — Integrated ICU OS** — all core workflows usable, regression fixtures real,
  evidence pins in place.

---

# Long-term Vision

A **two-plane, metadata-driven clinical OS**:

- **Knowledge plane** — canonical, single-owner, citable facts (formulas, ranges, scores,
  drugs, guideline pins). Versioned per fact, pinned to evidence.
- **Behavior plane** — voice, reasoning, documentation structure. References knowledge by ID.
- **Generated artifacts** — `manifest.json`, trigger index, and (eventually) a printable
  "module catalog" all derive from frontmatter; humans never hand-maintain them.
- **CI as the dedupe enforcer** — the structural guarantee that "global rules live only in
  Core" and "one fact, one owner" cannot rot.
- **Evidence-pinned** — every clinical claim traceable to a dated guideline, so the OS can be
  re-validated when guidelines update (SSC, KDIGO, Berlin, etc.).

Designed like Linux: a small stable Core, a clear module ABI (frontmatter contract), and an
ecosystem of independently versioned modules that compose without colliding.

---

# Roadmap — MoSCoW (v0.2 candidate scope)

### Must Have
- **M1** Flatten nested root (R1).
- **M2** Frontmatter contract on all existing modules + `schemas/module.schema.json` (R3).
- **M3** Generate `manifest.json` from frontmatter; reconcile `ARCHITECTURE.md` (R4, R6).
- **M4** Single-ownership rule documented + `00_core/07_UNITS_AND_FORMULAS` created and the
  existing formula duplicates converted to references (R2).
- **M5** Flesh out the four documentation modules to "draft" with one example each (closes
  the violated CONTRIBUTING rule).

### Should Have
- **S1** CI validation workflow (R5).
- **S2** `06_SAFETY_GUARDRAILS` module.
- **S3** Real templates for admission/discharge/consult notes (parity with the modules).
- **S4** `tests/` fixtures: one regression case per documentation module.

### Could Have
- **C1** `08_GLOSSARY`.
- **C2** Handoff/SBAR and Family-update modules (high daily value, low complexity).
- **C3** `references/` registry skeleton + first guideline pins.

### Won't Have (yet)
- **W1** New specialty domains (cardiac ICU, liver, tox) — wait for the knowledge plane.
- **W2** Splitting `23_RENAL` — defer to v0.6 when content justifies it.
- **W3** Any runtime/automation tooling beyond static knowledge — ChatGPT Projects can't run it.

---

# Proposed v0.2 — "Documentation Engine + Metadata Foundation" (design only)

**Theme:** make the documentation layer real *and* give every module a contract, so the
project scales cleanly from here.

**Deliverables**
1. Flattened repo root.
2. YAML frontmatter on all 20 modules; `schemas/module.schema.json`.
3. `manifest.json` regenerated from frontmatter (now carrying id/version/status/triggers/deps).
4. `00_core/07_UNITS_AND_FORMULAS` (canonical) + duplicate formulas in `20/22/23` rewritten as
   references; `30_NEUROCRITICAL` scores rewritten as references to `05_SCORES`.
5. The four documentation modules promoted stub → draft, each with a worked, de-identified
   example in `examples/`.
6. `ARCHITECTURE.md` reconciled; unbuilt modules labeled `planned`.

**Acceptance criteria**
- Every file in `manifest.json` exists and every module has schema-valid frontmatter.
- No formula or score is defined in more than one module (each has exactly one `owns`).
- Each documentation module has ≥1 example.
- `VERSION`, `CHANGELOG`, `manifest.json` all read `0.2.0`.

**Explicitly out of scope for v0.2:** new clinical specialties, the calculations content
expansion (that is v0.3 once the knowledge plane exists), and CI (Should-Have, not blocking).

---

*End of review. Awaiting approval before modifying any existing file.*
