import React, { useState } from 'react';
import { useNexus } from '../app/context.js';
import { useUIStore } from '../app/store.js';
import { Button, Badge } from '@nexus/ui';
import {
  Atom,
  Search,
  FolderOpen,
  Save,
  RotateCcw,
  LayoutGrid,
  SidebarClose,
  PanelBottom,
  Plus
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { currentProject, saveCurrentProject, createProject } = useNexus();
  const { layout, updateLayout, restoreLayout } = useUIStore();
  const [isSaving, setIsSaving] = useState(false);
  const [showNewProj, setShowNewProj] = useState(false);
  const [projName, setProjName] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    await saveCurrentProject();
    setTimeout(() => setIsSaving(false), 400);
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    await createProject(projName);
    setShowNewProj(false);
    setProjName('');
  };

  return (
    <header className="h-10 bg-[var(--nexus-surface)] border-b border-[var(--nexus-border)] flex items-center justify-between px-3 select-none font-mono text-xs z-20">
      {/* Brand & Category Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-[var(--nexus-accent)] font-bold tracking-wider">
          <Atom className="w-5 h-5 animate-pulse text-[var(--nexus-accent)]" />
          <span className="text-sm">NEXUS-232</span>
        </div>

        <div className="h-4 w-px bg-[var(--nexus-border)]" />

        <nav className="flex items-center gap-3 text-[11px] text-[var(--nexus-text-muted)]">
          <button className="hover:text-[var(--nexus-accent)] transition-colors cursor-pointer">
            Ideas
          </button>
          <span className="text-[var(--nexus-text-dim)]">/</span>
          <button className="hover:text-[var(--nexus-accent)] transition-colors cursor-pointer">
            Evidencia
          </button>
          <span className="text-[var(--nexus-text-dim)]">/</span>
          <button className="text-[var(--nexus-accent)] font-semibold cursor-pointer">
            Teoría
          </button>
        </nav>
      </div>

      {/* Middle: Active Project Pill */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--nexus-surface-2)] border border-[var(--nexus-border)] text-xs text-[var(--nexus-text)]">
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold truncate max-w-[280px]">
            {currentProject?.name || 'Workspace Activo'}
          </span>
          <button
            onClick={() => setShowNewProj(true)}
            className="ml-1 text-[var(--nexus-text-dim)] hover:text-white cursor-pointer"
            title="Nuevo Proyecto"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Right: Layout Controls & Save */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border-r border-[var(--nexus-border)] pr-2">
          <Button
            size="icon"
            variant={layout.chatCollapsed ? 'outline' : 'ghost'}
            onClick={() => updateLayout({ chatCollapsed: !layout.chatCollapsed })}
            title="Mostrar / Ocultar Chat"
          >
            <SidebarClose className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="icon"
            variant={layout.lowerWorkspaceCollapsed ? 'outline' : 'ghost'}
            onClick={() => updateLayout({ lowerWorkspaceCollapsed: !layout.lowerWorkspaceCollapsed })}
            title="Mostrar / Ocultar Espacio Inferior"
          >
            <PanelBottom className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={restoreLayout}
            title="Restaurar Layout de Paneles"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          className="gap-1 font-semibold text-[11px]"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
        </Button>
      </div>

      {/* New Project Modal */}
      {showNewProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-[var(--nexus-surface)] border border-[var(--nexus-border)] rounded p-4 font-mono">
            <h3 className="font-bold text-xs text-[var(--nexus-accent)] mb-2">CREAR NUEVO PROYECTO CIENTÍFICO</h3>
            <form onSubmit={handleCreateNew} className="space-y-3">
              <input
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                placeholder="Nombre del proyecto..."
                className="w-full bg-[var(--nexus-surface-2)] text-xs text-[var(--nexus-text)] p-2 rounded border border-[var(--nexus-border)] focus:outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewProj(false)}>Cancelar</Button>
                <Button type="submit" variant="primary" size="sm">Crear</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
