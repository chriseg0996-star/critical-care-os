/**
 * SPEC-007 Workflow Engine — error model.
 * Trace: SPEC-007 §13 (Error Handling). Severities per §13 / SPEC-003 §8.
 */
import type { Severity, EngineName } from "./types.ts";

export class WorkflowError extends Error {
  readonly severity: Severity;
  readonly code: string;
  constructor(code: string, severity: Severity, message: string) {
    super(message);
    this.name = "WorkflowError";
    this.code = code;
    this.severity = severity;
  }
}

/** invalid sequence → CRITICAL (§13). */
export const invalidSequence = (detail: string): WorkflowError =>
  new WorkflowError("INVALID_SEQUENCE", "CRITICAL", `Invalid execution sequence: ${detail}`);

/** missing engine output → ERROR (§13). */
export const missingEngineOutput = (engine: EngineName): WorkflowError =>
  new WorkflowError("MISSING_ENGINE_OUTPUT", "ERROR", `Engine "${engine}" produced no output`);

/** inconsistent state → WARNING/ERROR (§13). Modeled as ERROR (rejected illegal transition). */
export const inconsistentState = (from: string, to: string): WorkflowError =>
  new WorkflowError(
    "INCONSISTENT_STATE",
    "ERROR",
    `Illegal state transition ${from} -> ${to} (not defined by SPEC-007 §7)`,
  );

/** broken workflow → CRITICAL (§13). */
export const brokenWorkflow = (detail: string): WorkflowError =>
  new WorkflowError("BROKEN_WORKFLOW", "CRITICAL", `Broken workflow: ${detail}`);
