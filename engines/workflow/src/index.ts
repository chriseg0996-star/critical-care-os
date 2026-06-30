/**
 * SPEC-007 Workflow Engine — public entry point.
 * Trace: specs/SPEC-007_WORKFLOW_ENGINE.md.
 */
export * from "./types.ts";
export * from "./errors.ts";
export { type Engine, type EngineRegistry, createPassThroughEngine } from "./engine.ts";
export {
  TraceLogger,
  EventDispatcher,
  ExecutionPlanner,
  StateManager,
  EngineSequencer,
} from "./components.ts";
export { WorkflowOrchestrator } from "./orchestrator.ts";

import { PIPELINE_ORDER, type EngineName } from "./types.ts";
import { createPassThroughEngine, type EngineRegistry } from "./engine.ts";
import { WorkflowOrchestrator } from "./orchestrator.ts";

/**
 * Build a runnable Workflow Engine wired with inert pass-through engine adapters (test doubles).
 * Replace each slot with the real engine (same `Engine` interface) as its SPEC is implemented.
 */
export function createDefaultWorkflowEngine(): WorkflowOrchestrator {
  const registry = Object.fromEntries(
    PIPELINE_ORDER.map((name: EngineName) => [name, createPassThroughEngine(name)]),
  ) as EngineRegistry;
  return new WorkflowOrchestrator(registry);
}
