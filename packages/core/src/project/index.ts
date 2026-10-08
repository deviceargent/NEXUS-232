/**
 * NEXUS-232 Project, Layout & Agent History Domain Models
 */

import { CompilerEngine } from '../documents/index.js';

export interface WorkspacePanelState {
  chatCollapsed: boolean;
  inspectorCollapsed: boolean;
  lowerWorkspaceCollapsed: boolean;
  maximizedPanel: 'chat' | 'canvas' | 'inspector' | 'lower' | null;
  activeLowerTab: 'latex' | 'pdf' | 'resources' | 'viewer3d';
  activeSidebarItem: 'inicio' | 'chat' | 'tree' | 'docs' | 'refs' | 'media' | 'latex' | 'compile' | 'plugins' | 'config';
  horizontalSplitSizes: number[];
  verticalSplitSizes: number[];
}

export interface ProjectSettings {
  compilerEngine: CompilerEngine;
  compilerExecutablePath?: string;
  defaultAiProvider: string;
  theme: 'dark' | 'light';
  accentColor: string;
  density: 'compact' | 'comfortable';
  uiScale: number;
  autoCompileOnChange: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  settings: ProjectSettings;
  layout: WorkspacePanelState;
}

export type AgentRole = 'user' | 'assistant' | 'system' | 'tool';

export interface ToolCallRecord {
  id: string;
  name: string;
  args: Record<string, unknown>;
  result?: unknown;
  status: 'PENDING' | 'EXECUTING' | 'SUCCESS' | 'ERROR';
  error?: string;
}

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  toolCalls?: ToolCallRecord[];
  referencedNodeIds?: string[];
  referencedResourceIds?: string[];
  timestamp: string;
}

export interface AgentAction {
  id: string;
  type: string;
  parameters: Record<string, unknown>;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  result?: unknown;
  error?: string;
  timestamp: string;
}
