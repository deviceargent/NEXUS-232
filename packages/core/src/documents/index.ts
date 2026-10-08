/**
 * NEXUS-232 Document, Fragment & Compilation Models
 */

export interface DocumentFragment {
  id: string;
  alias: string;
  documentId: string;
  title: string;
  sectionName?: string;
  startLine: number;
  endLine: number;
  latexContent: string;
  sourceNodeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentMetadata {
  documentclass?: string;
  bibtexPath?: string;
  packages?: string[];
  author?: string;
  [key: string]: unknown;
}

export interface Document {
  id: string;
  title: string;
  latexContent: string;
  fragments: DocumentFragment[];
  metadata: DocumentMetadata;
  createdAt: string;
  updatedAt: string;
}

export type CompilerEngine = 'pdflatex' | 'xelatex' | 'lualatex' | 'tectonic';

export type CompilationStatus = 'IDLE' | 'PENDING' | 'SUCCESS' | 'ERROR';

export interface CompilationError {
  line?: number;
  column?: number;
  message: string;
  rawText: string;
}

export interface Compilation {
  id: string;
  documentId: string;
  compiler: CompilerEngine;
  status: CompilationStatus;
  pdfPath?: string;
  logOutput: string;
  errors: CompilationError[];
  compiledAt: string;
  durationMs: number;
}
