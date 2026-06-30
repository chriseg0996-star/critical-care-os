/**
 * SPEC-008 Reasoning Engine — internal components.
 * Trace: SPEC-008 §8. Each class is one named §8 component.
 *
 * All components are deterministic (FR-007, invariant 3): no clock, no randomness. They consume
 * inputs and never modify them (§4, invariant 6). They synthesize structural signals only — no
 * clinical knowledge is hardcoded (Constitution Art. II; SPEC-008 §4).
 */
import {
  REASONING_SOURCES,
  type SourceName,
  type ReasoningInput,
  type SourceArtifact,
  type ProblemAssertion,
  type Claim,
  type CandidateRecommendation,
  type PrioritizedProblem,
  type Contradiction,
  type BoundedRecommendation,
  type UncertaintyFlag,
  type Severity,
  type ReasoningTraceEntry,
  type ReasoningTrace,
} from "./types.ts";
import { invalidSchema } from "./errors.ts";

const sourceIndex = (s: SourceName): number => REASONING_SOURCES.indexOf(s);

/** §8 Trace Builder — append-only, immutable reasoning log (FR-006). No wall-clock (FR-007). */
export class TraceBuilder {
  #entries: ReasoningTraceEntry[] = [];
  #step = 0;
  record(component: string, severity: Severity, message: string): void {
    this.#entries.push(Object.freeze({ step: this.#step++, component, severity, message }));
  }
  snapshot(): ReasoningTrace {
    return Object.freeze(this.#entries.slice());
  }
}

export interface UnifiedModel {
  readonly problems: readonly ProblemAssertion[];
  readonly claims: readonly Claim[];
  readonly candidates: readonly CandidateRecommendation[];
  readonly lowConfidence: readonly { source: SourceName; ref: string }[];
  readonly contributingSources: readonly SourceName[];
}

/** §8 Synthesis Engine — combine all upstream outputs into one model (FR-001). */
export class SynthesisEngine {
  synthesize(input: ReasoningInput, trace: TraceBuilder): UnifiedModel {
    const problems: ProblemAssertion[] = [];
    const claims: Claim[] = [];
    const candidates: CandidateRecommendation[] = [];
    const lowConfidence: { source: SourceName; ref: string }[] = [];
    const contributing: SourceName[] = [];

    for (const source of REASONING_SOURCES) {
      const art = input[source] as SourceArtifact;
      let contributed = false;

      if (art.problems !== undefined) {
        if (!Array.isArray(art.problems)) throw invalidSchema(`${source}.problems must be an array`);
        for (const p of art.problems) {
          if (typeof p.id !== "string" || typeof p.label !== "string") {
            throw invalidSchema(`${source}.problems[] needs string id and label`);
          }
          problems.push({ ...p, source });
          contributed = true;
        }
      }
      if (art.claims !== undefined) {
        if (!Array.isArray(art.claims)) throw invalidSchema(`${source}.claims must be an array`);
        for (const c of art.claims) {
          if (typeof c.key !== "string" || typeof c.value !== "string") {
            throw invalidSchema(`${source}.claims[] needs string key and value`);
          }
          claims.push({ ...c, source });
          contributed = true;
        }
      }
      if (art.recommendations !== undefined) {
        if (!Array.isArray(art.recommendations)) {
          throw invalidSchema(`${source}.recommendations must be an array`);
        }
        for (const r of art.recommendations) candidates.push(r);
        contributed = contributed || art.recommendations.length > 0;
      }
      if (art.lowConfidence !== undefined) {
        if (!Array.isArray(art.lowConfidence)) {
          throw invalidSchema(`${source}.lowConfidence must be an array`);
        }
        for (const ref of art.lowConfidence) lowConfidence.push({ source, ref });
      }
      if (contributed) contributing.push(source);
    }

    trace.record(
      "SynthesisEngine",
      "INFO",
      `synthesized ${problems.length} problems, ${claims.length} claims, ${candidates.length} candidates`,
    );
    return Object.freeze({
      problems: Object.freeze(problems),
      claims: Object.freeze(claims),
      candidates: Object.freeze(candidates),
      lowConfidence: Object.freeze(lowConfidence),
      contributingSources: Object.freeze(contributing),
    });
  }
}

/** §8 Prioritization Engine — rank by severity desc, urgency desc, id asc (FR-002). Total order. */
export class PrioritizationEngine {
  prioritize(problems: readonly ProblemAssertion[], trace: TraceBuilder): readonly PrioritizedProblem[] {
    const ranked = [...problems]
      .sort((a, b) => {
        const sa = a.severity ?? -Infinity;
        const sb = b.severity ?? -Infinity;
        if (sa !== sb) return sb - sa;
        const ua = a.urgency ?? -Infinity;
        const ub = b.urgency ?? -Infinity;
        if (ua !== ub) return ub - ua;
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      })
      .map((p, i) => Object.freeze({ ...p, rank: i + 1 }));
    trace.record("PrioritizationEngine", "INFO", `prioritized ${ranked.length} problems`);
    return Object.freeze(ranked);
  }
}

/** §8 Conflict Resolver — structural contradiction detection + flag (FR-004, §11 RESOLVE FLAG). */
export class ConflictResolver {
  detect(claims: readonly Claim[], trace: TraceBuilder): readonly Contradiction[] {
    const byKey = new Map<string, { source: SourceName; value: string }[]>();
    for (const c of claims) {
      const list = byKey.get(c.key) ?? [];
      list.push({ source: c.source, value: c.value });
      byKey.set(c.key, list);
    }
    const contradictions: Contradiction[] = [];
    for (const key of [...byKey.keys()].sort()) {
      const entries = byKey.get(key)!;
      const distinct = new Set(entries.map((e) => e.value));
      if (distinct.size >= 2) {
        const values = [...entries].sort(
          (a, b) => sourceIndex(a.source) - sourceIndex(b.source) || (a.value < b.value ? -1 : 1),
        );
        contradictions.push(Object.freeze({ key, values: Object.freeze(values) }));
        trace.record("ConflictResolver", "WARNING", `contradiction on "${key}" — flagged for clinician`);
      }
    }
    return Object.freeze(contradictions);
  }
}

/** §8 Recommendation Generator — bind provided candidates to ranked problems; bounded (FR-003). */
export class RecommendationGenerator {
  generate(
    prioritized: readonly PrioritizedProblem[],
    candidates: readonly CandidateRecommendation[],
    trace: TraceBuilder,
  ): readonly BoundedRecommendation[] {
    const rankOf = new Map(prioritized.map((p) => [p.id, p.rank]));
    const out = candidates
      .map((c) => ({
        bounded: true as const,
        autonomous: false as const,
        id: c.id,
        text: c.text,
        problemId: c.problemId && rankOf.has(c.problemId) ? c.problemId : null,
        evidenceRef: c.evidenceRef ?? null,
      }))
      .sort((a, b) => {
        const ra = a.problemId ? rankOf.get(a.problemId)! : Infinity;
        const rb = b.problemId ? rankOf.get(b.problemId)! : Infinity;
        if (ra !== rb) return ra - rb;
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
      })
      .map((r) => Object.freeze(r));
    trace.record("RecommendationGenerator", "INFO", `bounded ${out.length} recommendations`);
    return Object.freeze(out);
  }
}

/** §8 Uncertainty Modeler — low confidence / partial data / conflicting evidence (FR-005). */
export class UncertaintyModeler {
  model(
    prioritized: readonly PrioritizedProblem[],
    contradictions: readonly Contradiction[],
    lowConfidence: readonly { source: SourceName; ref: string }[],
    trace: TraceBuilder,
  ): readonly UncertaintyFlag[] {
    const flags: UncertaintyFlag[] = [];
    for (const p of prioritized) {
      if (p.severity === undefined || p.urgency === undefined) {
        flags.push(Object.freeze({ type: "partial_data", ref: p.id }));
      }
    }
    for (const c of contradictions) {
      flags.push(Object.freeze({ type: "conflicting_evidence", ref: c.key }));
    }
    for (const lc of lowConfidence) {
      flags.push(Object.freeze({ type: "low_confidence", ref: `${lc.source}:${lc.ref}` }));
    }
    trace.record("UncertaintyModeler", "INFO", `emitted ${flags.length} uncertainty flags`);
    return Object.freeze(flags);
  }
}
