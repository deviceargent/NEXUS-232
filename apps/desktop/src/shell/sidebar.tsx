import React from 'react';
import { useUIStore } from '../app/store.js';
import { useNexus } from '../app/context.js';
import {
  Home,
  MessageSquare,
  Network,
  FileText,
  Bookmark,
  Film,
  FileCode,
  Cpu,
  Boxes,
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeSidebarItem, setActiveSidebarItem, updateLayout, layout } = useUIStore();
  const { compilationService, documents, syncState } = useNexus();

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: () => updateLayout({ chatCollapsed: false })
    },
    { id: 'tree', label: 'Árbol', icon: <Network className="w-4 h-4" /> },
    {
      id: 'docs',
      label: 'Docs',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => updateLayout({ lowerWorkspaceCollapsed: false, activeLowerTab: 'pdf' })
    },
    {
      id: 'refs',
      label: 'Refs',
      icon: <Bookmark className="w-4 h-4" />,
      onClick: () => updateLayout({ lowerWorkspaceCollapsed: false, activeLowerTab: 'resources' })
    },
    {
      id: 'media',
      label: 'Medios',
      icon: <Film className="w-4 h-4" />,
      onClick: () => updateLayout({ lowerWorkspaceCollapsed: false, activeLowerTab: 'resources' })
    },
    {
      id: 'latex',
      label: 'LaTeX',
      icon: <FileCode className="w-4 h-4" />,
      onClick: () => updateLayout({ lowerWorkspaceCollapsed: false, activeLowerTab: 'latex' })
    },
    {
      id: 'compile',
      label: 'Compilar',
      icon: <Cpu className="w-4 h-4" />,
      onClick: async () => {
        const doc = documents[0];
        if (doc) {
          updateLayout({ lowerWorkspaceCollapsed: false, activeLowerTab: 'latex' });
          await compilationService.compileDocument(doc.id);
          syncState();
        }
      }
    },
    { id: 'plugins', label: 'Plugins', icon: <Boxes className="w-4 h-4" /> },
    { id: 'config', label: 'Config', icon: <Settings className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-14 bg-[var(--nexus-surface)] border-r border-[var(--nexus-border)] flex flex-col items-center py-2 select-none z-10 font-mono">
      <div className="flex-1 flex flex-col items-center gap-1 w-full">
        {menuItems.map((item) => {
          const isActive = activeSidebarItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSidebarItem(item.id);
                if (item.onClick) item.onClick();
              }}
              title={item.label}
              className={`w-10 h-10 rounded flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--nexus-accent-subtle)] text-[var(--nexus-accent)] border border-[var(--nexus-accent)]/50'
                  : 'text-[var(--nexus-text-muted)] hover:text-white hover:bg-[var(--nexus-surface-2)]'
              }`}
            >
              {item.icon}
              <span className="text-[8px] tracking-tighter leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
