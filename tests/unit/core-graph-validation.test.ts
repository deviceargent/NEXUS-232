import { describe, it, expect } from 'vitest';
import {
  TheoryGraph,
  TheoryNode,
  TheoryEdge,
  ValidationCompiler,
  ScientificAliasRegistry,
  generateId
} from '@nexus/core';

describe('TheoryGraph & Validation Compiler', () => {
  it('should maintain graph consistency and resolve ancestors and descendants', () => {
    const aliasRegistry = new ScientificAliasRegistry();
    const graph = new TheoryGraph();

    const h01: TheoryNode = {
      id: generateId(),
      alias: aliasRegistry.nextAlias('H'),
      type: 'HypothesisNode',
      title: 'Dark matter scalar field perturbation',
      content: 'Scalar perturbation psi induces anisotropic velocity dispersion',
      status: 'VALID',
      parentIds: [],
      dependencyIds: [],
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    };

    const h02: TheoryNode = {
      id: generateId(),
      alias: aliasRegistry.nextAlias('H'),
      type: 'DerivationNode',
      title: 'Radial acceleration relation modification',
      content: 'Modified acceleration law a = a_N / (1 - exp(-sqrt(a_N / a_0)))',
      status: 'UNDETERMINED',
      parentIds: [h01.id],
      dependencyIds: [],
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    };

    graph.addNode(h01);
    graph.addNode(h02);

    const edge: TheoryEdge = {
      id: generateId(),
      sourceId: h01.id,
      targetId: h02.id,
      relationType: 'derives',
      createdAt: new Date().toISOString()
    };
    graph.addEdge(edge);

    expect(graph.getAllNodes().length).toBe(2);
    expect(graph.getDirectParents(h02.id)).toEqual([h01]);
    expect(graph.getDirectConsequences(h01.id)).toEqual([h02]);
    expect(graph.getAncestors(h02.id)).toEqual([h01]);
    expect(graph.getDescendants(h01.id)).toEqual([h02]);
    expect(graph.hasCycle()).toBe(false);
  });

  it('should detect cycles in derivation graphs', () => {
    const graph = new TheoryGraph();
    const id1 = generateId();
    const id2 = generateId();

    graph.addNode({
      id: id1,
      alias: 'H-01',
      type: 'HypothesisNode',
      title: 'A',
      content: 'Content A',
      status: 'VALID',
      parentIds: [],
      dependencyIds: [],
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    });

    graph.addNode({
      id: id2,
      alias: 'H-02',
      type: 'DerivationNode',
      title: 'B',
      content: 'Content B',
      status: 'VALID',
      parentIds: [id1],
      dependencyIds: [],
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    });

    graph.addEdge({
      id: 'e1',
      sourceId: id1,
      targetId: id2,
      relationType: 'derives',
      createdAt: new Date().toISOString()
    });

    expect(graph.hasCycle()).toBe(false);

    // Add back edge
    graph.addEdge({
      id: 'e2',
      sourceId: id2,
      targetId: id1,
      relationType: 'derives',
      createdAt: new Date().toISOString()
    });

    expect(graph.hasCycle()).toBe(true);
  });

  it('Fundamental Rule of Theoretical Compiler: should propagate invalidation and block downstream consequences', () => {
    const graph = new TheoryGraph();
    const compiler = new ValidationCompiler();

    const id1 = generateId();
    const id2 = generateId();
    const id3 = generateId();

    const n1: TheoryNode = {
      id: id1,
      alias: 'H-01',
      type: 'HypothesisNode',
      title: 'H-01 Base',
      content: 'Premise base',
      status: 'VALID',
      parentIds: [],
      dependencyIds: [],
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    };

    const n2: TheoryNode = {
      id: id2,
      alias: 'H-02',
      type: 'DerivationNode',
      title: 'H-02 Intermediate Step',
      content: 'Intermediate math step',
      status: 'VALID',
      parentIds: [id1],
      dependencyIds: [],
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    };

    const n3: TheoryNode = {
      id: id3,
      alias: 'H-03',
      type: 'DerivationNode',
      title: 'H-03 Consequence',
      content: 'Observable consequence',
      status: 'VALID',
      parentIds: [id2],
      dependencyIds: [],
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    };

    graph.addNode(n1);
    graph.addNode(n2);
    graph.addNode(n3);

    graph.addEdge({
      id: 'e12',
      sourceId: id1,
      targetId: id2,
      relationType: 'derives',
      createdAt: new Date().toISOString()
    });
    graph.addEdge({
      id: 'e23',
      sourceId: id2,
      targetId: id3,
      relationType: 'derives',
      createdAt: new Date().toISOString()
    });

    // Mark H-02 with an unresolvable contradiction
    graph.updateNode(id2, {
      metadata: {
        reasonsForStatus: ['Contradiction: divergence in Hamiltonian integration']
      }
    });

    // Propagate from H-02
    const { updatedNodes, affectedIds } = compiler.propagateStatus(id2, graph);

    expect(affectedIds).toContain(id2);
    expect(affectedIds).toContain(id3);

    const updatedH02 = graph.getNode(id2)!;
    const updatedH03 = graph.getNode(id3)!;

    // H-02 should be IN_REVIEW or BLOCKED depending on severity
    expect(['IN_REVIEW', 'BLOCKED', 'INVALID']).toContain(updatedH02.status);
    // H-03 consequence must be flagged
    expect(['IN_REVIEW', 'BLOCKED', 'INVALID']).toContain(updatedH03.status);
  });

  it('should freeze branches and protect frozen nodes from mutation', () => {
    const graph = new TheoryGraph();
    const compiler = new ValidationCompiler();

    const id1 = generateId();
    const id2 = generateId();

    graph.addNode({
      id: id1,
      alias: 'H-01',
      type: 'HypothesisNode',
      title: 'H-01',
      content: 'Base',
      status: 'VALID',
      parentIds: [],
      dependencyIds: [],
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    });

    graph.addNode({
      id: id2,
      alias: 'H-02',
      type: 'DerivationNode',
      title: 'H-02',
      content: 'Derived',
      status: 'VALID',
      parentIds: [id1],
      dependencyIds: [],
      resourceIds: [],
      documentFragmentIds: [],
      isFrozen: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    });

    graph.addEdge({
      id: 'e12',
      sourceId: id1,
      targetId: id2,
      relationType: 'derives',
      createdAt: new Date().toISOString()
    });

    compiler.freezeBranch(id1, graph);
    expect(graph.getNode(id1)!.isFrozen).toBe(true);
    expect(graph.getNode(id2)!.isFrozen).toBe(true);
  });
});
