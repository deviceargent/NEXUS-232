/**
 * NEXUS-232 Theory Service
 */

import {
  TheoryNode,
  TheoryNodeType,
  TheoryEdge,
  TheoryStatus,
  NodeMetadata,
  EdgeRelationType,
  TheoryGraph,
  ValidationCompiler,
  ScientificAliasRegistry,
  generateId,
  AliasPrefix
} from '@nexus/core';

export class TheoryService {
  private graph: TheoryGraph;
  private aliasRegistry: ScientificAliasRegistry;
  private validator: ValidationCompiler;

  constructor(graph?: TheoryGraph, aliasRegistry?: ScientificAliasRegistry) {
    this.graph = graph ?? new TheoryGraph();
    this.aliasRegistry = aliasRegistry ?? new ScientificAliasRegistry();
    this.validator = new ValidationCompiler();
  }

  getGraph(): TheoryGraph {
    return this.graph;
  }

  private mapTypeToPrefix(type: TheoryNodeType): AliasPrefix {
    switch (type) {
      case 'HypothesisNode': return 'H';
      case 'EvidenceNode': return 'E';
      case 'DerivationNode': return 'D';
      case 'QuestionNode': return 'Q';
      case 'BlockedNode': return 'B';
      case 'ResourceNode': return 'R';
      case 'EquationNode': return 'EQ';
      case 'ExperimentNode': return 'EXP';
      case 'SimulationNode': return 'SIM';
      default: return 'H';
    }
  }

  createNode(
    type: TheoryNodeType,
    title: string,
    content: string,
    parentIds: string[] = [],
    dependencyIds: string[] = [],
    metadata: NodeMetadata = {}
  ): TheoryNode {
    const prefix = this.mapTypeToPrefix(type);
    const alias = this.aliasRegistry.nextAlias(prefix);
    const now = new Date().toISOString();

    const node: TheoryNode = {
      id: generateId(),
      alias,
      type,
      title,
      content,
      status: 'UNDETERMINED',
      parentIds,
      dependencyIds,
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: now,
      updatedAt: now,
      metadata
    };

    this.graph.addNode(node);

    // Auto-create derivation / dependency edges for declared parents
    for (const pid of parentIds) {
      if (this.graph.hasNode(pid)) {
        this.graph.addEdge({
          id: generateId(),
          sourceId: pid,
          targetId: node.id,
          relationType: 'derives',
          createdAt: now
        });
      }
    }

    for (const did of dependencyIds) {
      if (this.graph.hasNode(did)) {
        this.graph.addEdge({
          id: generateId(),
          sourceId: did,
          targetId: node.id,
          relationType: 'depends_on',
          createdAt: now
        });
      }
    }

    // Trigger validation
    this.validator.propagateStatus(node.id, this.graph);

    return this.graph.getNode(node.id)!;
  }

  updateNode(nodeId: string, patch: Partial<TheoryNode>): TheoryNode {
    const updated = this.graph.updateNode(nodeId, patch);
    // Propagate status downstream when node changes
    this.validator.propagateStatus(nodeId, this.graph);
    return updated;
  }

  deleteNode(nodeId: string): void {
    // Collect consequences before deletion to mark them
    const consequences = this.graph.getDirectConsequences(nodeId);
    this.graph.removeNode(nodeId);

    // Re-evaluate consequences because their prerequisite is gone
    for (const c of consequences) {
      if (this.graph.hasNode(c.id)) {
        this.validator.propagateStatus(c.id, this.graph);
      }
    }
  }

  connectNodes(sourceId: string, targetId: string, relationType: EdgeRelationType): TheoryEdge {
    if (sourceId === targetId) {
      throw new Error('Self-referential loops are prohibited in theoretical derivations');
    }

    const edge: TheoryEdge = {
      id: generateId(),
      sourceId,
      targetId,
      relationType,
      createdAt: new Date().toISOString()
    };

    this.graph.addEdge(edge);

    // Check if a cycle was formed
    if (this.graph.hasCycle()) {
      this.graph.removeEdge(edge.id);
      throw new Error(`Cycle detected: connecting ${sourceId} to ${targetId} creates an invalid circular dependency`);
    }

    // Propagate status to target
    this.validator.propagateStatus(targetId, this.graph);

    return edge;
  }

  disconnectNodes(edgeId: string): void {
    const edge = this.graph.getEdge(edgeId);
    if (!edge) return;
    const targetId = edge.targetId;
    this.graph.removeEdge(edgeId);
    if (this.graph.hasNode(targetId)) {
      this.validator.propagateStatus(targetId, this.graph);
    }
  }

  freezeBranch(nodeId: string): TheoryNode[] {
    return this.validator.freezeBranch(nodeId, this.graph);
  }

  unfreezeBranch(nodeId: string): TheoryNode[] {
    return this.validator.unfreezeBranch(nodeId, this.graph);
  }

  setNodeStatus(nodeId: string, status: TheoryStatus, reason?: string): TheoryNode {
    const node = this.graph.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const reasons = node.metadata.reasonsForStatus ? [...node.metadata.reasonsForStatus] : [];
    if (reason && !reasons.includes(reason)) {
      reasons.push(reason);
    }

    const updated = this.graph.updateNode(nodeId, {
      status,
      metadata: {
        ...node.metadata,
        reasonsForStatus: reasons
      }
    });

    this.validator.propagateStatus(nodeId, this.graph);
    return updated;
  }
}
