import { describe, it, expect } from 'vitest';
import {
  ProjectService,
  TheoryService,
  GraphService,
  DocumentService,
  ResourceService,
  CompilationService,
  AgentService,
  InMemoryPersistenceAdapter
} from '@nexus/application';
import { AgentPlanner } from '@nexus/agent';

describe('NEXUS-232 Complete Vertical Slice Integration Test', () => {
  it('End-to-End: Chat → Node → Graph → Resource → Document → LaTeX → PDF → Persistence → Restore', async () => {
    // 1. Initialize persistent storage layer
    const persistence = new InMemoryPersistenceAdapter();

    // 2. Initialize application services
    const projectService = new ProjectService(persistence);
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
    const agentPlanner = new AgentPlanner(
      projectService,
      theoryService,
      graphService,
      documentService,
      resourceService,
      agentService,
      compilationService
    );

    // 3. Crear proyecto
    const project = await projectService.createProject(
      'Anisotropy & Modified Dynamics Testbed',
      'Unified scientific investigation into scalar field perturbations.'
    );
    expect(project.id).toBeDefined();
    expect(projectService.getCurrentProject()?.id).toBe(project.id);

    // Initialize base document
    const doc = documentService.createDocument('Formal Derivation Document');
    expect(doc.id).toBeDefined();

    // 4. Escribir en Chat → agente crea H-01
    const chatStep1 = await agentPlanner.processUserMessage(
      'La perturbación del campo podría explicar la anisotropía.'
    );
    expect(chatStep1.executedTools.length).toBeGreaterThan(0);
    expect(chatStep1.executedTools[0].toolName).toBe('create_node');
    expect(chatStep1.executedTools[0].success).toBe(true);

    // 5. H-01 aparece en Canvas & Inspector muestra H-01
    const nodesAfterStep1 = graphService.getAllNodes();
    expect(nodesAfterStep1.length).toBe(1);
    const h01 = nodesAfterStep1[0];
    expect(h01.alias).toBe('H-01');
    expect(h01.title).toContain('Scalar field perturbation');

    // 6. Crear H-02 & conectar H-01 → H-02
    const chatStep2 = await agentPlanner.processUserMessage(
      'Derivá sus consecuencias.',
      h01.id
    );
    expect(chatStep2.executedTools.length).toBeGreaterThan(0);

    const nodesAfterStep2 = graphService.getAllNodes();
    expect(nodesAfterStep2.length).toBe(2);
    const h02 = nodesAfterStep2[1];
    expect(h02.alias).toBe('D-01');

    // Verify connection in graph
    const edges = graphService.getAllEdges();
    expect(edges.length).toBe(1);
    expect(edges[0].sourceId).toBe(h01.id);
    expect(edges[0].targetId).toBe(h02.id);
    expect(edges[0].relationType).toBe('derives');

    // 7. Adjuntar PDF & abrir PDF anchor
    const pdfResource = resourceService.addResource(
      'PDF',
      'Milgrom (1983) A Modification of the Newtonian Dynamics',
      'papers/milgrom1983.pdf',
      { author: 'M. Milgrom', year: 1983 }
    );
    const pdfAnchor = resourceService.addPDFAnchor(pdfResource.id, 'Field Equation p.3', 3);
    resourceService.attachResourceToNode(h01.id, pdfResource.id);

    const attached = resourceService.getResourcesForNode(h01.id);
    expect(attached.length).toBe(1);
    expect(attached[0].id).toBe(pdfResource.id);
    expect(pdfResource.anchors[0].id).toBe(pdfAnchor.id);

    // 8. Crear fragmento LaTeX & editar en Monaco
    const fragment = documentService.createFragment(
      doc.id,
      'Consequences of the perturbation',
      '\\section{Consequences of the perturbation}\n\\begin{equation}\na = \\frac{a_N}{1 - e^{-\\sqrt{a_N / a_0}}}\n\\end{equation}',
      18,
      24,
      'Observable Consequences',
      [h02.id]
    );
    expect(fragment.id).toBeDefined();

    // Verify fragment is associated with H-02
    const fragsForH02 = documentService.getFragmentsForNode(h02.id);
    expect(fragsForH02.length).toBe(1);
    expect(fragsForH02[0].id).toBe(fragment.id);

    // Update document content
    const updatedLatex = `${doc.latexContent}\n\n% Injected Fragment\n${fragment.latexContent}`;
    documentService.updateDocumentContent(doc.id, updatedLatex);
    expect(documentService.getDocument(doc.id)?.latexContent).toContain('Consequences of the perturbation');

    // 9. Compilar documento LaTeX → producir PDF
    const compilation = await compilationService.compileDocument(doc.id, 'pdflatex');
    expect(compilation.status).toBe('SUCCESS');
    expect(compilation.pdfPath).toBeDefined();
    expect(compilation.durationMs).toBeGreaterThanOrEqual(0);

    // 10. Agregar Video con timestamp anchor & 3D resource
    const videoResource = resourceService.addResource(
      'Video',
      'Hydrodynamic Lab Experiment Run #27',
      'videos/run27.mp4',
      { durationSeconds: 1200 }
    );
    const videoAnchor = resourceService.addVideoAnchor(videoResource.id, 'Turbulence Onset', 822); // 13:42
    resourceService.attachResourceToNode(h02.id, videoResource.id);
    expect(videoAnchor.timestampSeconds).toBe(822);

    const model3D = resourceService.addResource(
      '3DModel',
      'N-Body Galactic Halo Potential Dispersion',
      'models/halo.obj',
      { datasetFormat: 'vector field' }
    );
    const anchor3D = resourceService.add3DAnchor(model3D.id, 'Vantage Point', [0, 5, 10], [0, 0, 0]);
    expect(anchor3D.type).toBe('3D_CAMERA');

    // 11. Guardar en Persistencia SQLite / Storage
    const bundleToSave = {
      project,
      nodes: graphService.getAllNodes(),
      edges: graphService.getAllEdges(),
      resources: resourceService.getAllResources(),
      documents: documentService.getAllDocuments(),
      compilations: compilationService.getCompilationHistory(doc.id),
      messages: agentService.getMessages(),
      actions: agentService.getActions()
    };
    await persistence.saveProject(bundleToSave);

    // 12. Simular cerrar y abrir en nueva sesión: Restaurar exactamente el estado
    const freshPersistence = persistence;
    const freshProjectService = new ProjectService(freshPersistence);
    const restoredBundle = await freshProjectService.loadProject(project.id);

    expect(restoredBundle).not.toBeNull();
    expect(restoredBundle!.project.id).toBe(project.id);
    expect(restoredBundle!.project.name).toBe('Anisotropy & Modified Dynamics Testbed');
    expect(restoredBundle!.nodes.length).toBe(2);
    expect(restoredBundle!.nodes[0].alias).toBe('H-01');
    expect(restoredBundle!.nodes[1].alias).toBe('D-01');
    expect(restoredBundle!.edges.length).toBe(1);
    expect(restoredBundle!.resources.length).toBe(3);
    expect(restoredBundle!.documents.length).toBe(1);
    expect(restoredBundle!.compilations.length).toBe(1);
    expect(restoredBundle!.compilations[0].status).toBe('SUCCESS');
    expect(restoredBundle!.messages.length).toBeGreaterThan(0);
  });
});
