import React, { useState } from 'react';
import { useNexus } from '../app/context.js';
import { useUIStore, InspectorTabType } from '../app/store.js';
import { Tabs, Button, Badge, StatusVariant } from '@nexus/ui';
import { TheoryStatus, TheoryNodeType } from '@nexus/core';
import {
  Info,
  Paperclip,
  GitFork,
  History,
  Lock,
  ExternalLink,
  ChevronRight,
  AlertOctagon,
  Trash2,
  FileText
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const {
    graphService,
    theoryService,
    resourceService,
    documentService,
    compilations,
    actions,
    syncState
  } = useNexus();

  const {
    selectedNodeId,
    setSelectedNodeId,
    setSelectedResourceId,
    inspectorTab,
    setInspectorTab,
    updateLayout
  } = useUIStore();

  const node = selectedNodeId ? graphService.getNode(selectedNodeId) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center font-mono text-xs text-[var(--nexus-text-dim)] bg-[var(--nexus-surface)] border-l border-[var(--nexus-border)] select-none">
        <Info className="w-8 h-8 mb-2 opacity-40 text-[var(--nexus-accent)]" />
        <p className="font-semibold text-[var(--nexus-text-muted)]">NINGÚN NODO SELECCIONADO</p>
        <p className="mt-1 text-[11px] max-w-[200px]">
          Haga clic en un nodo del canvas para inspeccionar sus derivaciones, recursos, dependencias e historial.
        </p>
      </div>
    );
  }

  const parents = graphService.getParents(node.id);
  const dependencies = graphService.getDependencies(node.id);
  const consequences = graphService.getConsequences(node.id);
  const attachedResources = resourceService.getResourcesForNode(node.id);
  const linkedFragments = documentService.getFragmentsForNode(node.id);

  const tabs = [
    { id: 'node', label: 'Nodo', icon: <Info className="w-3 h-3" /> },
    {
      id: 'resources',
      label: 'Recursos',
      icon: <Paperclip className="w-3 h-3" />,
      badge: attachedResources.length
    },
    {
      id: 'dependencies',
      label: 'Relaciones',
      icon: <GitFork className="w-3 h-3" />,
      badge: parents.length + consequences.length
    },
    { id: 'history', label: 'Historial', icon: <History className="w-3 h-3" /> }
  ];

  const handleStartEdit = () => {
    setEditTitle(node.title);
    setEditContent(node.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    theoryService.updateNode(node.id, {
      title: editTitle,
      content: editContent
    });
    syncState();
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: TheoryStatus) => {
    theoryService.setNodeStatus(node.id, newStatus);
    syncState();
  };

  const handleDeleteNode = () => {
    if (confirm(`¿Eliminar nodo ${node.alias} (${node.title})?`)) {
      theoryService.deleteNode(node.id);
      setSelectedNodeId(null);
      syncState();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--nexus-surface)] border-l border-[var(--nexus-border)] font-mono text-xs overflow-hidden select-none">
      {/* Inspector Header */}
      <div className="p-3 border-b border-[var(--nexus-border)] bg-[var(--nexus-surface-2)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-[var(--nexus-accent)] tracking-tight">
            {node.alias}
          </span>
          <Badge status={node.status as StatusVariant}>{node.status}</Badge>
          {node.isFrozen && (
            <Badge status="DEFAULT" className="text-cyan-400 border-cyan-800">
              <Lock className="w-2.5 h-2.5 mr-0.5" /> FROZEN
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button size="icon" variant="danger" onClick={handleDeleteNode} title="Eliminar nodo">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        items={tabs}
        activeId={inspectorTab}
        onChange={(id) => setInspectorTab(id as InspectorTabType)}
      />

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* TAB 1: NODE */}
        {inspectorTab === 'node' && (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-[var(--nexus-text-dim)] uppercase block mb-1">
                Tipo & Epistemología
              </label>
              <div className="flex items-center justify-between bg-[var(--nexus-bg)] p-2 rounded border border-[var(--nexus-border)]">
                <span className="font-semibold text-[var(--nexus-text)]">{node.type}</span>
                <select
                  value={node.status}
                  onChange={(e) => handleStatusChange(e.target.value as TheoryStatus)}
                  className="bg-[var(--nexus-surface-2)] text-[10px] text-[var(--nexus-text)] rounded px-1.5 py-0.5 border border-[var(--nexus-border)] focus:outline-none"
                >
                  <option value="VALID">VALID</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="UNDETERMINED">UNDETERMINED</option>
                  <option value="INVALID">INVALID</option>
                </select>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-[var(--nexus-text-dim)] uppercase block mb-0.5">Título</label>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[var(--nexus-bg)] text-xs text-[var(--nexus-text)] rounded border border-[var(--nexus-border)] p-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--nexus-text-dim)] uppercase block mb-0.5">Contenido</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-24 bg-[var(--nexus-bg)] text-xs text-[var(--nexus-text)] rounded border border-[var(--nexus-border)] p-1.5 focus:outline-none resize-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" onClick={handleSaveEdit}>Guardar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-[var(--nexus-text-dim)] uppercase">Título & Formulación</label>
                  <button
                    onClick={handleStartEdit}
                    className="text-[10px] text-[var(--nexus-accent)] hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                </div>
                <div className="text-xs font-semibold text-[var(--nexus-text)] mb-1">
                  {node.title}
                </div>
                <div className="bg-[var(--nexus-bg)] text-[11px] text-[var(--nexus-text-muted)] p-2.5 rounded border border-[var(--nexus-border)] whitespace-pre-wrap leading-relaxed">
                  {node.content}
                </div>
              </div>
            )}

            {node.metadata.equationLatex && (
              <div>
                <label className="text-[10px] text-[var(--nexus-text-dim)] uppercase block mb-1">Ecuación LaTeX</label>
                <div className="bg-[var(--nexus-bg)] p-2 rounded border border-[var(--nexus-border)] text-cyan-300 text-[11px]">
                  {node.metadata.equationLatex}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[var(--nexus-border)] text-[10px] text-[var(--nexus-text-dim)] space-y-1">
              <div>Creado: {new Date(node.createdAt).toLocaleString()}</div>
              <div>Actualizado: {new Date(node.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* TAB 2: RESOURCES */}
        {inspectorTab === 'resources' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--nexus-text-dim)] uppercase">Evidencia & Recursos ({attachedResources.length})</span>
            </div>

            {attachedResources.length === 0 ? (
              <div className="text-center py-6 text-[var(--nexus-text-dim)] text-[11px]">
                No hay recursos asociados aún.
              </div>
            ) : (
              <div className="space-y-2">
                {attachedResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-2 rounded bg-[var(--nexus-bg)] border border-[var(--nexus-border)] hover:border-[var(--nexus-accent)] transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedResourceId(res.id);
                      updateLayout({ activeLowerTab: res.type === '3DModel' ? 'viewer3d' : 'resources' });
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[var(--nexus-accent)] uppercase">{res.type}</span>
                      <ExternalLink className="w-3 h-3 text-[var(--nexus-text-dim)]" />
                    </div>
                    <div className="font-semibold text-xs text-[var(--nexus-text)]">{res.title}</div>
                    {res.anchors.length > 0 && (
                      <div className="mt-1 text-[10px] text-[var(--nexus-text-dim)]">
                        Anchors: {res.anchors.map((a) => a.label).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {linkedFragments.length > 0 && (
              <div className="pt-3 border-t border-[var(--nexus-border)]">
                <span className="text-[10px] text-[var(--nexus-text-dim)] uppercase block mb-1.5">
                  Fragmentos LaTeX Vinculados ({linkedFragments.length})
                </span>
                <div className="space-y-1.5">
                  {linkedFragments.map((frag) => (
                    <div
                      key={frag.id}
                      className="p-2 rounded bg-[var(--nexus-bg)] border border-[var(--nexus-border)]"
                    >
                      <div className="text-[10px] font-bold text-indigo-400">{frag.alias} — {frag.title}</div>
                      <div className="text-[10px] font-mono text-[var(--nexus-text-dim)] mt-0.5 truncate">
                        Líneas {frag.startLine}-{frag.endLine}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEPENDENCIES */}
        {inspectorTab === 'dependencies' && (
          <div className="space-y-4">
            {/* Parents */}
            <div>
              <span className="text-[10px] text-[var(--nexus-text-dim)] uppercase block mb-1">
                Padres / Premisas ({parents.length})
              </span>
              {parents.length === 0 ? (
                <div className="text-[11px] text-[var(--nexus-text-dim)] italic">Premisa raíz fundamental</div>
              ) : (
                <div className="space-y-1">
                  {parents.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedNodeId(p.id)}
                      className="flex items-center justify-between p-1.5 rounded bg-[var(--nexus-bg)] border border-[var(--nexus-border)] hover:border-[var(--nexus-accent)] cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-[var(--nexus-accent)]">{p.alias}</span>
                        <span className="truncate text-[11px]">{p.title}</span>
                      </div>
                      <Badge status={p.status as StatusVariant}>{p.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Consequences */}
            <div>
              <span className="text-[10px] text-[var(--nexus-text-dim)] uppercase block mb-1">
                Consecuencias Derivadas ({consequences.length})
              </span>
              {consequences.length === 0 ? (
                <div className="text-[11px] text-[var(--nexus-text-dim)] italic">No hay consecuencias aún</div>
              ) : (
                <div className="space-y-1">
                  {consequences.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedNodeId(c.id)}
                      className="flex items-center justify-between p-1.5 rounded bg-[var(--nexus-bg)] border border-[var(--nexus-border)] hover:border-[var(--nexus-accent)] cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-[var(--nexus-accent)]">{c.alias}</span>
                        <span className="truncate text-[11px]">{c.title}</span>
                      </div>
                      <Badge status={c.status as StatusVariant}>{c.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: HISTORY */}
        {inspectorTab === 'history' && (
          <div className="space-y-2">
            <span className="text-[10px] text-[var(--nexus-text-dim)] uppercase block mb-1">
              Registro de Operaciones
            </span>
            {actions.length === 0 ? (
              <div className="text-[11px] text-[var(--nexus-text-dim)] italic">Sin acciones registradas</div>
            ) : (
              actions.slice().reverse().map((act) => (
                <div
                  key={act.id}
                  className="p-2 rounded bg-[var(--nexus-bg)] border border-[var(--nexus-border)] space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[var(--nexus-accent)]">{act.type}</span>
                    <span className="text-[var(--nexus-text-dim)]">{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-[10px] text-[var(--nexus-text-muted)] truncate">
                    {JSON.stringify(act.parameters)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
