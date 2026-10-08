import React from 'react';
import { useUIStore } from '../app/store.js';
import { LatexEditorPanel } from '../documents/latex-editor-panel.js';
import { PdfPreviewPanel } from '../documents/pdf-preview-panel.js';
import { ResourceViewerPanel } from '../resources/resource-viewer-panel.js';
import { Viewer3DPanel } from '../viewer3d/viewer-3d-panel.js';
import { Tabs } from '@nexus/ui';
import { FileCode, FileText, Paperclip, Box, Maximize2, Minimize2, X } from 'lucide-react';

export const LowerWorkspace: React.FC = () => {
  const { layout, updateLayout, toggleMaximizePanel } = useUIStore();

  const isMaximized = layout.maximizedPanel === 'lower';

  const tabs = [
    { id: 'latex', label: 'LaTeX Editor', icon: <FileCode className="w-3.5 h-3.5" /> },
    { id: 'pdf', label: 'PDF Preview', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'resources', label: 'Evidencia & Media', icon: <Paperclip className="w-3.5 h-3.5" /> },
    { id: 'viewer3d', label: 'Visor 3D', icon: <Box className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--nexus-surface)] border-t border-[var(--nexus-border)] overflow-hidden font-mono">
      {/* Lower Workspace Tab Bar */}
      <div className="flex items-center justify-between border-b border-[var(--nexus-border)] bg-[var(--nexus-surface-2)] pr-2">
        <Tabs
          items={tabs}
          activeId={layout.activeLowerTab}
          onChange={(id) => updateLayout({ activeLowerTab: id as any })}
          className="bg-transparent border-none"
        />

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleMaximizePanel('lower')}
            className="p-1 text-[var(--nexus-text-dim)] hover:text-white rounded hover:bg-[var(--nexus-surface)] cursor-pointer"
            title={isMaximized ? 'Restaurar panel' : 'Maximizar panel'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => updateLayout({ lowerWorkspaceCollapsed: true })}
            className="p-1 text-[var(--nexus-text-dim)] hover:text-white rounded hover:bg-[var(--nexus-surface)] cursor-pointer"
            title="Ocultar espacio inferior"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Tab Panel */}
      <div className="flex-1 overflow-hidden">
        {layout.activeLowerTab === 'latex' && <LatexEditorPanel />}
        {layout.activeLowerTab === 'pdf' && <PdfPreviewPanel />}
        {layout.activeLowerTab === 'resources' && <ResourceViewerPanel />}
        {layout.activeLowerTab === 'viewer3d' && <Viewer3DPanel />}
      </div>
    </div>
  );
};
