/**
 * SPEC-008 Reasoning Engine — top-level synthesis orchestration.
 *
 * Bounded and non-autonomous (invariant 1,2): produces structured reasoning only; takes no
 * action, mutates no input, overrides nothing (invariant 6,8). Stateless across calls
 * (invariant 4) and deterministic (FR-007): every reason() is a pure function of its input.
 * Processing order follows SPEC-008 §6.
 */
import {
  REASONING_SOURCES,
  type ReasoningInput,
  type ReasoningOutput,
  type Interpretation,
} from "./types.ts";
import { missingUpstreamData, incompleteReasoningChain } from "./errors.ts";
import {
  TraceBuilder,
  SynthesisEngine,
  PrioritizationEngine,
  ConflictResolver,
  RecommendationGenerator,
  UncertaintyModeler,
} from "./components.ts";

export class ReasoningEngine {
  readonly #synthesis = new SynthesisEngine();
  readonly #prioritization = new PrioritizationEngine();
  readonly #conflict = new ConflictResolver();
  readonly #recommendation = new RecommendationGenerator();
  readonly #uncertainty = new UncertaintyModeler();

  /** Synthesize the five §6 inputs into the §7 ReasoningOutput. Pure; no side effects. */
  reason(input: ReasoningInput): ReasoningOutput {
    for (const source of REASONING_SOURCES) {
      if (input[source] === undefined || input[source] === null) {
        throw missingUpstreamData(source);
      }
    }

    const trace = new TraceBuilder();
    let unified, prioritized, contradictions, recommendations, uncertainty;
    try {
      unified = this.#synthesis.synthesize(input, trace);
      prioritized = this.#prioritization.prioritize(unified.problems, trace);
      contradictions = this.#conflict.detect(unified.claims, trace);
      recommendations = this.#recommendation.generate(prioritized, unified.candidates, trace);
      uncertainty = this.#uncertainty.model(prioritized, contradictions, unified.lowConfidence, trace);
    } catch (cause) {
      if ((cause as { code?: string }).code === "INVALID_SCHEMA") throw cause; // CRITICAL passes through
      throw incompleteReasoningChain((cause as Error).message);
    }

    const interpretation: Interpretation = Object.freeze({
      prioritizedProblemIds: Object.freeze(prioritized.map((p) => p.id)),
      contributingSources: unified.contributingSources,
      unresolvedContradictions: contradictions.length,
    });

    return Object.freeze({
      prioritized_problems: prioritized,
      clinical_interpretation: interpretation,
      recommendations,
      contradictions,
      uncertainty_flags: uncertainty,
      reasoning_trace: trace.snapshot(),
    });
  }
}
