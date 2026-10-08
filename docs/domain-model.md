# NEXUS-232 — Domain Model Specification

## 1. Core Entities

### `Project`
Root workspace entity. Contains configuration settings (compiler engine, theme, AI provider) and serialized Allotment layout configurations.

### `TheoryNode`
Fundamental building block of the theoretical derivation graph:
* `id`: Stable UUID string (internal primary key).
* `alias`: Scientific human-readable identifier (`H-01`, `H-02`, `E-01`, `D-01`, etc.).
* `type`:
  - `HypothesisNode`
  - `DerivationNode`
  - `EvidenceNode`
  - `QuestionNode`
  - `BlockedNode`
  - `ResourceNode`
  - `EquationNode`
  - `ExperimentNode`
  - `SimulationNode`
* `status`:
  - `VALID`: Satisfies current theoretical and empirical rules.
  - `IN_REVIEW`: Subject to ongoing revision or parent uncertainty.
  - `BLOCKED`: Blocked by contradiction or missing dependency.
  - `UNDETERMINED`: Not yet evaluated.
  - `INVALID`: Disproven or refuted.
* `parentIds`: Array of ancestor derivation nodes.
* `dependencyIds`: Array of prerequisite nodes.
* `resourceIds`: Linked empirical evidence resources.
* `documentFragmentIds`: Linked LaTeX sections and equations.
* `isFrozen`: Boolean indicating whether branch mutations are locked.

### `TheoryEdge`
Directed relationship between two nodes:
* `sourceId` & `targetId`
* `relationType`: `derives` | `supports` | `refutes` | `depends_on` | `relates_to`

---

## 2. Fundamental Rule of the Theoretical Compiler

When a derivation reaches:
1. Contradiction
2. Missing prerequisite or uninstantiated dependency
3. Incompatible empirical observation
4. Unknown boundary condition
5. Unjustifiable mathematical step

The compiler flags the exact point (e.g. `H-03 ⚠` or `H-04 ⛔`).
* The engine **never** invents an unjustified assumption to force branch continuity.
* Status changes cascade downwards along consequence paths.
* When a node is modified, all consequences are marked for re-evaluation.

---

## 3. Resource Anchors

Resources support targeted sub-anchors:
* **VideoAnchor**: `resourceId`, `timestampSeconds` (jump directly to a specific timestamp in playback).
* **PDFAnchor**: `resourceId`, `pageNumber`, optional bounding box.
* **DocumentAnchor**: `documentId`, `fragmentId`.
* **ThreeDAnchor**: `resourceId`, camera vantage position and target mesh.
