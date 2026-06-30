# ADR-0001 — Accept known architectural debt in SPEC-003 (Validation Engine)

**Status:** Accepted — debt acknowledged, **resolution deferred to a future ADR**
**Date:** 2026-06-30
**Scope:** `specs/SPEC-003_VALIDATION_ENGINE.md` (v1.0.0, Canonical)
**Authority trace:** SPEC-000 Constitution §4 (conflict order), Article VI (dependency direction)

---

## Context

SPEC-003 was ratified and committed as canonical on the explicit instruction to *accept known
architectural debt* and *record issues for a later ADR*. Two issues were detected during
compliance review and are **not** resolved by this ADR. This record exists so a future ADR can
resolve them deliberately rather than silently.

This ADR records a decision the project authority made (accept + defer). It does **not** itself
choose a remediation — the remediation is the subject of a future ADR.

---

## Recorded Issues

### Issue D-1 — Circular dependency: Validation ↔ Template (Constitution Article VI)

- SPEC-003 §12 (Dependencies): Validation Engine **depends on** Template Engine (SPEC-004).
- SPEC-003 §13 (Consumers): Template Engine is a **consumer of** Validation Engine.
- Result: `Validation → Template → Validation` — a dependency cycle.
- Violates **SPEC-000 Article VI** (*"Circular dependencies are prohibited"*; dependencies flow
  from stable foundations toward specialized components) and is in tension with **SPEC-003 §20.5**
  (*"Validation is engine-agnostic"*).
- Secondary concern: a Core infrastructure engine depending on Template Engine (SPEC-004, not yet
  specified) inverts the foundation→specialized direction.

**Severity:** architectural (Article VI). **Status:** open.

### Issue D-2 — Context Engine dependency: direct vs indirect divergence

- The prior *SPEC-003 Consolidated Canonical Review* mandated the Context Engine dependency be
  **indirect only** — *"via schema + snapshot interface, not semantic coupling."*
- SPEC-003 §12 (this canonical version) declares a **direct** dependency on Context Engine (SPEC-002).
- Two canonical artifacts disagree on coupling style.
- Note: this is **not** a cycle — SPEC-002 §14 forbids Context depending on Validation, and §15
  lists Validation as a Context consumer; direction remains one-way.

**Severity:** consistency / coupling-style. **Status:** open.

---

## Decision

1. **Accept** SPEC-003 v1.0.0 as canonical with issues D-1 and D-2 present.
2. **Defer** resolution of D-1 and D-2 to a future ADR.
3. Unblock the SPEC-004 / SPEC-005 phase on this basis.

No remediation (re-pointing dependencies, downgrading to indirect coupling, re-layering Template
Engine) is chosen here.

---

## Consequences

- The repository knowingly contains an **Article VI violation** (D-1) until a future ADR resolves it.
- Downstream implementation **must not** build on the `Validation → Template` dependency direction
  until D-1 is resolved, to avoid hardening the cycle.
- SPEC-004 (Template Engine), when authored, should be reviewed against D-1 — its dependency
  declaration will determine how the cycle is broken.
- D-2 must be reconciled when SPEC-002's interface contract is implemented (direct vs
  schema/snapshot-mediated access).

---

## Follow-up

- [ ] Future ADR to resolve D-1 (break the Validation↔Template cycle).
- [ ] Future ADR to resolve D-2 (fix Context coupling style: direct vs indirect).
- [ ] Re-review when SPEC-004 Template Engine is ratified.
