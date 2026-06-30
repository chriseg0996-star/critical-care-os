# ADR-0003 — Validation is schema-based and engine-agnostic; validated outputs are artifacts, not dependencies

**Status:** Accepted
**Date:** 2026-06-30
**Resolves:** ADR-0001 (D-1, D-2) and ADR-0002 (C1, C2, C3) — all closed by this ruling
**Authority:** Project architectural ruling
**Authority trace:** SPEC-000 Article VI (dependency direction), Article VIII (documentation is source of truth), Article XVII (separation of concerns)

---

## Context

Prior compliance review (ADR-0001, ADR-0002) inferred engine dependency **cycles** by treating two
relationships as architectural dependencies:

- a "consumer" relationship (engine B consumes engine A's output), and
- the Validation Engine's scope over other engines' outputs ("Validation validates X").

Under that inference, the Validation Engine appeared to form cycles with Template, Calculation,
Documentation, and Evidence.

## Ruling (project authority)

1. The Validation Engine has **no domain dependency** on the engines it validates (Evidence stated
   explicitly; the principle is general).
2. Validation **only validates structured outputs** produced by engines.
3. An engine's output (e.g., an Evidence artifact) is an **artifact, not a dependency**.
4. Validation remains **schema-based and engine-agnostic**.
5. No cycle constraints are introduced; the current architecture continues.

## Decision / Interpretation

- "Validation validates the outputs of X" and "X consumes Validation" are **not** architectural
  dependencies on each other. The consumer-implies-dependency inference is **retracted**.
- Validation depends on **schemas / output contracts** (stable artifacts), not on the engines that
  produce them. Engines depend on the Validation **service**. These are different directions over
  different objects → **no cycle**.
- The engine dependency graph is therefore **acyclic**. **No SPEC-000 Article VI violation exists.**

### Status of prior issues

| Prior ID | Was | Now |
|----------|-----|-----|
| ADR-0001 D-1 / ADR-0002 C1 (Validation↔Template) | hard cycle | **Resolved** — schema/contract coupling, not domain dependency |
| ADR-0001 D-2 (Context direct vs indirect) | divergence | **Resolved** — schema-based coupling is the canonical reading |
| ADR-0002 C2 (Validation↔Calculation) | implied cycle | **Resolved** — outputs are artifacts |
| ADR-0002 C3 (Validation↔everyone) | systemic implied | **Resolved** — validates-outputs ≠ dependency |
| Evidence instance (SPEC-006) | implied cycle | **Resolved** — same ruling |

## Consequence

- Cycle analysis is **no longer a blocker** to implementation.
- Compliance review will treat the Validation scope and consumer relationships as runtime
  artifact flows, not dependency edges.

## Residual cleanup (optional, non-blocking)

SPEC-003 §12 and SPEC-004 §11 list engines under a heading named **"Dependencies."** Per this
ruling those entries denote **schema/output-contract coupling**, not domain dependencies. A wording
clarification (e.g., distinguishing "service dependencies" from "validated output contracts") would
make the canonical text unambiguous (Article VIII / Article XV). Deferred; not required for progress.
