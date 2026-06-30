# SPEC-004 — Template Engine

**Version:** 1.0.0  
**Status:** Canonical  
**Layer:** Core Engine  
**Owner:** Core Platform  
**Classification:** Infrastructure Engine  

---

# 1. Purpose

The Template Engine is responsible for generating **structured, deterministic document formats** across Critical Care OS.

It defines how clinical and system outputs are formatted, organized, and rendered into consistent structures.

It does NOT contain clinical knowledge.
It does NOT perform reasoning.
It does NOT execute workflows.
It does NOT validate outputs.

It only defines **presentation structure of structured outputs**.

---

# 2. Scope

The Template Engine governs:

- document structure definitions
- output formatting schemas
- reusable clinical templates
- standardized report layouts
- structured UI-independent representations
- section ordering rules
- mandatory vs optional content blocks

---

# 3. Responsibilities

The Template Engine SHALL:

- define deterministic output templates
- enforce structural consistency across documents
- provide reusable formatting schemas
- standardize ICU documentation formats
- separate content from presentation
- define section hierarchies
- support versioned templates
- ensure template reusability across modules
- maintain template registry
- expose template interfaces

---

# 4. Non-Responsibilities

The Template Engine SHALL NOT:

- interpret clinical data
- generate medical decisions
- validate outputs
- compute calculations
- resolve context
- manage workflows
- store evidence
- define clinical rules
- perform reasoning
- modify content semantics

---

# 5. Functional Requirements

## FR-001 Template Definition

Define reusable structured templates for all document types.

---

## FR-002 Template Rendering Schema

Convert structured data into deterministic layouts.

---

## FR-003 Section Standardization

Ensure consistent section ordering across outputs.

---

## FR-004 Template Versioning

All templates must be versioned.

---

## FR-005 Template Registry

Maintain registry of all active templates.

---

## FR-006 Content-Structure Separation

Ensure strict separation between:

- data (input)
- structure (template)

---

## FR-007 ICU Template Support

Provide standard ICU document templates:

- admission note
- daily progress note
- interconsultation note
- discharge summary

---

## FR-008 Cross-Engine Compatibility

Templates must be consumable by:

- Documentation Engine
- Context Engine (read-only)
- Validation Engine (structural checks only)

---

# 6. Non-Functional Requirements

- deterministic rendering
- stateless operation
- version-controlled outputs
- high reusability
- engine-agnostic design
- schema-driven structure
- strict separation of concerns

---

# 7. Template Model

```text id="model004"
Template
│
├── Metadata
├── Structure Definition
├── Sections
├── Required Fields
├── Optional Fields
├── Ordering Rules
└── Version
```

---

# 8. Template Categories

## Clinical Templates

- ICU admission
- daily evolution
- procedures
- interconsultations

---

## System Templates

- validation report
- context snapshot
- calculation output

---

## Documentation Templates

- SPEC documents
- ADR documents
- release notes

---

# 9. Template Resolution Rules

1. Templates are deterministic
2. Templates do not infer missing data
3. Templates do not modify content meaning
4. Templates enforce structure only
5. Templates must be version-bound
6. Templates cannot override validation logic

---

# 10. Internal Components

- Template Registry
- Structure Parser
- Layout Engine
- Section Manager
- Version Controller
- Rendering Interface

---

# 11. Dependencies

The Template Engine depends on:

- SPEC-000 Constitution
- Context Engine (SPEC-002)
- Validation Engine (SPEC-003)

It does NOT depend on:

- clinical reasoning
- evidence engine
- workflow engine
- calculation engine

---

# 12. Consumers

- Documentation Engine (primary consumer)
- Validation Engine (structure validation only)
- Clinical modules (rendering outputs)
- Release system (documentation generation)

---

# 13. Error Handling

- Missing section → WARNING or ERROR (configurable)
- Invalid template → CRITICAL failure
- Version mismatch → ERROR
- Schema mismatch → CRITICAL
- Incomplete structure → ERROR

---

# 14. Performance Requirements

- O(n) rendering complexity
- reusable template caching
- stateless execution
- fast deterministic formatting
- parallel-safe rendering

---

# 15. Security Considerations

- no execution of embedded logic
- no dynamic code evaluation
- no external dependency injection
- strict schema validation before rendering
- isolation between templates

---

# 16. Future Extensions

- multi-language templates
- adaptive ICU formatting
- AI-assisted formatting suggestions (non-authoritative)
- UI rendering layer separation
- hospital-specific template profiles

---

# 17. Acceptance Criteria

The Template Engine is valid if it:

- produces deterministic structured outputs
- separates content from structure
- supports versioned templates
- integrates with Documentation Engine
- does NOT perform validation or reasoning
- remains engine-agnostic
- scales across all ICU document types

---

# 18. Out of Scope

- clinical reasoning
- validation logic
- calculations
- context resolution
- workflow execution
- evidence management
- decision-making
- data persistence

---

# 19. Architectural Invariants

1. Templates define structure, not meaning  
2. Templates are deterministic  
3. Templates are versioned  
4. Templates are stateless  
5. Templates do not validate data  
6. Templates do not interpret context  
7. Templates are engine-agnostic  
8. Templates are reusable across all domains  
9. Templates enforce presentation consistency only  
10. Templates must never encode clinical logic
