import { describe, it, expect } from 'vitest';
import {
  DocumentService,
  CompilationService,
  MockCompilerAdapter
} from '@nexus/application';
import { TheoryService } from '@nexus/application';

describe('Document Synchronization & LaTeX Compilation', () => {
  it('should detect compilers, create fragments linked to nodes, and compile valid LaTeX', async () => {
    const theoryService = new TheoryService();
    const docService = new DocumentService(theoryService);
    const compService = new CompilationService(docService, new MockCompilerAdapter());

    // 1. Check compiler detection
    const compilers = await compService.detectInstalledCompilers();
    expect(compilers.length).toBeGreaterThan(0);
    const pdflatex = compilers.find((c) => c.engine === 'pdflatex');
    expect(pdflatex).toBeDefined();
    expect(pdflatex?.isAvailable).toBe(true);
    expect(pdflatex?.status).toBe('READY');

    // 2. Create document and node
    const doc = docService.createDocument('Galactic Dynamics Paper');
    const node = theoryService.createNode('HypothesisNode', 'Initial Hypothesis', 'Content');

    // 3. Link fragment
    const frag = docService.createFragment(
      doc.id,
      'Field Equations',
      '\\begin{equation} \\nabla^2 \\phi = 4\\pi G \\rho \\end{equation}',
      10,
      14,
      'Field Theory',
      [node.id]
    );

    expect(docService.getFragmentsForNode(node.id).length).toBe(1);
    expect(docService.getNodesForFragment(frag.id)).toEqual([node.id]);

    // 4. Compile document
    const compilation = await compService.compileDocument(doc.id, 'pdflatex');
    expect(compilation.status).toBe('SUCCESS');
    expect(compilation.pdfPath).toBeDefined();
    expect(compilation.errors.length).toBe(0);

    // 5. Test error parsing on syntax error
    docService.updateDocumentContent(doc.id, '\\documentclass{article}\n\\begin{document}\n\\error{syntax}');
    const failCompilation = await compService.compileDocument(doc.id, 'pdflatex');
    expect(failCompilation.status).toBe('ERROR');
    expect(failCompilation.errors.length).toBeGreaterThan(0);
    expect(failCompilation.errors[0].message).toContain('Undefined control sequence');
  });
});
