/**
 * NEXUS-232 Theory Domain Entities
 */

export type TheoryStatus =
  | 'VALID'
  | 'IN_REVIEW'
  | 'BLOCKED'
  | 'UNDETERMINED'
  | 'INVALID';

export type TheoryNodeType =
  | 'HypothesisNode'
  | 'DerivationNode'
  | 'EvidenceNode'
  | 'QuestionNode'
  | 'BlockedNode'
  | 'ResourceNode'
  | 'EquationNode'
  | 'ExperimentNode'
  | 'SimulationNode';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeMetadata {
  confidence?: number;
  epistemicWeight?: number;
  tags?: string[];
  equationLatex?: string;
  assumptions?: string[];
  reasonsForStatus?: string[];
  frozenAt?: string;
  sourceContext?: string;
  position?: NodePosition;
  [key: string]: unknown;
}

export interface TheoryNode {
  id: string;
  alias: string;
  type: TheoryNodeType;
  title: string;
  content: string;
  status: TheoryStatus;
  parentIds: string[];
  dependencyIds: string[];
  resourceIds: string[];
  documentFragmentIds: string[];
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: NodeMetadata;
}

export type EdgeRelationType =
  | 'derives'
  | 'supports'
  | 'refutes'
  | 'depends_on'
  | 'relates_to';

export interface TheoryEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: EdgeRelationType;
  label?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}
