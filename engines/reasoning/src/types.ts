/**
 * SPEC-008 Reasoning Engine — shared types.
 *
 * Implements only what SPEC-008 explicitly defines. The engine synthesizes structured inputs;
 * it never invents clinical data (SPEC-000 §3 Art. IX; SPEC-008 §4 "replace clinical judgment").
 * Trace: SPEC-008 §6 (model), §7 (output), §9 (deps), §17 (invariants).
 *
 * Sources follow §6/§9 (Context, Validation, Calculation, Evidence, Workflow). Template is
 * intentionally excluded: it is absent from §6 inputs and §9 dependencies (the §1 prose mention
 * is the flagged intra-spec inconsistency).
 */

export const REASONING_SOURCES = [
  "context",
  "validation",
  "calculation",
  "evidence",
  "workflow",
] as const;

export type SourceName = (typeof REASONING_SOURCES)[number];

/** Severity vocabulary — SPEC-008 §11 (aligned with SPEC-003 §8). */
export type Severity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

/** An active clinical problem present in upstream data. The engine ranks it; never creates it. */
export interface ProblemAssertion {
  readonly id: string;
  readonly label: string;
  readonly severity?: number;
  readonly urgency?: number;
  readonly source: SourceName;
}

/** A keyed assertion from a source — used only for structural contradiction detection (FR-004). */
export interface Claim {
  readonly key: string;
  readonly value: string;
  readonly source: SourceName;
}

/** A bounded recommendation candidate carried in upstream (e.g., evidence) data. */
export interface CandidateRecommendation {
  readonly id: string;
  readonly text: string;
  readonly problemId?: string;
  readonly evidenceRef?: string;
}

/** One upstream engine's structured artifact (engine-agnostic — invariant 7). */
export interface SourceArtifact {
  readonly problems?: readonly ProblemAssertion[];
  readonly claims?: readonly Claim[];
  readonly recommendations?: readonly CandidateRecommendation[];
  readonly lowConfidence?: readonly string[];
  readonly state?: string;
}

/** Reasoning inputs — SPEC-008 §6. All five sections are required. */
export interface ReasoningInput {
  readonly context: SourceArtifact;
  readonly validation: SourceArtifact;
  readonly calculation: SourceArtifact;
  readonly evidence: SourceArtifact;
  readonly workflow: SourceArtifact;
}

export interface PrioritizedProblem extends ProblemAssertion {
  readonly rank: number;
}

export interface Contradiction {
  readonly key: string;
  readonly values: readonly { readonly source: SourceName; readonly value: string }[];
}

/** Bounded, non-autonomous recommendation — SPEC-008 §1, invariant 2. */
export interface BoundedRecommendation {
  readonly id: string;
  readonly text: string;
  readonly problemId: string | null;
  readonly evidenceRef: string | null;
  readonly bounded: true;
  readonly autonomous: false;
}

export type UncertaintyKind = "low_confidence" | "partial_data" | "conflicting_evidence";

export interface UncertaintyFlag {
  readonly type: UncertaintyKind;
  readonly ref: string;
}

export interface ReasoningTraceEntry {
  readonly step: number;
  readonly component: string;
  readonly severity: Severity;
  readonly message: string;
}

export type ReasoningTrace = readonly ReasoningTraceEntry[];

/** Structured interpretation — assembled from inputs, no invented narrative (no fabrication). */
export interface Interpretation {
  readonly prioritizedProblemIds: readonly string[];
  readonly contributingSources: readonly SourceName[];
  readonly unresolvedContradictions: number;
}

/** ReasoningOutput — SPEC-008 §7. Field names match the spec exactly. */
export interface ReasoningOutput {
  readonly prioritized_problems: readonly PrioritizedProblem[];
  readonly clinical_interpretation: Interpretation;
  readonly recommendations: readonly BoundedRecommendation[];
  readonly contradictions: readonly Contradiction[];
  readonly uncertainty_flags: readonly UncertaintyFlag[];
  readonly reasoning_trace: ReasoningTrace;
}
