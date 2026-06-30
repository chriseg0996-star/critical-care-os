# ADR-0002 — Record engine dependency cycles from SPEC-003/004/005

**Status:** Accepted — debt acknowledged, **resolution deferred to a future ADR**
**Date:** 2026-06-30
**Scope:** `SPEC-003` (Validation), `SPEC-004` (Template), `SPEC-005` (Calculation)
**Relates to:** ADR-0001 (confirms and extends issue D-1)
**Authority trace:** SPEC-000 Article VI (dependency direction; circular dependencies prohibited)

---

## Context

SPEC-004 (Template Engine) and SPEC-005 (Calculation Engine) were ratified and committed as
canonical. Their `Dependencies` / `Consumers` declarations, combined with SPEC-003 (Validation
Engine), introduce or confirm dependency cycles that violate **SPEC-000 Article VI**.

This ADR **records** the cycles. It does **not** resolve them.

---

## Recorded Issues

### C1 — HARD declared cycle: Validation ↔ Template (confirms ADR-0001 D-1)

- SPEC-003 §12: Validation Engine **depends on** Template Engine (SPEC-004).
- SPEC-004 §11: Template Engine **depends on** Validation Engine (SPEC-003).
- Both directions are now declared in the respective `Dependencies` sections.
- **Confirmed Article VI violation** (hard cycle). ADR-0001 anticipated this as D-1; SPEC-004 §11
  supplies the confirming half.

### C2 — Implied cycle + inconsistency: Validation ↔ Calculation

- SPEC-005 §10: Calculation Engine **depends on** Validation Engine (SPEC-003).
- SPEC-005 §11: lists **Validation Engine as a consumer** of Calculation (Validation verifies
  Calculation outputs); SPEC-003 §2 includes "Calculation Engine outputs" in Validation's scope.
- Inconsistency: SPEC-003 §12 does **not** declare Calculation as a dependency, yet SPEC-005 §11
  declares Validation a consumer of Calculation. Under "consumer ⇒ dependency," this forms an
  implied cycle.

### C3 — Systemic root cause: the "Validation validates everyone" pattern

- SPEC-003 §2 scopes Validation over the outputs of Context, Documentation, Template, and
  Calculation — i.e. Validation consumes their outputs — while those engines also depend on
  Validation (SPEC-001 §11, SPEC-004 §11, SPEC-005 §10).
- Under a consumer-implies-dependency reading, Validation forms an implied cycle with **every**
  engine it validates. Only **C1** is a *hard declared* cycle today; C2/C3 are implied by the
  validate-outputs relationship and the same root tension.

---

## Decision

1. **Accept** C1–C3 as known architectural debt to keep the SPEC pipeline moving.
2. **Defer** resolution to a future resolving ADR.
3. No dependency re-pointing or re-layering is applied here.

---

## Candidate resolution (for the future ADR — NOT applied)

Treat validated/used outputs as **runtime inputs** to the Validation Engine rather than
**architectural dependencies**. Concretely: remove Template (and other output-producing engines)
from Validation's §12 `Dependencies`, leaving only Constitution + Context (schema/snapshot).
This breaks C1 and the implied cycles while preserving the validate-everyone capability, and is
consistent with the SPEC-003 Consolidated Review's "indirect via schema + snapshot interface"
intent (ADR-0001 D-2). Recorded as a candidate only; the resolving ADR decides.

---

## Consequences

- The repository knowingly contains an **Article VI** violation (C1 hard; C2/C3 implied).
- Per ADR-0001, downstream work **must not harden** the `Validation → Template` direction.
  Therefore **implementation / design-artifact generation for Validation, Template, and
  Calculation is blocked** until either (a) the cycle is resolved, or (b) explicit authorization
  is given to build on the accepted cycle.
- The Documentation Engine design artifacts already in `docs/engines/` are unaffected (they
  treat Validation/Context as delegation boundaries, not concrete dependencies).

---

## Follow-up

- [ ] Future ADR to resolve C1–C3 (likely the candidate above).
- [ ] Re-check when the Rule Registry SPEC (SPEC-003 §17) lands.
- [ ] Re-review SPEC-001/004/005 dependency declarations after resolution.
