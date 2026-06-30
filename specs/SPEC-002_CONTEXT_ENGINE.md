SPEC-002 — Context Engine
Version 1.0.0
Status: Canonical Specification
1. Purpose
Mission
The Context Engine is the canonical platform service responsible for constructing, normalizing, validating, maintaining, and exposing the complete execution context required by every engine within Critical Care OS.
It provides a unified, deterministic representation of the current execution environment.
The Context Engine exists to ensure that every engine operates on the same authoritative context, eliminating duplicated context acquisition, inconsistent execution state, and fragmented environmental information.
The Context Engine owns execution context.
It does not own knowledge, workflow, reasoning, memory, documentation, or calculations.
2. Scope
The Context Engine manages every piece of information describing the current execution environment that is required by downstream engines.
Its scope includes:

* execution context construction
* context normalization
* context aggregation
* context validation
* context versioning
* context prioritization
* context resolution
* immutable context publication
* context lifecycle management
* runtime metadata
The engine operates entirely within the execution layer.
It never becomes the canonical owner of domain knowledge.
3. Responsibilities
The Context Engine shall:

* Collect context from multiple providers.
* Normalize heterogeneous context into canonical structures.
* Resolve conflicting context.
* Apply deterministic precedence rules.
* Validate structural integrity.
* Maintain execution context versions.
* Publish immutable execution snapshots.
* Support incremental context updates.
* Track execution metadata.
* Expose stable context interfaces.
* Isolate concurrent execution contexts.
* Manage context lifecycle.
* Provide engine-independent context services.
4. Non-Responsibilities
The Context Engine shall never:

* perform clinical reasoning
* generate documentation
* render templates
* calculate physiological values
* execute workflows
* search evidence
* store permanent medical knowledge
* replace persistent storage
* own user memory
* manage authentication
* manage authorization
* coordinate engine execution
* make recommendations
5. Functional Requirements
FR-001 Context Creation
Create a new execution context for every execution session.
FR-002 Context Collection
Collect context from all registered context providers.
FR-003 Context Normalization
Transform provider-specific representations into canonical internal structures.
FR-004 Context Aggregation
Combine all available context into a single execution model.
FR-005 Context Resolution
Resolve duplicate or conflicting values.
FR-006 Context Prioritization
Apply deterministic precedence rules.
FR-007 Context Validation
Validate the complete context before publication.
FR-008 Incremental Updates
Support partial updates without reconstructing the entire context.
FR-009 Immutable Snapshots
Publish immutable snapshots.
No consumer may modify published context.
FR-010 Version Tracking
Assign a version identifier to every published context.
FR-011 Context Lifecycle
Create
↓
Update
↓
Snapshot
↓
Archive
↓
Dispose
FR-012 Context Isolation
Support simultaneous independent execution contexts.
FR-013 Context Discovery
Expose available context sections through stable interfaces.
FR-014 Context Metadata
Track:

* timestamps
* version
* origin
* provider
* priority
* validation state
6. Non-Functional Requirements
The engine shall be:

* deterministic
* stateless across executions
* implementation independent
* engine independent
* extensible
* observable
* immutable after publication
* modular
* thread-safe
* scalable
* low latency
* fully testable
* version aware
7. Context Sources
The Context Engine does not generate context.
It consumes context supplied by registered providers.
Canonical provider categories include:
User Context

* preferences
* locale
* permissions
* documentation preferences
Session Context

* execution identifier
* timestamps
* runtime metadata
* interaction metadata
Patient Context

* demographics
* diagnoses
* physiological state
* laboratory summaries
* imaging summaries
Encounter Context

* admission
* ICU day
* active problems
* procedures
* devices
Documentation Context

* active document
* document state
* documentation metadata
Workflow Context
Only the current workflow state.
Workflow ownership remains external.
Engine Context
Engine configuration.
Active engine metadata.
Configuration Context
Global configuration.
Feature configuration.
Platform configuration.
Runtime Context
Temporary execution variables.
Derived execution state.
8. Context Model
The canonical Context Object contains:

```text
Context
│
├── Metadata
├── User
├── Session
├── Patient
├── Encounter
├── Documentation
├── Workflow
├── Engine
├── Configuration
├── Runtime
└── Extensions

```

Every section has:

* schema
* version
* owner
* validation status
* timestamp
9. Context Types
The engine shall support multiple context categories.
Static Context
Changes rarely.
Example:

* locale
* preferences
Dynamic Context
Changes during execution.
Example:

* patient state
* workflow state
Derived Context
Generated from other context.
Never becomes canonical ownership.
Runtime Context
Temporary execution values.
Configuration Context
Platform configuration.
Extension Context
Plugin-defined context.
10. Context Resolution
When multiple providers define the same field, deterministic resolution is mandatory.
Resolution consists of:

1. identity verification
2. ownership verification
3. precedence evaluation
4. conflict detection
5. conflict resolution
6. validation
7. publication
No ambiguous resolution is permitted.
11. Context Prioritization
Default precedence:

