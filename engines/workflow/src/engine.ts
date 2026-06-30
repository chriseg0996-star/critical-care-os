/**
 * SPEC-007 Workflow Engine — engine service contract.
 *
 * Engines are treated as STATELESS SERVICES (per instruction + SPEC-007 §1, invariant 5).
 * The Workflow Engine orchestrates engines through this interface ONLY and never implements
 * their internals (SPEC-007 §4: no compute / validate / generate / interpret).
 */
import type { EngineName, EngineInput, EngineOutput } from "./types.ts";

/** Stateless engine service. A real Context/Validation/... engine implements this same shape. */
export interface Engine {
  readonly name: EngineName;
  execute(input: EngineInput): EngineOutput;
}

export type EngineRegistry = Readonly<Record<EngineName, Engine>>;

/**
 * Inert pass-through engine adapter — a TEST DOUBLE, not an engine implementation.
 *
 * It carries zero Context/Validation/Calculation/Evidence/Template/Documentation logic; it only
 * satisfies the service interface so the orchestration is runnable and provably deterministic.
 * Real engines (their own SPECs) plug into the same registry slot.
 */
export function createPassThroughEngine(name: EngineName): Engine {
  return {
    name,
    execute(input: EngineInput): EngineOutput {
      return Object.freeze({
        engine: name,
        produced: true,
        data: Object.freeze({
          eventId: input.event.id,
          consumedPriorOutputs: Object.keys(input.priorOutputs),
        }),
      });
    },
  };
}
