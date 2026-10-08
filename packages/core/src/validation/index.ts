/**
 * NEXUS-232 Validation & Theoretical Compiler Engine
 * 
 * Fundamental Rule of the Theoretical Compiler:
 * When a derivation reaches a contradiction, missing dependency, incompatible data,
 * unknown condition, or unjustifiable mathematical step, the compiler marks the exact point.
 * 
 * The engine NEVER invents solutions to force a branch to continue.
 * Status propagates downwards to affected consequences.
 * If a node changes, all its descendants are marked for re-evaluation.
 */

import { TheoryNode, TheoryStatus } from '../theory/index.js';
import { TheoryGraph } from '../graph/index.js';

export type ValidationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'BLOCKER';

export type ValidationIssueCode =
  | 'CONTRADICTION'
  | 'MISSING_DEPENDENCY'
  | 'INCOMPATIBLE_DATA'
  | 'UNKNOWN_CONDITION'
  | 'UNJUSTIFIABLE_STEP'
  | 'CIRCULAR_DEPENDENCY'
  | 'UNRESOLVED_PREMISE'
  | 'BRANCH_FROZEN';

export interface ValidationIssue {
  id: string;
  nodeId: string;
  code: ValidationIssueCode;
  severity: ValidationSeverity;
  message: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface ValidationResult {
  nodeId: string;
  newStatus: TheoryStatus;
  isValid: boolean;
  issues: ValidationIssue[];
  propagatedAffectedNodeIds: string[];
  evaluatedAt: string;
}

export class ValidationCompiler {
  /**
   * Validates a single node against graph rules and its local prerequisites.
   */
  validateNode(nodeId: string, graph: TheoryGraph): ValidationResult {
    const node = graph.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found in graph`);
    }

    const issues: ValidationIssue[] = [];
    const now = new Date().toISOString();

    // 1. Check for missing dependencies
    for (const depId of node.dependencyIds) {
      const dep = graph.getNode(depId);
      if (!dep) {
        issues.push({
          id: `iss-${Math.random().toString(36).substring(2, 9)}`,
          nodeId,
          code: 'MISSING_DEPENDENCY',
          severity: 'BLOCKER',
          message: `Referenced dependency ${depId} does not exist in graph`,
          createdAt: now
        });
      } else if (dep.status === 'BLOCKED' || dep.status === 'INVALID') {
        issues.push({
          id: `iss-${Math.random().toString(36).substring(2, 9)}`,
          nodeId,
          code: 'UNRESOLVED_PREMISE',
          severity: 'BLOCKER',
          message: `Dependency [${dep.alias}] is ${dep.status}`,
          createdAt: now
        });
      }
    }

    // 2. Check for missing parents
    for (const parentId of node.parentIds) {
      const parent = graph.getNode(parentId);
      if (!parent) {
        issues.push({
          id: `iss-${Math.random().toString(36).substring(2, 9)}`,
          nodeId,
          code: 'MISSING_DEPENDENCY',
          severity: 'BLOCKER',
          message: `Parent node ${parentId} does not exist`,
          createdAt: now
        });
      } else if (parent.status === 'BLOCKED') {
        issues.push({
          id: `iss-${Math.random().toString(36).substring(2, 9)}`,
          nodeId,
          code: 'UNRESOLVED_PREMISE',
          severity: 'BLOCKER',
          message: `Derivation parent [${parent.alias}] is BLOCKED`,
          createdAt: now
        });
      } else if (parent.status === 'INVALID') {
        issues.push({
          id: `iss-${Math.random().toString(36).substring(2, 9)}`,
          nodeId,
          code: 'CONTRADICTION',
          severity: 'ERROR',
          message: `Parent [${parent.alias}] has been invalidated`,
          createdAt: now
        });
      } else if (parent.status === 'IN_REVIEW' || parent.status === 'UNDETERMINED') {
        issues.push({
          id: `iss-${Math.random().toString(36).substring(2, 9)}`,
          nodeId,
          code: 'UNKNOWN_CONDITION',
          severity: 'WARNING',
          message: `Parent [${parent.alias}] is under review or undetermined`,
          createdAt: now
        });
      }
    }

    // 3. Check node-specific conditions from metadata
    if (node.metadata.reasonsForStatus && node.metadata.reasonsForStatus.length > 0) {
      for (const reason of node.metadata.reasonsForStatus) {
        issues.push({
          id: `iss-${Math.random().toString(36).substring(2, 9)}`,
          nodeId,
          code: 'INCOMPATIBLE_DATA',
          severity: node.status === 'BLOCKED' ? 'BLOCKER' : 'WARNING',
          message: reason,
          createdAt: now
        });
      }
    }

    // 4. Compute status based on issues
    let newStatus: TheoryStatus = node.status;
    const hasBlocker = issues.some((i) => i.severity === 'BLOCKER');
    const hasError = issues.some((i) => i.severity === 'ERROR');
    const hasWarning = issues.some((i) => i.severity === 'WARNING');

    if (node.type === 'BlockedNode' || hasBlocker) {
      newStatus = 'BLOCKED';
    } else if (hasError) {
      newStatus = 'INVALID';
    } else if (hasWarning) {
      newStatus = 'IN_REVIEW';
    } else if (issues.length === 0 && node.content.trim().length > 0) {
      // Passes current rules
      newStatus = 'VALID';
    } else {
      newStatus = 'UNDETERMINED';
    }

    return {
      nodeId,
      newStatus,
      isValid: newStatus === 'VALID',
      issues,
      propagatedAffectedNodeIds: [],
      evaluatedAt: now
    };
  }

  /**
   * Propagates invalidation or status changes down the consequence chain.
   * If a node changes, all its descendants are marked for re-evaluation.
   */
  propagateStatus(
    rootNodeId: string,
    graph: TheoryGraph
  ): { updatedNodes: TheoryNode[]; affectedIds: string[] } {
    const updatedNodes: TheoryNode[] = [];
    const affectedIds: string[] = [];

    // 1. Evaluate root node
    const rootResult = this.validateNode(rootNodeId, graph);
    const rootNode = graph.getNode(rootNodeId)!;
    if (rootNode.status !== rootResult.newStatus) {
      const updatedRoot = graph.updateNode(rootNodeId, {
        status: rootResult.newStatus,
        metadata: {
          ...rootNode.metadata,
          lastValidation: rootResult.evaluatedAt
        }
      });
      updatedNodes.push(updatedRoot);
      affectedIds.push(rootNodeId);
    }

    // 2. Cascade down all descendants in topological / BFS order
    const descendants = graph.getDescendants(rootNodeId);
    for (const desc of descendants) {
      if (desc.isFrozen) {
        // Frozen branch nodes are preserved and not auto-mutated, but flagged
        continue;
      }

      const res = this.validateNode(desc.id, graph);
      let targetStatus = res.newStatus;

      // If any parent or dependency is BLOCKED, consequence must become BLOCKED
      const directParents = graph.getDirectParents(desc.id);
      const directDeps = graph.getDirectDependencies(desc.id);
      const anyBlocked = [...directParents, ...directDeps].some((p) => p.status === 'BLOCKED');
      const anyInvalid = [...directParents, ...directDeps].some((p) => p.status === 'INVALID');
      const anyInReview = [...directParents, ...directDeps].some((p) => p.status === 'IN_REVIEW');

      if (anyBlocked) {
        targetStatus = 'BLOCKED';
      } else if (anyInvalid) {
        targetStatus = 'INVALID';
      } else if (anyInReview && targetStatus === 'VALID') {
        targetStatus = 'IN_REVIEW';
      }

      if (desc.status !== targetStatus) {
        const updatedDesc = graph.updateNode(desc.id, {
          status: targetStatus,
          metadata: {
            ...desc.metadata,
            lastValidation: res.evaluatedAt,
            consequenceOf: rootNodeId
          }
        });
        updatedNodes.push(updatedDesc);
        affectedIds.push(desc.id);
      }
    }

    return { updatedNodes, affectedIds };
  }

  /**
   * Freezes a branch: locks a node and its entire downstream subtree against speculative changes.
   */
  freezeBranch(rootNodeId: string, graph: TheoryGraph): TheoryNode[] {
    const affected: TheoryNode[] = [];
    const targetNodes = [graph.getNode(rootNodeId)!, ...graph.getDescendants(rootNodeId)].filter(Boolean);

    for (const node of targetNodes) {
      const updated = graph.updateNode(node.id, {
        isFrozen: true,
        metadata: {
          ...node.metadata,
          frozenAt: new Date().toISOString()
        }
      });
      affected.push(updated);
    }

    return affected;
  }

  /**
   * Unfreezes a branch.
   */
  unfreezeBranch(rootNodeId: string, graph: TheoryGraph): TheoryNode[] {
    const affected: TheoryNode[] = [];
    const targetNodes = [graph.getNode(rootNodeId)!, ...graph.getDescendants(rootNodeId)].filter(Boolean);

    for (const node of targetNodes) {
      const updated = graph.updateNode(node.id, {
        isFrozen: false
      });
      affected.push(updated);
    }

    return affected;
  }
}
