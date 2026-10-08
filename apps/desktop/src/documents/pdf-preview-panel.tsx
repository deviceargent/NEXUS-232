import React, { useState } from 'react';
import { useNexus } from '../app/context.js';
import { useUIStore } from '../app/store.js';
import { Button } from '@nexus/ui';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Layers
} from 'lucide-react';

export const PdfPreviewPanel: React.FC = () => {
  const { documents, compilationService } = useNexus();
  const { updateLayout } = useUIStore();

  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  const activeDoc = documents[0];
  const latestCompilation = activeDoc ? compilationService.getLatestCompilation(activeDoc.id) : undefined;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <div className="h-full flex flex-col bg-[#0b0f14] font-mono text-xs overflow-hidden select-none">
      {/* PDF Controls Header */}
      <div className="p-2 border-b border-[var(--nexus-border)] bg-[var(--nexus-surface)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-400" />
          <span className="font-semibold text-[var(--nexus-text)]">
            {activeDoc?.title || 'Documento'}.pdf
          </span>
          {latestCompilation && (
            <span className="text-[10px] text-[var(--nexus-text-dim)]">
              Compilado con {latestCompilation.compiler} ({latestCompilation.durationMs}ms)
            </span>
          )}
        </div>

        {/* Navigation & Zoom */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border-r border-[var(--nexus-border)] pr-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] text-[var(--nexus-text-muted)]">
              Página {currentPage} / {totalPages}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={handleZoomOut} title="Alejar">
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-[10px] text-[var(--nexus-text-muted)] w-8 text-center">
              {zoom}%
            </span>
            <Button size="icon" variant="ghost" onClick={handleZoomIn} title="Acercar">
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleResetZoom} title="Restablecer">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => updateLayout({ activeLowerTab: 'latex' })}
            className="text-[10px] gap-1 ml-2"
          >
            <Layers className="w-3 h-3" /> Ver Código LaTeX
          </Button>
        </div>
      </div>

      {/* PDF Document Viewport Surface */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-[#080b0f]">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-100 bg-[#fbfbfb] text-[#111827] w-[620px] min-h-[880px] p-12 shadow-2xl rounded-sm border border-slate-300 font-serif leading-relaxed"
        >
          {/* Rendered Scientific PDF Page Simulation */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
              NEXUS-232: Unified Theoretical Workspace
            </h1>
            <p className="text-xs text-slate-600 font-sans">
              Principal Investigator &mdash; \today
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 text-center mb-1 font-sans">
              Abstract
            </h2>
            <p className="text-xs text-slate-600 text-justify italic leading-normal">
              Formal derivation of gravitational and field perturbation hypotheses. We model anisotropic velocity dispersions resulting from non-local scalar potential perturbations and test compatibility with empirical rotation curve bounds.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-800 text-justify">
            <h3 className="font-bold text-sm text-slate-900 font-sans border-b pb-0.5">
              1. Introduction & Formal Hypotheses
            </h3>
            <p>
              This document records theoretical derivations compiled directly from the NEXUS-232 theory canvas. Each mathematical premise is represented by an epistemic node and validated against circularity and contradiction rules.
            </p>

            <div className="my-3 p-3 bg-slate-50 border border-slate-200 rounded text-center font-mono text-xs">
              {"\\nabla^2 \\psi - \\frac{1}{c^2} \\frac{\\partial^2 \\psi}{\\partial t^2} = 4\\pi G \\rho_{\\text{eff}}"}
            </div>

            <h3 className="font-bold text-sm text-slate-900 font-sans border-b pb-0.5 mt-4">
              2. Observable Consequences of the Perturbation
            </h3>
            <p>
              By evaluating the radial acceleration profile under the perturbed boundary conditions, we arrive at the modified acceleration law:
            </p>

            <div className="my-3 p-3 bg-slate-50 border border-slate-200 rounded text-center font-mono text-xs">
              {"a = \\frac{a_N}{1 - \\exp(-\\sqrt{a_N / a_0})}"}
            </div>

            <p>
              Equation (2) establishes a continuous transition between Newtonian dynamics in the strong-field regime and the empirical asymptotic plateau observed in galactic outskirts.
            </p>
          </div>

          <div className="mt-16 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-sans">
            Página {currentPage} de {totalPages} &bull; NEXUS-232 Scientific PDF Engine
          </div>
        </div>
      </div>
    </div>
  );
};