```text
Runtime Override

↓

Workflow State

↓

Execution Session

↓

Patient

↓

Encounter

↓

Documentation

↓

User

↓

Configuration

↓

Platform Defaults

```

Higher levels override lower levels.
Only one canonical value may exist for any field.
12. Engine Interfaces
The engine exposes stable service interfaces.
Lifecycle

* CreateContext
* UpdateContext
* DisposeContext
Resolution

* MergeContext
* ResolveContext
* NormalizeContext
Validation

* ValidateContext
* ValidateSchema
* ValidateOwnership
Publication

* SnapshotContext
* PublishContext
Query

* GetContext
* GetContextSection
* GetContextVersion
* GetMetadata
13. Internal Components
Context Loader
Collects provider output.
Provider Registry
Registers context providers.
Normalizer
Canonical transformation.
Aggregator
Builds unified context.
Resolver
Conflict resolution.
Validator
Structural validation.
Version Manager
Context revisions.
Snapshot Manager
Immutable publication.
Lifecycle Manager
Creation and disposal.
Metadata Manager
Execution metadata.
Extension Manager
Third-party context integration.
14. Dependencies
The Context Engine depends only on infrastructure services.
Examples include:

* Configuration Service
* Module Registry
* Provider Registry
* Session Management
The Context Engine shall not depend upon:

* Documentation Engine
* Evidence Engine
* Reasoning Engine
* Validation Engine
* Workflow Engine
* Rendering Engine
* Calculation Engine
This preserves acyclic engine dependencies and maintains infrastructure layering consistent with the architecture principles.
15. Consumers
Every engine may consume context.
Primary consumers include:

* Documentation Engine
* Clinical Reasoning Engine
* Evidence Engine
* Validation Engine
* Rendering Engine
* Calculation Engine
* Search Engine
* Automation Engine
* Workflow Engine
Consumers receive immutable snapshots.
Consumers never modify context.
16. Validation Rules
A published context must satisfy:

* schema validity
* required fields
* canonical ownership
* unique identifiers
* version integrity
* timestamp integrity
* provider integrity
* dependency integrity
* extension validation
* metadata completeness
Publication fails if validation fails.
17. Error Handling
The engine shall classify errors as:
Fatal
Execution cannot continue.
Examples:

* corrupted context
* invalid schema
Recoverable
Execution may continue after correction.
Examples:

* missing optional section
* provider unavailable
Warning
Execution proceeds with degraded functionality.
Informational
Audit events only.
Every error shall contain:

* identifier
* severity
* source
* timestamp
* affected context
* recovery guidance
18. Performance Requirements
The engine shall support:

* deterministic context construction
* low-latency publication
* incremental updates
* constant-time snapshot retrieval
* concurrent isolated contexts
* bounded memory growth
* linear scalability with context size
Performance shall remain independent of downstream engine complexity.
19. Security Considerations
The Context Engine shall:

* prevent unauthorized mutation
* isolate concurrent execution contexts
* preserve context integrity
* support audit metadata
* expose only requested context sections
* validate provider identity
* prevent cross-session leakage
* preserve deterministic execution
The engine shall never expose internal provider implementation details.
20. Future Compatibility
The architecture shall support:

* distributed execution
* collaborative sessions
* external context providers
* EHR adapters
* plugin ecosystems
* cloud execution
* offline execution
* longitudinal encounters
* multiple simultaneous patients
* organizational context
* future engine categories
No future extension may require modification of the canonical Context Object contract.
21. Acceptance Criteria
The Context Engine is considered complete when it can:

* construct canonical execution context
* normalize heterogeneous provider output
* aggregate multiple context sources
* resolve conflicting values deterministically
* validate complete execution context
* publish immutable snapshots
* version every publication
* support concurrent isolated contexts
* expose stable interfaces
* prevent duplicated context ownership
* remain independent of reasoning, workflow, and knowledge
* support all platform engines without architectural changes
22. Out of Scope
The Context Engine does not include:

* reasoning
* medical knowledge
* memory
* documentation generation
* template rendering
* workflow execution
* evidence retrieval
* calculations
* search
* persistent storage
* authentication
* authorization
* scheduling
* user interface
* database implementation
* external integrations
* engine orchestration
23. Architectural Invariants
The following rules are permanent and shall not be violated:

1. The Context Engine is the sole owner of execution context.
2. Every context field has exactly one canonical owner.
3. Context is transient and execution-scoped.
4. Knowledge is never owned by the Context Engine.
5. Workflow is never owned by the Context Engine.
6. Clinical reasoning is never performed by the Context Engine.
7. Published context is immutable.
8. Context resolution is deterministic.
9. Every published context is fully validated.
10. All context is schema-defined.
11. Extensions may add context but shall not redefine canonical fields.
12. Consumers are read-only.
13. The engine exposes stable interfaces independent of implementation.
14. Engine dependencies remain acyclic and infrastructure-directed.
15. The Context Engine shall remain reusable infrastructure supporting every present and future engine in Critical Care OS, consistent with the project's constitutional principles of single responsibility, canonical ownership, specification-first development, and long-term architectural stability.
