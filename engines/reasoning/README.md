# Reasoning Engine (SPEC-008)

Implementation of `specs/SPEC-008_REASONING_ENGINE.md`. Substrate per ADR-0004 (TypeScript on
Node, run via `tsx`).

**Bounded synthesis only.** This engine combines structured upstream outputs into a deterministic
reasoning output. It is **non-autonomous**, takes no action, modifies no input, overrides nothing,
and stores no state (SPEC-008 §4, §17 invariants 1–8).

## The clinical-content boundary (important)

The engine implements the deterministic **synthesis mechanism** (§6 model, §8 components, §7
output). It does **not** hardcode clinical reasoning rules — SPEC-008 defines none, and the
Constitution forbids inventing clinical data (Art. IX; SPEC-008 §4 "replace clinical judgment").

Therefore clinical *content* — the active problems, the keyed claims, and the candidate
recommendations — is **carried in the structured inputs**. The engine only:

- **synthesizes** them into one model (FR-001),
- **prioritizes** problems by the severity/urgency fields present in the data (FR-002),
- **detects contradictions** structurally (same claim key, differing value across sources, FR-004),
- **binds** provided candidate recommendations to ranked problems, marked bounded (FR-003),
- **flags uncertainty** from structural signals — missing fields, conflicts, low-confidence marks
  (FR-005),
- and emits an immutable, deterministic **trace** (FR-006, FR-007).

Real clinical weighting/criteria are a knowledge concern supplied by upstream engines/modules, not
this engine.

## Inputs follow §6/§9 (Template excluded)

Sources: Context, Validation, Calculation, Evidence, Workflow — exactly §6 (Reasoning Model inputs)
and §9 (dependencies). Template is **excluded**: it is absent from §6 and §9. (The §1 prose mention
of Template is the previously-flagged intra-spec inconsistency; this implementation follows the
explicit structural sections, per "implement only what is explicitly defined.")

## Component map (SPEC-008 §8)

| §8 component | Source |
|--------------|--------|
| Synthesis Engine | `src/components.ts` |
| Prioritization Engine | `src/components.ts` |
| Conflict Resolver | `src/components.ts` |
| Recommendation Generator | `src/components.ts` |
| Uncertainty Modeler | `src/components.ts` |
| Trace Builder | `src/components.ts` |
| (orchestration) Reasoning Engine | `src/orchestrator.ts` |

Output model (`§7`) and types: `src/types.ts`. Error model (`§11`): `src/errors.ts`.

## Usage

```ts
import { createDefaultReasoningEngine } from "./src/index.ts";

const engine = createDefaultReasoningEngine();
const out = engine.reason({
  context: { problems: [{ id: "p1", label: "shock", severity: 9, urgency: 3, source: "context" }] },
  validation: { claims: [{ key: "map", value: "70", source: "validation" }] },
  calculation: { claims: [{ key: "map", value: "65", source: "calculation" }] },
  evidence: { recommendations: [{ id: "r1", text: "...", problemId: "p1", evidenceRef: "SSC2021" }] },
  workflow: { state: "critical" },
});
// out.prioritized_problems, clinical_interpretation, recommendations, contradictions,
// uncertainty_flags, reasoning_trace  (§7)
```

## Test

```
cd engines/reasoning
npm test        # tsx --test test/*.test.ts   (Node ≥ 24)
```

## Scope boundary

Implements only what SPEC-008 explicitly defines. No inferred dependencies, no extra engines, no
spec modifications. Dependency direction per ADR-0003 (no cycles).
