# Workflow Engine (SPEC-007)

Implementation of `specs/SPEC-007_WORKFLOW_ENGINE.md`. Substrate per
`docs/architecture/decisions/ADR-0004-implementation-substrate-typescript.md` (TypeScript on
Node, run via `tsx`).

**Orchestration only.** This engine sequences other engines into a deterministic pipeline. It
performs no computation, validation, reasoning, or content generation (SPEC-007 §4, §19).

## Pipeline (SPEC-007 §6 / FR-001)

```
Event → Context → Validation → Calculation → Evidence → Template → Documentation → Final Output
```

Order is fixed and deterministic: identical input event sequences produce identical execution
paths (FR-004), with byte-identical, immutable traces (§5, §15) — no wall-clock or randomness is
used in the execution path.

## Component map (SPEC-007 §10)

| SPEC §10 component | Source |
|--------------------|--------|
| Workflow Orchestrator | `src/orchestrator.ts` |
| Event Dispatcher | `src/components.ts` |
| State Manager | `src/components.ts` |
| Execution Planner | `src/components.ts` |
| Trace Logger | `src/components.ts` |
| Engine Sequencer | `src/components.ts` |

Supporting: `src/types.ts` (§8/§9 models), `src/errors.ts` (§13), `src/engine.ts` (stateless
engine service contract).

## Engines are stateless services

Engines plug into a registry via the `Engine` interface (`execute(input) → output`). They are
**not** implemented here. `createPassThroughEngine` provides inert test-double adapters so the
orchestration runs end-to-end and is provably deterministic; replace each slot with the real
engine (same interface) as its SPEC is implemented.

## ICU state machine (SPEC-007 §7 / FR-002)

`stable → deteriorating → critical → recovering → (loop) stable`. The Workflow Engine only
**enforces** these transitions; the decision to transition is carried by the event
(`requestedState`), never computed — computing it would be reasoning (forbidden by §4).

## Usage

```ts
import { createDefaultWorkflowEngine } from "./src/index.ts";

const wf = createDefaultWorkflowEngine();
const result = wf.execute(
  { id: "e1", type: "vital_signs", requestedState: "deteriorating" },
  "stable",
);
// result.trace, result.stateTransition, result.engineOutputs, result.finalArtifact (§9)
```

## Test

```
cd engines/workflow
npm test        # tsx --test test/*.test.ts   (Node ≥ 24)
```

## Scope boundary

Implements only what SPEC-007 explicitly defines. No inferred dependencies, no extra engines, no
spec modifications. Cross-spec dependency direction follows ADR-0003 (Validation is schema-based
and engine-agnostic; no cycles).
