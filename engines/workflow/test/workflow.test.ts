/**
 * SPEC-007 Workflow Engine — compliance tests.
 * Each test cites the SPEC-007 clause it verifies. Run: `npm test` (tsx + node:test).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  WorkflowOrchestrator,
  createDefaultWorkflowEngine,
  createPassThroughEngine,
  PIPELINE_ORDER,
  WorkflowError,
  type ClinicalEvent,
  type EngineRegistry,
  type EngineName,
  type Engine,
} from "../src/index.ts";

const ev = (over: Partial<ClinicalEvent> = {}): ClinicalEvent => ({
  id: "e1",
  type: "vital_signs",
  ...over,
});

function registryWith(overrides: Partial<Record<EngineName, Engine>> = {}): EngineRegistry {
  const base = Object.fromEntries(
    PIPELINE_ORDER.map((n) => [n, createPassThroughEngine(n)]),
  ) as Record<EngineName, Engine>;
  return Object.freeze({ ...base, ...overrides });
}

// FR-001 / §6 — deterministic execution order Context -> ... -> Documentation.
test("executes engines in the exact SPEC-007 §6 pipeline order", () => {
  const wf = createDefaultWorkflowEngine();
  const result = wf.execute(ev(), "stable");
  const engineStages = result.trace
    .filter((t) => t.stage !== "workflow")
    .map((t) => t.stage);
  assert.deepEqual(engineStages, [...PIPELINE_ORDER]);
  assert.equal(result.finalArtifact.engine, "documentation"); // §9 final artifact = last engine
});

// FR-004 / §14 — same input event sequence -> identical execution path (deterministic replay).
test("is deterministic: identical inputs produce identical trace and outputs", () => {
  const a = createDefaultWorkflowEngine().execute(ev(), "stable");
  const b = createDefaultWorkflowEngine().execute(ev(), "stable");
  assert.deepEqual(a.trace, b.trace);
  assert.deepEqual(a.engineOutputs, b.engineOutputs);
  assert.deepEqual(a.stateTransition, b.stateTransition);
});

// FR-005 / §15 — full per-event trace, immutable.
test("produces an immutable execution trace with one entry per engine", () => {
  const result = createDefaultWorkflowEngine().execute(ev(), "stable");
  const perEngine = result.trace.filter((t) => t.stage !== "workflow");
  assert.equal(perEngine.length, PIPELINE_ORDER.length);
  assert.throws(() => {
    // @ts-expect-error verifying runtime immutability (§15)
    result.trace.push({ step: 99, stage: "workflow", severity: "INFO", message: "x" });
  });
});

// FR-002 / §7 — valid forward transition is applied.
test("applies a valid §7 state transition (stable -> deteriorating)", () => {
  const result = createDefaultWorkflowEngine().execute(
    ev({ requestedState: "deteriorating" }),
    "stable",
  );
  assert.deepEqual(result.stateTransition, { from: "stable", to: "deteriorating" });
});

// §13 — inconsistent state: illegal transition rejected (ERROR).
test("rejects an illegal state transition not defined by §7", () => {
  try {
    createDefaultWorkflowEngine().execute(ev({ requestedState: "critical" }), "stable");
    assert.fail("expected illegal transition to throw");
  } catch (e) {
    assert.ok(e instanceof WorkflowError);
    assert.equal(e.code, "INCONSISTENT_STATE");
    assert.equal(e.severity, "ERROR");
  }
});

// §13 — broken workflow: missing engine in registry (CRITICAL).
test("raises CRITICAL when a pipeline engine is unregistered", () => {
  const incomplete = { ...registryWith() } as Record<EngineName, Engine>;
  delete (incomplete as Record<string, unknown>)["evidence"];
  const wf = new WorkflowOrchestrator(Object.freeze(incomplete) as EngineRegistry);
  try {
    wf.execute(ev(), "stable");
    assert.fail("expected broken workflow");
  } catch (e) {
    assert.ok(e instanceof WorkflowError);
    assert.equal(e.code, "BROKEN_WORKFLOW");
    assert.equal(e.severity, "CRITICAL");
  }
});

// §13 — missing engine output (ERROR).
test("raises ERROR when an engine produces no output", () => {
  const silent: Engine = {
    name: "validation",
    execute: () => ({ engine: "validation", produced: false, data: null }),
  };
  const wf = new WorkflowOrchestrator(registryWith({ validation: silent }));
  try {
    wf.execute(ev(), "stable");
    assert.fail("expected missing output error");
  } catch (e) {
    assert.ok(e instanceof WorkflowError);
    assert.equal(e.code, "MISSING_ENGINE_OUTPUT");
    assert.equal(e.severity, "ERROR");
  }
});

// §4 / §15 — orchestration only: engine outputs are passed through unmodified.
test("does not modify engine outputs (orchestration only)", () => {
  const marker = { engine: "calculation" as const, produced: true, data: { tag: "ORIGINAL" } };
  const fixed: Engine = { name: "calculation", execute: () => marker };
  const wf = new WorkflowOrchestrator(registryWith({ calculation: fixed }));
  const result = wf.execute(ev(), "stable");
  assert.equal(result.engineOutputs.calculation, marker); // same reference, untouched
});
