/**
 * SPEC-008 Reasoning Engine — error model.
 * Trace: SPEC-008 §11. Severities per §11 / SPEC-003 §8.
 * (Self-contained: no cross-engine import, to keep engine modules independent.)
 */
import type { Severity } from "./types.ts";

export class ReasoningError extends Error {
  readonly severity: Severity;
  readonly code: string;
  constructor(code: string, severity: Severity, message: string) {
    super(message);
    this.name = "ReasoningError";
    this.code = code;
    this.severity = severity;
  }
}

/** missing upstream data → ERROR (§11). */
export const missingUpstreamData = (source: string): ReasoningError =>
  new ReasoningError("MISSING_UPSTREAM_DATA", "ERROR", `Missing upstream input: ${source}`);

/** invalid schema → CRITICAL (§11). */
export const invalidSchema = (detail: string): ReasoningError =>
  new ReasoningError("INVALID_SCHEMA", "CRITICAL", `Invalid input schema: ${detail}`);

/** incomplete reasoning chain → ERROR (§11). */
export const incompleteReasoningChain = (detail: string): ReasoningError =>
  new ReasoningError("INCOMPLETE_REASONING_CHAIN", "ERROR", `Incomplete reasoning chain: ${detail}`);
