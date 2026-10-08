import React from 'react';
import { Allotment } from 'allotment';
import { useUIStore } from '../app/store.js';
import { ChatPanel } from '../chat/chat-panel.js';
import { TheoryCanvas } from '../canvas/theory-canvas.js';
import { InspectorPanel } from '../inspector/inspector-panel.js';
import { LowerWorkspace } from './lower-workspace.js';
import { TopBar } from '../shell/top-bar.js';
import { Sidebar } from '../shell/sidebar.js';
import { StatusBar } from '../shell/status-bar.js';

export const MainLayout: React.FC = () => {
  const { layout, updateLayout } = useUIStore();

  const maximized = layout.maximizedPanel;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--nexus-bg)] text-[var(--nexus-text)] font-mono">
      {/* Top Bar */}
      <TopBar />

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Central Workspace with Resizable Allotment Splits */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* If a panel is maximized, render only that panel */}
          {maximized === 'chat' && <ChatPanel />}
          {maximized === 'canvas' && <TheoryCanvas />}
          {maximized === 'inspector' && <InspectorPanel />}
          {maximized === 'lower' && <LowerWorkspace />}

          {!maximized && (
            <Allotment
              vertical
              defaultSizes={layout.verticalSplitSizes}
              onChange={(sizes) => updateLayout({ verticalSplitSizes: sizes })}
            >
              {/* Upper Section: Chat | Canvas | Inspector */}
              <Allotment.Pane minSize={250}>
                <Allotment
                  defaultSizes={layout.horizontalSplitSizes}
                  onChange={(sizes) => updateLayout({ horizontalSplitSizes: sizes })}
                >
                  {/* Panel 1: Chat */}
                  {!layout.chatCollapsed && (
                    <Allotment.Pane minSize={220} preferredSize={300} maxSize={500}>
                      <ChatPanel />
                    </Allotment.Pane>
                  )}

                  {/* Panel 2: Theory Canvas */}
                  <Allotment.Pane minSize={300}>
                    <TheoryCanvas />
                  </Allotment.Pane>

                  {/* Panel 3: Inspector */}
                  {!layout.inspectorCollapsed && (
                    <Allotment.Pane minSize={240} preferredSize={320} maxSize={550}>
                      <InspectorPanel />
                    </Allotment.Pane>
                  )}
                </Allotment>
              </Allotment.Pane>

              {/* Lower Section: Lower Workspace */}
              {!layout.lowerWorkspaceCollapsed && (
                <Allotment.Pane minSize={160} preferredSize={280}>
                  <LowerWorkspace />
                </Allotment.Pane>
              )}
            </Allotment>
          )}
        </main>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
};
