/**
 * NEXUS-232 Project Service
 */

import {
  Project,
  ProjectSettings,
  WorkspacePanelState,
  generateId
} from '@nexus/core';
import { IPersistenceAdapter, ProjectBundle } from '../persistence/index.js';

export const DEFAULT_LAYOUT: WorkspacePanelState = {
  chatCollapsed: false,
  inspectorCollapsed: false,
  lowerWorkspaceCollapsed: false,
  maximizedPanel: null,
  activeLowerTab: 'latex',
  activeSidebarItem: 'tree',
  horizontalSplitSizes: [280, 720, 360],
  verticalSplitSizes: [620, 280]
};

export const DEFAULT_SETTINGS: ProjectSettings = {
  compilerEngine: 'pdflatex',
  defaultAiProvider: 'openai',
  theme: 'dark',
  accentColor: '#38bdf8', // Cyan / Neon blue
  density: 'compact',
  uiScale: 1.0,
  autoCompileOnChange: false
};

export class ProjectService {
  private currentProject: Project | null = null;

  constructor(private persistence: IPersistenceAdapter) {}

  async createProject(name: string, description = '', customSettings?: Partial<ProjectSettings>): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      id: generateId(),
      name,
      description,
      createdAt: now,
      updatedAt: now,
      settings: { ...DEFAULT_SETTINGS, ...customSettings },
      layout: { ...DEFAULT_LAYOUT }
    };

    const emptyBundle: ProjectBundle = {
      project,
      nodes: [],
      edges: [],
      resources: [],
      documents: [],
      compilations: [],
      messages: [],
      actions: []
    };

    await this.persistence.saveProject(emptyBundle);
    this.currentProject = project;
    return project;
  }

  async loadProject(projectId: string): Promise<ProjectBundle | null> {
    const bundle = await this.persistence.loadProject(projectId);
    if (bundle) {
      this.currentProject = bundle.project;
    }
    return bundle;
  }

  async updateLayout(patch: Partial<WorkspacePanelState>): Promise<WorkspacePanelState> {
    if (!this.currentProject) {
      throw new Error('No active project loaded');
    }
    this.currentProject.layout = {
      ...this.currentProject.layout,
      ...patch
    };
    this.currentProject.updatedAt = new Date().toISOString();
    return this.currentProject.layout;
  }

  async updateSettings(patch: Partial<ProjectSettings>): Promise<ProjectSettings> {
    if (!this.currentProject) {
      throw new Error('No active project loaded');
    }
    this.currentProject.settings = {
      ...this.currentProject.settings,
      ...patch
    };
    this.currentProject.updatedAt = new Date().toISOString();
    return this.currentProject.settings;
  }

  getCurrentProject(): Project | null {
    return this.currentProject;
  }

  async listProjects(): Promise<Project[]> {
    return this.persistence.listProjects();
  }
}
