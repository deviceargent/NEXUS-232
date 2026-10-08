/**
 * NEXUS-232 Document & Fragment Service
 */

import {
  Document,
  DocumentFragment,
  ScientificAliasRegistry,
  generateId
} from '@nexus/core';
import { TheoryService } from '../theory-service/index.js';

export const INITIAL_LATEX_TEMPLATE = `\\documentclass[11pt,a4paper]{article}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\title{NEXUS-232: Unified Theoretical Workspace}
\\author{Principal Investigator}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
Formal derivation of gravitational and field perturbation hypotheses.
\\end{abstract}

\\section{Introduction}
This document records theoretical derivations compiled directly from the NEXUS-232 theory canvas.

\\section{Hypothesis Derivations}
% Frag: H-01
\\begin{equation}
\\nabla^2 \\psi - \\frac{1}{c^2} \\frac{\\partial^2 \\psi}{\\partial t^2} = 4\\pi G \\rho_{\\text{eff}}
\\end{equation}

\\section{Observable Consequences}
% Frag: H-02
\\begin{equation}
a = \\frac{a_N}{1 - e^{-\\sqrt{a_N / a_0}}}
\\end{equation}

\\end{document}
`;

export class DocumentService {
  private documents = new Map<string, Document>();
  private fragments = new Map<string, DocumentFragment>();
  private aliasRegistry: ScientificAliasRegistry;

  constructor(
    private theoryService?: TheoryService,
    aliasRegistry?: ScientificAliasRegistry
  ) {
    this.aliasRegistry = aliasRegistry ?? new ScientificAliasRegistry();
  }

  createDocument(title: string, latexContent: string = INITIAL_LATEX_TEMPLATE): Document {
    const now = new Date().toISOString();
    const doc: Document = {
      id: generateId(),
      title,
      latexContent,
      fragments: [],
      metadata: {},
      createdAt: now,
      updatedAt: now
    };
    this.documents.set(doc.id, doc);
    return doc;
  }

  getDocument(documentId: string): Document | undefined {
    return this.documents.get(documentId);
  }

  getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  updateDocumentContent(documentId: string, newContent: string): Document {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }
    doc.latexContent = newContent;
    doc.updatedAt = new Date().toISOString();
    return doc;
  }

  createFragment(
    documentId: string,
    title: string,
    latexContent: string,
    startLine: number,
    endLine: number,
    sectionName?: string,
    sourceNodeIds: string[] = []
  ): DocumentFragment {
    const doc = this.documents.get(documentId);
    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }

    const alias = this.aliasRegistry.nextAlias('D');
    const now = new Date().toISOString();

    const fragment: DocumentFragment = {
      id: generateId(),
      alias,
      documentId,
      title,
      sectionName,
      startLine,
      endLine,
      latexContent,
      sourceNodeIds,
      createdAt: now,
      updatedAt: now
    };

    this.fragments.set(fragment.id, fragment);
    doc.fragments.push(fragment);

    // If source nodes are linked, update them in theory service
    if (this.theoryService) {
      for (const nodeId of sourceNodeIds) {
        const node = this.theoryService.getGraph().getNode(nodeId);
        if (node && !node.documentFragmentIds.includes(fragment.id)) {
          this.theoryService.updateNode(nodeId, {
            documentFragmentIds: [...node.documentFragmentIds, fragment.id]
          });
        }
      }
    }

    return fragment;
  }

  linkFragmentToNode(fragmentId: string, nodeId: string): void {
    const fragment = this.fragments.get(fragmentId);
    if (!fragment) {
      throw new Error(`Fragment ${fragmentId} not found`);
    }

    if (!fragment.sourceNodeIds.includes(nodeId)) {
      fragment.sourceNodeIds.push(nodeId);
      fragment.updatedAt = new Date().toISOString();
    }

    if (this.theoryService) {
      const node = this.theoryService.getGraph().getNode(nodeId);
      if (node && !node.documentFragmentIds.includes(fragmentId)) {
        this.theoryService.updateNode(nodeId, {
          documentFragmentIds: [...node.documentFragmentIds, fragmentId]
        });
      }
    }
  }

  getFragmentsForNode(nodeId: string): DocumentFragment[] {
    return Array.from(this.fragments.values()).filter((f) =>
      f.sourceNodeIds.includes(nodeId)
    );
  }

  getNodesForFragment(fragmentId: string): string[] {
    const fragment = this.fragments.get(fragmentId);
    return fragment ? fragment.sourceNodeIds : [];
  }
}
