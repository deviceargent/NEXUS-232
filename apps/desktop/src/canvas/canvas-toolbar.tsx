import React, { useState } from 'react';
import { useNexus } from '../app/context.js';
import { useUIStore } from '../app/store.js';
import { TheoryNodeType, TheoryStatus } from '@nexus/core';
import { Button, Input, Badge } from '@nexus/ui';
import {
  Plus,
  Search,
  Maximize2,
  Crosshair,
  Filter,
  Lock,
  Unlock,
  AlertTriangle
} from 'lucide-react';

export const CanvasToolbar: React.FC<{
  onFitView: () => void;
  onCenterSelected: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
}> = ({
  onFitView,
  onCenterSelected,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}) => {
  const { theoryService, graphService, syncState } = useNexus();
  const { selectedNodeId, setSelectedNodeId } = useUIStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<TheoryNodeType>('HypothesisNode');

  const selectedNode = selectedNodeId ? graphService.getNode(selectedNodeId) : null;

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const node = theoryService.createNode(newType, newTitle, newContent);
    syncState();
    setSelectedNodeId(node.id);
    setShowAddModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleToggleFreeze = () => {
    if (!selectedNodeId) return;
    if (selectedNode?.isFrozen) {
      theoryService.unfreezeBranch(selectedNodeId);
    } else {
      theoryService.freezeBranch(selectedNodeId);
    }
    syncState();
  };

  return (
    <>
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Left Toolbar */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[var(--nexus-surface)]/90 backdrop-blur-md p-1.5 rounded border border-[var(--nexus-border)] shadow-md">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="gap-1 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Nodo</span>
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2 text-[var(--nexus-text-dim)]" />
            <input
              type="text"
              placeholder="Buscar nodos o alias..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-[var(--nexus-surface-2)] text-xs font-mono text-[var(--nexus-text)] rounded pl-7 pr-2 py-1 w-44 border border-[var(--nexus-border)] focus:outline-none focus:border-[var(--nexus-accent)]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs font-mono text-[var(--nexus-text-muted)] border-l border-[var(--nexus-border)] pl-2">
            <Filter className="w-3 h-3 text-[var(--nexus-text-dim)]" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-[var(--nexus-surface-2)] text-[11px] font-mono text-[var(--nexus-text)] rounded px-1.5 py-1 border border-[var(--nexus-border)] focus:outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="VALID">VALID</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="UNDETERMINED">UNDETERMINED</option>
              <option value="INVALID">INVALID</option>
            </select>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[var(--nexus-surface)]/90 backdrop-blur-md p-1.5 rounded border border-[var(--nexus-border)] shadow-md">
          {selectedNode && (
            <Button
              size="sm"
              variant={selectedNode.isFrozen ? 'danger' : 'outline'}
              onClick={handleToggleFreeze}
              title={selectedNode.isFrozen ? 'Descongelar rama' : 'Congelar rama teórica'}
            >
              {selectedNode.isFrozen ? (
                <>
                  <Unlock className="w-3 h-3 mr-1" /> Descongelar
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" /> Congelar Rama
                </>
              )}
            </Button>
          )}

          <Button size="icon" variant="secondary" onClick={onCenterSelected} title="Centrar nodo seleccionado">
            <Crosshair className="w-3.5 h-3.5" />
          </Button>

          <Button size="icon" variant="secondary" onClick={onFitView} title="Ajustar vista">
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Add Node Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[var(--nexus-surface)] border border-[var(--nexus-border)] rounded-md shadow-2xl p-4 font-mono">
            <div className="flex items-center justify-between border-b border-[var(--nexus-border)] pb-2 mb-3">
              <span className="text-xs font-bold text-[var(--nexus-accent)]">NUEVO NODO TEÓRICO</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[var(--nexus-text-dim)] hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3">
              <div>
                <label className="text-[11px] text-[var(--nexus-text-muted)] block mb-1">Tipo de Nodo</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TheoryNodeType)}
                  className="w-full bg-[var(--nexus-surface-2)] text-xs text-[var(--nexus-text)] rounded border border-[var(--nexus-border)] p-1.5 focus:outline-none focus:border-[var(--nexus-accent)]"
                >
                  <option value="HypothesisNode">HypothesisNode (Hipótesis)</option>
                  <option value="DerivationNode">DerivationNode (Derivación)</option>
                  <option value="EvidenceNode">EvidenceNode (Evidencia)</option>
                  <option value="QuestionNode">QuestionNode (Pregunta / Problema)</option>
                  <option value="BlockedNode">BlockedNode (Bloqueado / Obstáculo)</option>
                  <option value="EquationNode">EquationNode (Ecuación formal)</option>
                  <option value="ExperimentNode">ExperimentNode (Experimento)</option>
                  <option value="SimulationNode">SimulationNode (Simulación)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[var(--nexus-text-muted)] block mb-1">Título</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ej. Perturbación del campo escalar..."
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] text-[var(--nexus-text-muted)] block mb-1">Contenido / Formulación</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Escriba la deducción, argumentos o condiciones..."
                  className="w-full h-24 bg-[var(--nexus-surface-2)] text-xs text-[var(--nexus-text)] rounded border border-[var(--nexus-border)] p-2 focus:outline-none focus:border-[var(--nexus-accent)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--nexus-border)]">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Crear en Grafo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
