/**
 * SPEC-008 Reasoning Engine — compliance tests.
 * Each test cites the SPEC-008 clause it verifies. Run: `npm test` (tsx + node:test).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createDefaultReasoningEngine,
  ReasoningError,
  type ReasoningInput,
  type SourceArtifact,
} from "../src/index.ts";

const empty: SourceArtifact = {};

function input(over: Partial<ReasoningInput> = {}): ReasoningInput {
  return {
    context: empty,
    validation: empty,
    calculation: empty,
    evidence: empty,
    workflow: empty,
    ...over,
  };
}

// FR-002 — problems ranked by severity desc, urgency desc, id asc.
test("prioritizes problems deterministically by severity, urgency, id (FR-002)", () => {
  const wf = createDefaultReasoningEngine();
  const out = wf.reason(
    input({
      context: {
        problems: [
          { id: "p2", label: "B", severity: 5, urgency: 1, source: "context" },
          { id: "p1", label: "A", severity: 9, urgency: 2, source: "context" },
          { id: "p3", label: "C", severity: 5, urgency: 3, source: "context" },
        ],
      },
    }),
  );
  assert.deepEqual(
    out.prioritized_problems.map((p) => p.id),
    ["p1", "p3", "p2"],
  );
  assert.deepEqual(out.prioritized_problems.map((p) => p.rank), [1, 2, 3]);
});

// FR-004 — contradiction detection across sources.
test("detects contradictions between sources (FR-004)", () => {
  const out = createDefaultReasoningEngine().reason(
    input({
      calculation: { claims: [{ key: "map", value: "65", source: "calculation" }] },
      validation: { claims: [{ key: "map", value: "70", source: "validation" }] },
      evidence: { claims: [{ key: "trend", value: "up", source: "evidence" }] },
    }),
  );
  assert.equal(out.contradictions.length, 1);
  assert.equal(out.contradictions[0].key, "map");
  assert.deepEqual(out.contradictions[0].values.map((v) => v.source), ["validation", "calculation"]);
  assert.ok(out.uncertainty_flags.some((f) => f.type === "conflicting_evidence" && f.ref === "map"));
});

// FR-005 — uncertainty: partial data when severity/urgency missing.
test("flags partial data and low confidence (FR-005)", () => {
  const out = createDefaultReasoningEngine().reason(
    input({
      context: { problems: [{ id: "p1", label: "A", severity: 5, source: "context" }] }, // no urgency
      evidence: { lowConfidence: ["e-finding"] },
    }),
  );
  assert.ok(out.uncertainty_flags.some((f) => f.type === "partial_data" && f.ref === "p1"));
  assert.ok(out.uncertainty_flags.some((f) => f.type === "low_confidence" && f.ref === "evidence:e-finding"));
});

// FR-003 / invariant 2 — recommendations are bounded, non-autonomous, bound to ranked problems.
test("generates bounded recommendations linked to problems (FR-003, invariant 2)", () => {
  const out = createDefaultReasoningEngine().reason(
    input({
      context: { problems: [{ id: "p1", label: "A", severity: 5, urgency: 5, source: "context" }] },
      evidence: {
        recommendations: [
          { id: "r1", text: "consider X", problemId: "p1", evidenceRef: "SSC2021" },
          { id: "r0", text: "orphan", problemId: "missing" },
        ],
      },
    }),
  );
  assert.equal(out.recommendations.length, 2);
  assert.equal(out.recommendations[0].id, "r1"); // bound problem ranks before orphan
  assert.equal(out.recommendations[0].problemId, "p1");
  assert.equal(out.recommendations[1].problemId, null); // unmatched -> null, still surfaced
  for (const r of out.recommendations) {
    assert.equal(r.bounded, true);
    assert.equal(r.autonomous, false);
  }
});

// FR-006 — immutable reasoning trace covering each component.
test("produces an immutable reasoning trace (FR-006)", () => {
  const out = createDefaultReasoningEngine().reason(
    input({ context: { problems: [{ id: "p1", label: "A", severity: 1, urgency: 1, source: "context" }] } }),
  );
  const components = new Set(out.reasoning_trace.map((t) => t.component));
  assert.ok(components.has("SynthesisEngine"));
  assert.ok(components.has("PrioritizationEngine"));
  assert.throws(() => {
    // @ts-expect-error verifying runtime immutability
    out.reasoning_trace.push({ step: 99, component: "x", severity: "INFO", message: "y" });
  });
});

// FR-007 — determinism: identical inputs -> identical output.
test("is deterministic: identical inputs produce identical output (FR-007)", () => {
  const i = input({
    context: { problems: [{ id: "p1", label: "A", severity: 3, urgency: 2, source: "context" }] },
    validation: { claims: [{ key: "k", value: "1", source: "validation" }] },
  });
  const a = createDefaultReasoningEngine().reason(i);
  const b = createDefaultReasoningEngine().reason(i);
  assert.deepEqual(a, b);
});

// §4 / invariant 6 — inputs are not modified.
test("does not modify inputs (invariant 6)", () => {
  const problems = [{ id: "p1", label: "A", severity: 1, urgency: 1, source: "context" as const }];
  const i = input({ context: { problems } });
  createDefaultReasoningEngine().reason(i);
  assert.equal(problems.length, 1);
  assert.equal(problems[0].id, "p1");
});

// §11 — missing upstream section -> ERROR.
test("raises ERROR on missing upstream data (§11)", () => {
  const broken = { context: empty, validation: empty, calculation: empty, evidence: empty } as unknown as ReasoningInput;
  try {
    createDefaultReasoningEngine().reason(broken);
    assert.fail("expected missing upstream error");
  } catch (e) {
    assert.ok(e instanceof ReasoningError);
    assert.equal(e.code, "MISSING_UPSTREAM_DATA");
    assert.equal(e.severity, "ERROR");
  }
});

// §11 — invalid schema -> CRITICAL.
test("raises CRITICAL on invalid input schema (§11)", () => {
  const bad = input({ context: { problems: "nope" as unknown as [] } });
  try {
    createDefaultReasoningEngine().reason(bad);
    assert.fail("expected invalid schema error");
  } catch (e) {
    assert.ok(e instanceof ReasoningError);
    assert.equal(e.code, "INVALID_SCHEMA");
    assert.equal(e.severity, "CRITICAL");
  }
});
