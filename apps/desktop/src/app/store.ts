/**
 * NEXUS-232 Presentation State Store (Zustand 5.0)
 * 
 * Strict separation: holds ONLY presentation/interaction state.
 * Scientific domain entities live in Application Services & SQLite.
 */

import { create } from 'zustand';
import { WorkspacePanelState } from '@nexus/core';
import { DEFAULT_LAYOUT } from '@nexus/application';

export type InspectorTabType = 'node' | 'resources' | 'dependencies' | 'history';

interface UIState {
  // Selection
  selectedNodeId: string | null;
  selectedResourceId: string | null;
  selectedFragmentId: string | null;

  // Viewport & Navigation
  activeSidebarItem: string;
  inspectorTab: InspectorTabType;

  // Chat interaction
  chatInput: string;
  isStreaming: boolean;

  // Compiler state
  isCompiling: boolean;

  // Resizable layout state
  layout: WorkspacePanelState;

  // Actions
  setSelectedNodeId: (id: string | null) => void;
  setSelectedResourceId: (id: string | null) => void;
  setSelectedFragmentId: (id: string | null) => void;
  setActiveSidebarItem: (item: string) => void;
  setInspectorTab: (tab: InspectorTabType) => void;
  setChatInput: (input: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsCompiling: (isCompiling: boolean) => void;
  updateLayout: (patch: Partial<WorkspacePanelState>) => void;
  toggleMaximizePanel: (panel: 'chat' | 'canvas' | 'inspector' | 'lower') => void;
  restoreLayout: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedNodeId: null,
  selectedResourceId: null,
  selectedFragmentId: null,
  activeSidebarItem: 'tree',
  inspectorTab: 'node',
  chatInput: '',
  isStreaming: false,
  isCompiling: false,
  layout: { ...DEFAULT_LAYOUT },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setSelectedResourceId: (id) => set({ selectedResourceId: id }),
  setSelectedFragmentId: (id) => set({ selectedFragmentId: id }),
  setActiveSidebarItem: (item) => set({ activeSidebarItem: item }),
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  setChatInput: (input) => set({ chatInput: input }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setIsCompiling: (isCompiling) => set({ isCompiling }),

  updateLayout: (patch) =>
    set((state) => ({
      layout: { ...state.layout, ...patch }
    })),

  toggleMaximizePanel: (panel) =>
    set((state) => ({
      layout: {
        ...state.layout,
        maximizedPanel: state.layout.maximizedPanel === panel ? null : panel
      }
    })),

  restoreLayout: () =>
    set({
      layout: { ...DEFAULT_LAYOUT }
    })
}));
