import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useNexus } from '../app/context.js';
import { useUIStore } from '../app/store.js';
import { Button, Badge } from '@nexus/ui';
import { CompilerEngine } from '@nexus/core';
import {
  Play,
  FileCode,
  CheckCircle,
  AlertTriangle,
  Layers,
  ChevronDown,
  Terminal,
  Loader2
} from 'lucide-react';

export const LatexEditorPanel: React.FC = () => {
  const {
    documents,
    compilations,
    documentService,
    compilationService,
    graphService,
    syncState
  } = useNexus();

  const {
    isCompiling,
    setIsCompiling,
    selectedNodeId,
    setSelectedNodeId,
    updateLayout
  } = useUIStore();

  const activeDoc = documents[0];
  const [engine, setEngine] = useState<CompilerEngine>('pdflatex');
  const [showLog, setShowLog] = useState(false);
  const [compilersInfo, setCompilersInfo] = useState<any[]>([]);

  useEffect(() => {
    compilationService.detectInstalledCompilers().then(setCompilersInfo);
  }, [compilationService]);

  const latestCompilation = activeDoc ? compilationService.getLatestCompilation(activeDoc.id) : undefined;

  const handleEditorChange = (value: string | undefined) => {
    if (!activeDoc || value === undefined) return;
    documentService.updateDocumentContent(activeDoc.id, value);
  };

  const handleCompile = async () => {
    if (!activeDoc || isCompiling) return;
    setIsCompiling(true);

    try {
      const result = await compilationService.compileDocument(activeDoc.id, engine);
      syncState();
      if (result.status === 'SUCCESS') {
        // Automatically switch lower workspace tab to PDF preview!
        updateLayout({ activeLowerTab: 'pdf' });
      } else {
        setShowLog(true);
      }
    } catch (err: any) {
      alert(`Error en compilación: ${err.message || err}`);
    } finally {
      setIsCompiling(false);
    }
  };

  if (!activeDoc) {
    return (
      <div className="h-full flex items-center justify-center font-mono text-xs text-[var(--nexus-text-dim)]">
        No hay documento LaTeX activo en el proyecto.
      </div>
    );
  }

  const activeCompiler = compilersInfo.find((c) => c.engine === engine);

  return (
    <div className="h-full flex flex-col bg-[var(--nexus-bg)] font-mono text-xs overflow-hidden select-none">
      {/* Editor Toolbar */}
      <div className="p-2 border-b border-[var(--nexus-border)] bg-[var(--nexus-surface)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[var(--nexus-text)] font-semibold">
            <FileCode className="w-3.5 h-3.5 text-sky-400" />
            <span>{activeDoc.title}</span>
          </div>

          {/* Compiler engine selector */}
          <div className="flex items-center gap-1 border-l border-[var(--nexus-border)] pl-2">
            <span className="text-[10px] text-[var(--nexus-text-dim)]">Compilador:</span>
            <select
              value={engine}
              onChange={(e) => setEngine(e.target.value as CompilerEngine)}
              className="bg-[var(--nexus-surface-2)] text-[10px] text-[var(--nexus-text)] rounded px-1.5 py-0.5 border border-[var(--nexus-border)] focus:outline-none"
            >
              <option value="pdflatex">pdflatex (MiKTeX)</option>
              <option value="xelatex">xelatex</option>
              <option value="lualatex">lualatex</option>
              <option value="tectonic">tectonic</option>
            </select>

            {activeCompiler && (
              <Badge status={activeCompiler.isAvailable ? 'VALID' : 'BLOCKED'}>
                {activeCompiler.status}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {latestCompilation && (
            <div className="flex items-center gap-1 text-[10px] text-[var(--nexus-text-muted)]">
              {latestCompilation.status === 'SUCCESS' ? (
                <span className="flex items-center gap-1 text-[var(--nexus-valid)]">
                  <CheckCircle className="w-3 h-3" /> PDF Compilado ({latestCompilation.durationMs}ms)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[var(--nexus-blocked)]">
                  <AlertTriangle className="w-3 h-3" /> Error ({latestCompilation.errors.length} fallos)
                </span>
              )}
            </div>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowLog(!showLog)}
            className="text-[10px] gap-1"
          >
            <Terminal className="w-3 h-3" /> Log
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleCompile}
            disabled={isCompiling}
            className="gap-1 font-semibold"
          >
            {isCompiling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Compilando...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Compilar PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor & Fragments Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Monaco Editor */}
        <div className="flex-1 h-full">
          <Editor
            height="100%"
            defaultLanguage="latex"
            theme="vs-dark"
            value={activeDoc.latexContent}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on'
            }}
          />
        </div>

        {/* Document Fragments Navigation Sidebar */}
        {activeDoc.fragments.length > 0 && (
          <div className="w-56 border-l border-[var(--nexus-border)] bg-[var(--nexus-surface)] p-2 overflow-y-auto space-y-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--nexus-text-dim)] uppercase">
              <Layers className="w-3 h-3 text-[var(--nexus-accent)]" />
              <span>Fragmentos Vinculados ({activeDoc.fragments.length})</span>
            </div>

            <div className="space-y-1.5">
              {activeDoc.fragments.map((frag) => (
                <div
                  key={frag.id}
                  className="p-1.5 rounded bg-[var(--nexus-surface-2)] border border-[var(--nexus-border)] hover:border-[var(--nexus-accent)] transition-all cursor-pointer"
                  onClick={() => {
                    if (frag.sourceNodeIds.length > 0) {
                      setSelectedNodeId(frag.sourceNodeIds[0]);
                    }
                  }}
                >
                  <div className="text-[10px] font-bold text-[var(--nexus-accent)]">{frag.alias}</div>
                  <div className="text-[11px] font-medium text-[var(--nexus-text)] truncate">{frag.title}</div>
                  <div className="text-[9px] text-[var(--nexus-text-dim)] mt-0.5">
                    Líneas: {frag.startLine}-{frag.endLine}
                  </div>
                  {frag.sourceNodeIds.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {frag.sourceNodeIds.map((nid) => {
                        const n = graphService.getNode(nid);
                        return n ? (
                          <span
                            key={nid}
                            className="text-[9px] px-1 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800"
                          >
                            {n.alias}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compiler Log Drawer */}
      {showLog && latestCompilation && (
        <div className="h-32 border-t border-[var(--nexus-border)] bg-[#070a0e] p-2 flex flex-col font-mono text-[10px]">
          <div className="flex items-center justify-between pb-1 border-b border-[var(--nexus-border)] mb-1">
            <span className="font-bold text-[var(--nexus-accent)]">SALIDA DE CONSOLA DEL COMPILADOR ({latestCompilation.compiler})</span>
            <button onClick={() => setShowLog(false)} className="text-[var(--nexus-text-dim)] hover:text-white cursor-pointer">✕</button>
          </div>
          <pre className="flex-1 overflow-y-auto text-[var(--nexus-text-muted)] whitespace-pre-wrap">
            {latestCompilation.logOutput}
          </pre>
        </div>
      )}
    </div>
  );
};
