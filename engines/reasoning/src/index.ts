/**
 * SPEC-008 Reasoning Engine — public entry point.
 * Trace: specs/SPEC-008_REASONING_ENGINE.md.
 */
export * from "./types.ts";
export * from "./errors.ts";
export {
  TraceBuilder,
  SynthesisEngine,
  PrioritizationEngine,
  ConflictResolver,
  RecommendationGenerator,
  UncertaintyModeler,
  type UnifiedModel,
} from "./components.ts";
export { ReasoningEngine } from "./orchestrator.ts";

import { ReasoningEngine } from "./orchestrator.ts";

/** Construct a Reasoning Engine with the default content-neutral synthesis policy. */
export function createDefaultReasoningEngine(): ReasoningEngine {
  return new ReasoningEngine();
}
