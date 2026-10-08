/**
 * NEXUS-232 LaTeX Compilation Service & Compiler Adapter Interface
 */

import {
  Compilation,
  CompilerEngine,
  CompilationError,
  generateId
} from '@nexus/core';
import { DocumentService } from '../document-service/index.js';

export interface CompilerInfo {
  engine: CompilerEngine;
  path: string;
  version: string;
  isAvailable: boolean;
  status: 'READY' | 'NOT_INSTALLED' | 'ERROR';
}

export interface ILaTeXCompilerAdapter {
  detectCompilers(): Promise<CompilerInfo[]>;
  compileLaTeX(
    documentId: string,
    latexContent: string,
    engine: CompilerEngine
  ): Promise<{
    success: boolean;
    pdfPath?: string;
    pdfDataUri?: string;
    logOutput: string;
    errors: CompilationError[];
    durationMs: number;
  }>;
}

/**
 * Fallback compiler adapter for browser/in-memory environments or mock validation.
 */
export class MockCompilerAdapter implements ILaTeXCompilerAdapter {
  async detectCompilers(): Promise<CompilerInfo[]> {
    return [
      {
        engine: 'pdflatex',
        path: 'C:\\Users\\Administrator\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex.exe',
        version: 'MiKTeX-pdfTeX 4.23 (MiKTeX 25.12)',
        isAvailable: true,
        status: 'READY'
      },
      {
        engine: 'xelatex',
        path: 'xelatex',
        version: 'XeTeX 3.141592653',
        isAvailable: true,
        status: 'READY'
      },
      {
        engine: 'lualatex',
        path: 'lualatex',
        version: '',
        isAvailable: false,
        status: 'NOT_INSTALLED'
      },
      {
        engine: 'tectonic',
        path: 'tectonic',
        version: '',
        isAvailable: false,
        status: 'NOT_INSTALLED'
      }
    ];
  }

  async compileLaTeX(
    documentId: string,
    latexContent: string,
    engine: CompilerEngine
  ): Promise<{
    success: boolean;
    pdfPath?: string;
    pdfDataUri?: string;
    logOutput: string;
    errors: CompilationError[];
    durationMs: number;
  }> {
    const hasSyntaxError = latexContent.includes('\\error{');
    if (hasSyntaxError) {
      return {
        success: false,
        logOutput: '! Undefined control sequence.\nl.15 \\error{syntax}',
        errors: [{ line: 15, message: 'Undefined control sequence', rawText: '\\error{syntax}' }],
        durationMs: 420
      };
    }

    // Generate a minimal mock valid PDF data URI
    const mockPdfBase64 = 'JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwgL0xlbmd0aCA1OSAvRmlsdGVyIC9GbGF0ZURlY29kZSA+PgpzdHJlYW0KeJwrzkjNycnPczNQMFRwzslMzStWUDDkMgQAJRsF6QplbmRzdHJlYW0KZW5kb2JqCnRyYWlsZXIKPDwgL1Jvb3QgMSAwIFIgL1NpemUgNSA+PgpzdGFydHhyZWYKMTgyCiUlRU9G';
    return {
      success: true,
      pdfPath: `build/${documentId}.pdf`,
      pdfDataUri: `data:application/pdf;base64,${mockPdfBase64}`,
      logOutput: `Output written on ${documentId}.pdf (1 page, 4028 bytes).\nTranscript written on ${documentId}.log.`,
      errors: [],
      durationMs: 380
    };
  }
}

export class CompilationService {
  private compilations = new Map<string, Compilation[]>();

  constructor(
    private documentService: DocumentService,
    private adapter: ILaTeXCompilerAdapter = new MockCompilerAdapter()
  ) {}

  async detectInstalledCompilers(): Promise<CompilerInfo[]> {
    return this.adapter.detectCompilers();
  }

  async compileDocument(
    documentId: string,
    engine: CompilerEngine = 'pdflatex'
  ): Promise<Compilation> {
    const doc = this.documentService.getDocument(documentId);
    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }

    const startTime = performance.now();
    const result = await this.adapter.compileLaTeX(documentId, doc.latexContent, engine);
    const durationMs = Math.round(performance.now() - startTime);

    const compilation: Compilation = {
      id: generateId(),
      documentId,
      compiler: engine,
      status: result.success ? 'SUCCESS' : 'ERROR',
      pdfPath: result.pdfPath || result.pdfDataUri,
      logOutput: result.logOutput,
      errors: result.errors,
      compiledAt: new Date().toISOString(),
      durationMs
    };

    const history = this.compilations.get(documentId) ?? [];
    history.push(compilation);
    this.compilations.set(documentId, history);

    return compilation;
  }

  getCompilationHistory(documentId: string): Compilation[] {
    return this.compilations.get(documentId) ?? [];
  }

  getLatestCompilation(documentId: string): Compilation | undefined {
    const history = this.compilations.get(documentId);
    return history && history.length > 0 ? history[history.length - 1] : undefined;
  }
}
