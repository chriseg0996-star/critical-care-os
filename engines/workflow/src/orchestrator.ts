/**
 * SPEC-007 Workflow Engine — Workflow Orchestrator (§10, top-level component).
 *
 * Orchestration ONLY: it never computes, validates, generates, or interprets (§4, invariants
 * 1,2,5). It is stateless across executions (§14, invariant 4) — it holds only the immutable
 * engine registry; every execute() is a pure function of (event, currentState).
 */
import type { ClinicalEvent, ICUState, WorkflowResult } from "./types.ts";
import type { EngineRegistry } from "./engine.ts";
import {
  TraceLogger,
  EventDispatcher,
  ExecutionPlanner,
  StateManager,
  EngineSequencer,
} from "./components.ts";

export class WorkflowOrchestrator {
  readonly #registry: EngineRegistry;
  readonly #dispatcher = new EventDispatcher();
  readonly #planner = new ExecutionPlanner();
  readonly #state = new StateManager();
  readonly #sequencer = new EngineSequencer();

  constructor(registry: EngineRegistry) {
    this.#registry = registry;
  }

  /**
   * Run one event through the deterministic pipeline:
   *   Event -> Context -> Validation -> Calculation -> Evidence -> Template -> Documentation
   * (SPEC-007 §6 / FR-001). Returns the §9 output model. Stateless: caller owns ICU state.
   */
  execute(event: ClinicalEvent, currentState: ICUState): WorkflowResult {
    const trace = new TraceLogger();

    const initialInput = this.#dispatcher.dispatch(event, trace);
    const plan = this.#planner.plan(this.#registry, trace);
    const { outputs, finalArtifact } = this.#sequencer.run(plan, initialInput, trace);
    const nextState = this.#state.transition(currentState, event.requestedState, trace);

    return Object.freeze({
      trace: trace.snapshot(),
      stateTransition: Object.freeze({ from: currentState, to: nextState }),
      engineOutputs: Object.freeze(outputs),
      finalArtifact,
    });
  }
}
