# ADR-0004 — Implementation substrate for engine code: TypeScript on Node (tsx)

**Status:** Accepted
**Date:** 2026-06-30
**Scope:** Executable engine implementations (first applied: SPEC-007 Workflow Engine)
**Authority trace:** SPEC-000 Article III (implementation follows specification), `specs/README.md` (ADR rule)

---

## Context

SPEC-007 (Workflow Engine) was directed to be implemented as a **working module**. Producing
executable code requires choosing a substrate (language/runtime). Unlike SPEC-001 §20 — which
explicitly excluded *"programming language selection"* and forced the earlier "design artifacts
only" mode — **SPEC-007 §18 does not exclude language selection**, so an implementation substrate
may be chosen here without contradicting the spec.

## Decision

- **Language:** TypeScript (ESM).
- **Runtime:** Node ≥ 24, executed and tested via **`tsx`** + the built-in **`node:test`** runner.
- **Dependencies:** none at runtime; standard library only.
- **Code placement:** `engines/<engine>/` (first: `engines/workflow/`), kept distinct from:
  - `specs/` — canonical specification text,
  - `docs/engines/` — implementation-independent design artifacts,
  - `modules/` — clinical knowledge (markdown).

## Rationale

- Matches the project owner's documented preference (TypeScript for standalone modules).
- Zero-build execution via `tsx`; deterministic; no third-party supply chain.
- `node:test` gives reproducible compliance tests with no extra tooling.

## Consequences

- Running/testing requires Node 24 + `tsx` (present in the current environment).
- Future engine implementations follow this substrate and the shared `Engine` service interface,
  unless a later ADR supersedes it.
- This ADR governs **implementation only**; it changes no specification and no architecture.
