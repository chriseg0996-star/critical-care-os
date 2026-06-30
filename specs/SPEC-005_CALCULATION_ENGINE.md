# SPEC-005 — Calculation Engine

**Version:** 1.0.0  
**Status:** Canonical  
**Layer:** Core Engine  
**Owner:** Core Platform  
**Classification:** Computational Engine  

---

# 1. Purpose

The Calculation Engine is responsible for all deterministic numerical computation within Critical Care OS.

It provides a unified system for clinical and physiological calculations, ensuring reproducibility, traceability, and consistency across all domains.

It does NOT interpret clinical meaning.
It does NOT validate outputs.
It does NOT format outputs.
It does NOT manage context.

It only performs **deterministic computation over structured inputs**.

---

# 2. Scope

The Calculation Engine applies to:

- ventilatory mechanics calculations
- hemodynamic computations
- renal indices
- ICU scoring systems
- pharmacologic dosing calculations
- gas exchange metrics
- derived physiological parameters

---

# 3. Responsibilities

The Calculation Engine SHALL:

- perform deterministic mathematical computations
- ensure reproducibility of all calculations
- validate input numeric completeness (structural only)
- standardize formula execution
- support versioned formula definitions
- expose calculation interfaces
- ensure unit consistency
- support clinical scoring systems
- return structured numeric outputs
- maintain calculation traceability

---

# 4. Non-Responsibilities

The Calculation Engine SHALL NOT:

- interpret clinical meaning
- generate treatment decisions
- validate clinical correctness
- format outputs (Template Engine responsibility)
- resolve context (Context Engine responsibility)
- evaluate consistency (Validation Engine responsibility)
- store persistent state
- modify inputs
- perform workflow orchestration

---

# 5. Functional Requirements

## FR-001 Deterministic Computation
Same input → same output (always).

---

## FR-002 Formula Registry Execution
Execute versioned formulas from a registry.

---

## FR-003 Unit Consistency Enforcement
Ensure inputs conform to expected unit systems.

---

## FR-004 ICU Scoring Systems Support
Support standardized scoring models:

- SOFA
- APACHE II
- Glasgow Coma Scale
- CHA₂DS₂-VASc
- others (extensible registry-based)

---

## FR-005 Hemodynamic Calculations
Support:

- cardiac output
- systemic vascular resistance
- oxygen delivery (DO2)
- oxygen consumption (VO2)

---

## FR-006 Respiratory Mechanics
Support:

- compliance
- driving pressure
- plateau pressure relations
- lung mechanics indices

---

## FR-007 Pharmacologic Calculations
Support:

- weight-based dosing
- infusion rate conversions
- renal adjustment formulas

---

## FR-008 Gas Exchange Calculations
Support:

- PaO2/FiO2 ratio
- alveolar-arterial gradient
- shunt estimation (optional models)

---

## FR-009 Traceability
Every output must include:

- formula version
- input values
- unit system
- computation hash

---

# 6. Non-Functional Requirements

- fully deterministic execution
- stateless computation
- high-performance numeric processing
- versioned formula registry
- reproducible across time and systems
- unit-safe computation model

---

# 7. Input Model

All inputs must be structured:

```text id="input001"
CalculationRequest
├── parameters
├── unit system
├── formula version (optional)
└── metadata

```

---

# 8. Output Model

```text id="output001"
CalculationResult
├── value
├── unit
├── formula used
├── input snapshot
├── computation hash
└── timestamp
```

---

# 9. Internal Components

- Formula Registry
- Unit Conversion Engine
- Computation Core
- Scoring Engine
- Traceability Logger
- Numeric Validator

---

# 10. Dependencies

Depends on:

- SPEC-000 Constitution
- Context Engine (SPEC-002)
- Validation Engine (SPEC-003)

Does NOT depend on:

- Template Engine
- Documentation Engine
- Clinical interpretation systems

---

# 11. Consumers

- Validation Engine (verification only)
- Documentation Engine (output rendering)
- Clinical Modules (decision support layer)
- Template Engine (presentation layer)

---

# 12. Error Handling

- Missing parameter → ERROR
- Invalid unit → CRITICAL
- Undefined formula → CRITICAL
- NaN/Infinity → CRITICAL
- Version mismatch → WARNING/ERROR

---

# 13. Performance Requirements

- O(1) or O(log n) formula execution where possible
- cached formula registry access
- stateless execution model
- parallel-safe computation

---

# 14. Security Considerations

- no dynamic code execution from inputs
- strict formula registry control
- no external dependency injection
- audit logging for all computations

---

# 15. Future Extensions

- probabilistic models
- AI-assisted parameter estimation (non-authoritative)
- multi-patient batch computation
- real-time ICU monitoring integration

---

# 16. Acceptance Criteria

The Calculation Engine is valid if it:

- produces deterministic numeric outputs
- supports versioned formulas
- enforces unit consistency
- provides full traceability
- operates without clinical interpretation
- remains stateless and reproducible

---

# 17. Out of Scope

- clinical decision-making
- validation logic
- template rendering
- context resolution
- workflow execution
- evidence interpretation

---

# 18. Architectural Invariants

1. Calculation is deterministic
2. Calculation is stateless
3. Calculation is versioned
4. Calculation is isolated from clinical reasoning
5. Calculation never interprets meaning
6. Calculation is unit-safe
7. Calculation is reproducible across time
8. Calculation exposes full traceability
