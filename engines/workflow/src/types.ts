/**
 * SPEC-007 Workflow Engine — shared types.
 *
 * Implements only what SPEC-007 explicitly defines. No inferred concepts.
 * Trace: SPEC-007 §1, §5(FR-001..006), §6, §7, §8, §9, §13, §19.
 */

/** Canonical engine pipeline order — SPEC-007 §6 / FR-001. Order is fixed and deterministic. */
export const PIPELINE_ORDER = [
  "context",
  "validation",
  "calculation",
  "evidence",
  "template",
  "documentation",
] as const;

export type EngineName = (typeof PIPELINE_ORDER)[number];

/** ICU states — SPEC-007 §7 / FR-002. */
export type ICUState = "stable" | "deteriorating" | "critical" | "recovering";

/** Event trigger types — SPEC-007 FR-003. */
export type EventType =
  | "vital_signs"
  | "lab_update"
  | "ventilator_change"
  | "vasopressor_change";

/** Severity classes — SPEC-007 §13 (aligned with SPEC-003 §8 vocabulary). */
export type Severity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

/**
 * A clinical event entering the workflow — SPEC-007 §8 (Input Model).
 *
 * `requestedState` is the explicit target ICU state carried by the event. The Workflow
 * Engine validates it against the §7 state machine but never *computes* it from clinical
 * data — that would be reasoning (forbidden by §4 / invariant 1,5). State decisions are an
 * input to orchestration, not a product of it.
 */
export interface ClinicalEvent {
  readonly id: string;
  readonly type: EventType;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly requestedState?: ICUState;
}

/** Input handed to each engine service — outputs of prior engines are threaded forward (FR-006). */
export interface EngineInput {
  readonly event: ClinicalEvent;
  readonly priorOutputs: Readonly<Partial<Record<EngineName, EngineOutput>>>;
}

/** Output produced by an engine service. The Workflow Engine never modifies it (§4, §15). */
export interface EngineOutput {
  readonly engine: EngineName;
  readonly produced: boolean;
  readonly data: unknown;
}

/** One immutable trace record — SPEC-007 §5 / FR-005, §15 (immutable traces). */
export interface TraceEntry {
  readonly step: number;
  readonly stage: EngineName | "workflow";
  readonly severity: Severity;
  readonly message: string;
}

export type ExecutionTrace = readonly TraceEntry[];

/** Final workflow result — SPEC-007 §9 (Output Model). */
export interface WorkflowResult {
  readonly trace: ExecutionTrace;
  readonly stateTransition: { readonly from: ICUState; readonly to: ICUState };
  readonly engineOutputs: Readonly<Record<EngineName, EngineOutput>>;
  readonly finalArtifact: EngineOutput;
}
