import React, { useState } from 'react';
import { useNexus } from '../app/context.js';
import { useUIStore } from '../app/store.js';
import { Button, Badge } from '@nexus/ui';
import { MediaPlayer } from '../media/media-player.js';
import { Resource } from '@nexus/core';
import {
  FileText,
  Video,
  Box,
  Database,
  Link,
  Plus,
  Paperclip,
  ExternalLink,
  Play
} from 'lucide-react';

export const ResourceViewerPanel: React.FC = () => {
  const { resources, resourceService, syncState } = useNexus();
  const {
    selectedResourceId,
    setSelectedResourceId,
    selectedNodeId,
    updateLayout
  } = useUIStore();

  const [activeTab, setActiveTab] = useState<'all' | 'pdf' | 'video' | '3d'>('all');

  const selectedRes = resources.find((r) => r.id === selectedResourceId) || resources[0];

  const handleAttachToSelectedNode = (resourceId: string) => {
    if (!selectedNodeId) {
      alert('Seleccione primero un nodo en el canvas para asociar este recurso.');
      return;
    }
    resourceService.attachResourceToNode(selectedNodeId, resourceId);
    syncState();
    alert('Recurso asociado exitosamente al nodo.');
  };

  const filtered = resources.filter((r) => {
    if (activeTab === 'pdf') return r.type === 'PDF';
    if (activeTab === 'video') return r.type === 'Video';
    if (activeTab === '3d') return r.type === '3DModel';
    return true;
  });

  return (
    <div className="h-full flex bg-[var(--nexus-bg)] font-mono text-xs overflow-hidden select-none">
      {/* Resource List Sidebar */}
      <div className="w-64 border-r border-[var(--nexus-border)] bg-[var(--nexus-surface)] flex flex-col">
        <div className="p-2 border-b border-[var(--nexus-border)] flex items-center justify-between">
          <span className="font-bold text-xs text-[var(--nexus-text)]">BIBLIOTECA DE EVIDENCIA</span>
          <Badge status="DEFAULT">{resources.length}</Badge>
        </div>

        {/* Filter Pills */}
        <div className="flex border-b border-[var(--nexus-border)] bg-[var(--nexus-surface-2)] text-[10px] p-1 gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-0.5 rounded cursor-pointer ${activeTab === 'all' ? 'bg-[var(--nexus-accent)] text-black font-semibold' : 'text-[var(--nexus-text-muted)]'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-0.5 rounded cursor-pointer ${activeTab === 'pdf' ? 'bg-[var(--nexus-accent)] text-black font-semibold' : 'text-[var(--nexus-text-muted)]'}`}
          >
            PDF
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-0.5 rounded cursor-pointer ${activeTab === 'video' ? 'bg-[var(--nexus-accent)] text-black font-semibold' : 'text-[var(--nexus-text-muted)]'}`}
          >
            Video
          </button>
          <button
            onClick={() => setActiveTab('3d')}
            className={`flex-1 py-0.5 rounded cursor-pointer ${activeTab === '3d' ? 'bg-[var(--nexus-accent)] text-black font-semibold' : 'text-[var(--nexus-text-muted)]'}`}
          >
            3D
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filtered.map((res) => {
            const isSelected = res.id === selectedRes?.id;
            return (
              <div
                key={res.id}
                onClick={() => setSelectedResourceId(res.id)}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[var(--nexus-accent)] bg-[var(--nexus-accent-subtle)]/40 text-[var(--nexus-accent)] font-semibold'
                    : 'border-[var(--nexus-border)] bg-[var(--nexus-surface-2)] text-[var(--nexus-text)] hover:border-[var(--nexus-border-glow)]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="font-bold opacity-75">{res.type}</span>
                  {res.anchors.length > 0 && <span>⚓ {res.anchors.length}</span>}
                </div>
                <div className="truncate font-sans font-medium text-xs">{res.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Resource Viewer Area */}
      <div className="flex-1 flex flex-col overflow-hidden p-3">
        {selectedRes ? (
          <div className="h-full flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--nexus-border)]">
              <div>
                <h3 className="font-bold text-sm text-[var(--nexus-text)]">{selectedRes.title}</h3>
                <p className="text-[11px] text-[var(--nexus-text-dim)]">URI: {selectedRes.uri}</p>
              </div>

              <div className="flex items-center gap-2">
                {selectedNodeId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAttachToSelectedNode(selectedRes.id)}
                    className="gap-1 text-[10px]"
                  >
                    <Paperclip className="w-3 h-3" /> Asociar al Nodo Seleccionado
                  </Button>
                )}
                {selectedRes.type === '3DModel' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => updateLayout({ activeLowerTab: 'viewer3d' })}
                    className="gap-1 text-[10px]"
                  >
                    <Box className="w-3 h-3" /> Abrir en Visor 3D
                  </Button>
                )}
              </div>
            </div>

            {/* Viewer by type */}
            <div className="flex-1 overflow-hidden">
              {selectedRes.type === 'Video' ? (
                <MediaPlayer
                  uri={selectedRes.uri}
                  title={selectedRes.title}
                  anchors={selectedRes.anchors.filter((a): a is any => a.type === 'VIDEO_TIMESTAMP')}
                />
              ) : selectedRes.type === 'PDF' ? (
                <div className="h-full flex flex-col items-center justify-center bg-[#0e131b] rounded border border-[var(--nexus-border)] p-6 text-center space-y-2">
                  <FileText className="w-12 h-12 text-rose-400 opacity-60" />
                  <p className="font-semibold text-xs text-[var(--nexus-text)]">{selectedRes.title}</p>
                  <p className="text-[11px] text-[var(--nexus-text-dim)]">
                    Documento de referencia disponible en workspace.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateLayout({ activeLowerTab: 'pdf' })}
                  >
                    Abrir en PDF Previewer
                  </Button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-[#0e131b] rounded border border-[var(--nexus-border)] p-6 text-center space-y-2">
                  <Database className="w-12 h-12 text-cyan-400 opacity-60" />
                  <p className="font-semibold text-xs text-[var(--nexus-text)]">{selectedRes.title}</p>
                  <p className="text-[11px] text-[var(--nexus-text-dim)]">
                    Dataset científico / modelo estructurado listo para análisis.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--nexus-text-dim)]">
            Seleccione un recurso para visualizar.
          </div>
        )}
      </div>
    </div>
  );
};
