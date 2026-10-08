import { describe, it, expect } from 'vitest';
import {
  ProjectService,
  TheoryService,
  GraphService,
  DocumentService,
  ResourceService,
  AgentService,
  CompilationService,
  InMemoryPersistenceAdapter
} from '@nexus/application';
import { AgentPlanner, DeterministicScientificProvider } from '@nexus/agent';

describe('Agent Tools & Planner Pipeline', () => {
  it('should process user intent, execute create_node via application services, and update the graph', async () => {
    const persistence = new InMemoryPersistenceAdapter();
    const projectService = new ProjectService(persistence);
    await projectService.createProject('Dark Matter Anisotropy Exploration');

    const theoryService = new TheoryService();
    const graphService = new GraphService(theoryService);
    const documentService = new DocumentService(theoryService);
    const resourceService = new ResourceService(theoryService);
    const compilationService = new CompilationService(documentService);

    const agentService = new AgentService(
      theoryService,
      graphService,
      documentService,
      resourceService,
      compilationService
    );

    const planner = new AgentPlanner(
      projectService,
      theoryService,
      graphService,
      documentService,
      resourceService,
      agentService,
      compilationService
    );

    // 1. User proposes hypothesis
    const step1 = await planner.processUserMessage(
      'La perturbación del campo escalar podría explicar la anisotropía observada.'
    );

    expect(step1.executedTools.length).toBeGreaterThan(0);
    expect(step1.executedTools[0].toolName).toBe('create_node');
    expect(step1.executedTools[0].success).toBe(true);

    const nodes = graphService.getAllNodes();
    expect(nodes.length).toBe(1);
    expect(nodes[0].alias).toBe('H-01');
    expect(nodes[0].title).toContain('Scalar field perturbation');

    // 2. User asks to derive consequences
    const step2 = await planner.processUserMessage(
      'Derivá sus consecuencias observacionales en la curva de rotación.',
      nodes[0].id
    );

    expect(step2.executedTools.length).toBeGreaterThan(0);
    const updatedNodes = graphService.getAllNodes();
    expect(updatedNodes.length).toBe(2);
    expect(updatedNodes[1].alias).toBe('D-01');

    // Verify derivation link
    const edges = graphService.getAllEdges();
    expect(edges.length).toBe(1);
    expect(edges[0].sourceId).toBe(nodes[0].id);
    expect(edges[0].targetId).toBe(updatedNodes[1].id);
    expect(edges[0].relationType).toBe('derives');
  });
});
