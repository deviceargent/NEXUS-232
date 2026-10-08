import React from 'react';
import { useNexus } from '../app/context.js';
import { GitBranch, Cpu, Activity, ShieldCheck, Check } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { currentProject, nodes, edges, agentPlanner } = useNexus();

  const validCount = nodes.filter((n) => n.status === 'VALID').length;
  const blockedCount = nodes.filter((n) => n.status === 'BLOCKED').length;
  const inReviewCount = nodes.filter((n) => n.status === 'IN_REVIEW').length;

  return (
    <footer className="h-6 bg-[var(--nexus-surface-2)] border-t border-[var(--nexus-border)] flex items-center justify-between px-3 font-mono text-[10px] text-[var(--nexus-text-muted)] select-none z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[var(--nexus-text)]">
          <Activity className="w-3 h-3 text-[var(--nexus-accent)]" />
          <span>WORKSPACE ACTIVO</span>
        </div>

        <div className="flex items-center gap-2 border-l border-[var(--nexus-border)] pl-3">
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-sky-400" />
            <strong>{nodes.length}</strong> Nodos
          </span>
          <span className="text-[var(--nexus-text-dim)]">&bull;</span>
          <span>
            <strong>{edges.length}</strong> Aristas
          </span>
        </div>

        <div className="flex items-center gap-2 border-l border-[var(--nexus-border)] pl-3">
          <span className="text-[var(--nexus-valid)] flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3" /> {validCount} VÁLIDOS
          </span>
          {inReviewCount > 0 && (
            <span className="text-[var(--nexus-in-review)] font-semibold">
              &bull; {inReviewCount} EN REVISIÓN
            </span>
          )}
          {blockedCount > 0 && (
            <span className="text-[var(--nexus-blocked)] font-bold">
              &bull; {blockedCount} BLOQUEADOS ⛔
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-[var(--nexus-accent)]" />
          <span>Compiler: <strong>pdflatex (MiKTeX 4.23)</strong></span>
        </div>

        <div className="flex items-center gap-1 border-l border-[var(--nexus-border)] pl-3">
          <span>AI Engine: <strong>{agentPlanner.getActiveProvider().name}</strong></span>
        </div>

        <div className="border-l border-[var(--nexus-border)] pl-3 text-[var(--nexus-valid)] flex items-center gap-1">
          <Check className="w-3 h-3" /> Sincronizado
        </div>
      </div>
    </footer>
  );
};
