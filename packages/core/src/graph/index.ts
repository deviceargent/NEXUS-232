/**
 * NEXUS-232 Theory Graph Domain Model
 * 
 * The domain graph is the single source of scientific truth.
 * XYFlow and other visual components are pure projections of this graph.
 */

import { TheoryNode, TheoryEdge } from '../theory/index.js';

export class TheoryGraph {
  private nodes = new Map<string, TheoryNode>();
  private edges = new Map<string, TheoryEdge>();

  constructor(nodes?: TheoryNode[], edges?: TheoryEdge[]) {
    if (nodes) {
      for (const node of nodes) {
        this.nodes.set(node.id, { ...node });
      }
    }
    if (edges) {
      for (const edge of edges) {
        this.edges.set(edge.id, { ...edge });
      }
    }
  }

  // --- Node CRUD ---
  addNode(node: TheoryNode): void {
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with ID ${node.id} already exists`);
    }
    this.nodes.set(node.id, { ...node });
  }

  updateNode(nodeId: string, patch: Partial<TheoryNode>): TheoryNode {
    const existing = this.nodes.get(nodeId);
    if (!existing) {
      throw new Error(`Node with ID ${nodeId} not found`);
    }
    const updated: TheoryNode = {
      ...existing,
      ...patch,
      metadata: { ...existing.metadata, ...(patch.metadata ?? {}) },
      updatedAt: new Date().toISOString()
    };
    this.nodes.set(nodeId, updated);
    return updated;
  }

  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    // Remove adjacent edges
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.sourceId === nodeId || edge.targetId === nodeId) {
        this.edges.delete(edgeId);
      }
    }
    // Clean up parent/dependency references in other nodes
    for (const [id, node] of this.nodes.entries()) {
      let changed = false;
      const newParents = node.parentIds.filter((pid) => pid !== nodeId);
      const newDeps = node.dependencyIds.filter((did) => did !== nodeId);
      if (newParents.length !== node.parentIds.length || newDeps.length !== node.dependencyIds.length) {
        changed = true;
      }
      if (changed) {
        this.nodes.set(id, {
          ...node,
          parentIds: newParents,
          dependencyIds: newDeps,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  getNode(nodeId: string): TheoryNode | undefined {
    return this.nodes.get(nodeId);
  }

  hasNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  getAllNodes(): TheoryNode[] {
    return Array.from(this.nodes.values());
  }

  // --- Edge CRUD ---
  addEdge(edge: TheoryEdge): void {
    if (!this.nodes.has(edge.sourceId)) {
      throw new Error(`Source node ${edge.sourceId} does not exist`);
    }
    if (!this.nodes.has(edge.targetId)) {
      throw new Error(`Target node ${edge.targetId} does not exist`);
    }
    this.edges.set(edge.id, { ...edge });

    // Synchronize parent/dependency relationship on target node
    const target = this.nodes.get(edge.targetId)!;
    if (edge.relationType === 'derives') {
      if (!target.parentIds.includes(edge.sourceId)) {
        this.updateNode(target.id, {
          parentIds: [...target.parentIds, edge.sourceId]
        });
      }
    } else if (edge.relationType === 'depends_on') {
      if (!target.dependencyIds.includes(edge.sourceId)) {
        this.updateNode(target.id, {
          dependencyIds: [...target.dependencyIds, edge.sourceId]
        });
      }
    }
  }

  removeEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (!edge) return;

    this.edges.delete(edgeId);
    // Optionally clean references if no other edge provides that relationship
    const target = this.nodes.get(edge.targetId);
    if (target) {
      if (edge.relationType === 'derives') {
        const stillParent = Array.from(this.edges.values()).some(
          (e) => e.targetId === edge.targetId && e.sourceId === edge.sourceId && e.relationType === 'derives'
        );
        if (!stillParent) {
          this.updateNode(target.id, {
            parentIds: target.parentIds.filter((id) => id !== edge.sourceId)
          });
        }
      } else if (edge.relationType === 'depends_on') {
        const stillDep = Array.from(this.edges.values()).some(
          (e) => e.targetId === edge.targetId && e.sourceId === edge.sourceId && e.relationType === 'depends_on'
        );
        if (!stillDep) {
          this.updateNode(target.id, {
            dependencyIds: target.dependencyIds.filter((id) => id !== edge.sourceId)
          });
        }
      }
    }
  }

  getEdge(edgeId: string): TheoryEdge | undefined {
    return this.edges.get(edgeId);
  }

  getAllEdges(): TheoryEdge[] {
    return Array.from(this.edges.values());
  }

  // --- Graph Traversal & Queries ---
  getDirectParents(nodeId: string): TheoryNode[] {
    const parents: TheoryNode[] = [];
    for (const edge of this.edges.values()) {
      if (edge.targetId === nodeId && edge.relationType === 'derives') {
        const node = this.nodes.get(edge.sourceId);
        if (node) parents.push(node);
      }
    }
    return parents;
  }

  getDirectDependencies(nodeId: string): TheoryNode[] {
    const deps: TheoryNode[] = [];
    for (const edge of this.edges.values()) {
      if (edge.targetId === nodeId && edge.relationType === 'depends_on') {
        const node = this.nodes.get(edge.sourceId);
        if (node) deps.push(node);
      }
    }
    return deps;
  }

  getDirectChildren(nodeId: string): TheoryNode[] {
    const children: TheoryNode[] = [];
    for (const edge of this.edges.values()) {
      if (edge.sourceId === nodeId && edge.relationType === 'derives') {
        const node = this.nodes.get(edge.targetId);
        if (node) children.push(node);
      }
    }
    return children;
  }

  getDirectConsequences(nodeId: string): TheoryNode[] {
    // Consequences: any node where nodeId is a source in 'derives' or 'depends_on'
    const consequences: TheoryNode[] = [];
    for (const edge of this.edges.values()) {
      if (edge.sourceId === nodeId && (edge.relationType === 'derives' || edge.relationType === 'depends_on')) {
        const node = this.nodes.get(edge.targetId);
        if (node && !consequences.some((c) => c.id === node.id)) {
          consequences.push(node);
        }
      }
    }
    return consequences;
  }

  getAncestors(nodeId: string): TheoryNode[] {
    const visited = new Set<string>();
    const stack = [nodeId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      // Direct parents & dependencies
      for (const edge of this.edges.values()) {
        if (edge.targetId === current && (edge.relationType === 'derives' || edge.relationType === 'depends_on')) {
          if (!visited.has(edge.sourceId)) {
            visited.add(edge.sourceId);
            stack.push(edge.sourceId);
          }
        }
      }
    }

    return Array.from(visited)
      .map((id) => this.nodes.get(id))
      .filter((n): n is TheoryNode => !!n);
  }

  getDescendants(nodeId: string): TheoryNode[] {
    const visited = new Set<string>();
    const stack = [nodeId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      for (const edge of this.edges.values()) {
        if (edge.sourceId === current && (edge.relationType === 'derives' || edge.relationType === 'depends_on')) {
          if (!visited.has(edge.targetId)) {
            visited.add(edge.targetId);
            stack.push(edge.targetId);
          }
        }
      }
    }

    return Array.from(visited)
      .map((id) => this.nodes.get(id))
      .filter((n): n is TheoryNode => !!n);
  }

  hasCycle(): boolean {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const children = this.getDirectConsequences(nodeId);
      for (const child of children) {
        if (!visited.has(child.id)) {
          if (dfs(child.id)) return true;
        } else if (recStack.has(child.id)) {
          return true;
        }
      }

      recStack.delete(nodeId);
      return false;
    };

    for (const node of this.nodes.values()) {
      if (!visited.has(node.id)) {
        if (dfs(node.id)) return true;
      }
    }

    return false;
  }

  clone(): TheoryGraph {
    const nodes = this.getAllNodes().map((n) => ({ ...n }));
    const edges = this.getAllEdges().map((e) => ({ ...e }));
    return new TheoryGraph(nodes, edges);
  }
}
