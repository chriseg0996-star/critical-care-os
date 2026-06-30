/**
 * SPEC-007 Workflow Engine — internal components.
 * Trace: SPEC-007 §10. Each class below is one named §10 component.
 *
 * Determinism (FR-004, invariant 3): no wall-clock and no randomness anywhere in the execution
 * path. Trace ordering uses a monotonic step counter only, so identical inputs reproduce
 * byte-identical traces (deterministic replay — §14).
 */
import {
  PIPELINE_ORDER,
  type EngineName,
  type EngineInput,
  type EngineOutput,
  type ICUState,
  type ClinicalEvent,
  type Severity,
  type TraceEntry,
  type ExecutionTrace,
} from "./types.ts";
import type { Engine, EngineRegistry } from "./engine.ts";
import {
  brokenWorkflow,
  inconsistentState,
  missingEngineOutput,
} from "./errors.ts";

/** §10 Trace Logger — append-only, immutable execution trace (§5/FR-005, §15). */
export class TraceLogger {
  #entries: TraceEntry[] = [];
  #step = 0;

  record(stage: TraceEntry["stage"], severity: Severity, message: string): void {
    this.#entries.push(Object.freeze({ step: this.#step++, stage, severity, message }));
  }

  /** Immutable snapshot — consumers cannot mutate the trace (§15). */
  snapshot(): ExecutionTrace {
    return Object.freeze(this.#entries.slice());
  }
}

/** §10 Event Dispatcher — normalizes an event into the initial pipeline input (FR-003, §8). */
export class EventDispatcher {
  dispatch(event: ClinicalEvent, trace: TraceLogger): EngineInput {
    trace.record("workflow", "INFO", `event dispatched: ${event.id} (${event.type})`);
    return Object.freeze({ event, priorOutputs: Object.freeze({}) });
  }
}

/** §10 Execution Planner — resolves the fixed deterministic engine order (§6/FR-001). */
export class ExecutionPlanner {
  /** Returns engines in canonical order; CRITICAL if any pipeline slot is unregistered (§13). */
  plan(registry: EngineRegistry, trace: TraceLogger): readonly Engine[] {
    const ordered: Engine[] = [];
    for (const name of PIPELINE_ORDER) {
      const engine = registry[name];
      if (!engine) throw brokenWorkflow(`missing engine in registry: ${name}`);
      ordered.push(engine);
    }
    trace.record("workflow", "INFO", `execution plan: ${PIPELINE_ORDER.join(" -> ")}`);
    return Object.freeze(ordered);
  }
}

/** §10 State Manager — enforces the §7 ICU state machine (FR-002). Pure; never infers state. */
export class StateManager {
  /** Defined successors — SPEC-007 §7: stable -> deteriorating -> critical -> recovering -> (loop) stable. */
  static readonly #successor: Readonly<Record<ICUState, ICUState>> = Object.freeze({
    stable: "deteriorating",
    deteriorating: "critical",
    critical: "recovering",
    recovering: "stable",
  });

  /**
   * Validate and apply a transition. `requested` is supplied by the event, not computed.
   * - no request            -> state unchanged.
   * - request === current   -> unchanged (no-op).
   * - request === successor -> advance along the §7 graph.
   * - anything else         -> illegal transition (ERROR, §13 inconsistent state).
   */
  transition(current: ICUState, requested: ICUState | undefined, trace: TraceLogger): ICUState {
    if (requested === undefined || requested === current) {
      trace.record("workflow", "INFO", `state unchanged: ${current}`);
      return current;
    }
    if (requested === StateManager.#successor[current]) {
      trace.record("workflow", "INFO", `state transition: ${current} -> ${requested}`);
      return requested;
    }
    throw inconsistentState(current, requested);
  }
}

/** §10 Engine Sequencer — runs engines in planned order, threading outputs forward (FR-006). */
export class EngineSequencer {
  run(
    plan: readonly Engine[],
    initialInput: EngineInput,
    trace: TraceLogger,
  ): { outputs: Record<EngineName, EngineOutput>; finalArtifact: EngineOutput } {
    const outputs: Partial<Record<EngineName, EngineOutput>> = {};
    let last: EngineOutput | undefined;

    for (const engine of plan) {
      const input: EngineInput = Object.freeze({
        event: initialInput.event,
        priorOutputs: Object.freeze({ ...outputs }),
      });

      let output: EngineOutput;
      try {
        output = engine.execute(input); // orchestration only — output is never modified (§4,§15)
      } catch (cause) {
        throw brokenWorkflow(`engine "${engine.name}" threw: ${(cause as Error).message}`);
      }

      if (!output || output.produced !== true) {
        throw missingEngineOutput(engine.name);
      }

      outputs[engine.name] = output;
      last = output;
      trace.record(engine.name, "INFO", `engine executed: ${engine.name}`);
    }

    if (!last) throw brokenWorkflow("empty execution plan");
    return { outputs: outputs as Record<EngineName, EngineOutput>, finalArtifact: last };
  }
}
