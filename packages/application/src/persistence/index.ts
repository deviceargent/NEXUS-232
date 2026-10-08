/**
 * NEXUS-232 Persistence Adapter Interface
 */

import {
  Project,
  TheoryNode,
  TheoryEdge,
  Resource,
  Document,
  Compilation,
  AgentMessage,
  AgentAction
} from '@nexus/core';

export interface ProjectBundle {
  project: Project;
  nodes: TheoryNode[];
  edges: TheoryEdge[];
  resources: Resource[];
  documents: Document[];
  compilations: Compilation[];
  messages: AgentMessage[];
  actions: AgentAction[];
}

export interface IPersistenceAdapter {
  saveProject(bundle: ProjectBundle): Promise<void>;
  loadProject(projectId: string): Promise<ProjectBundle | null>;
  listProjects(): Promise<Project[]>;
  deleteProject(projectId: string): Promise<void>;
}

/**
 * In-memory persistence adapter for tests and local development fallback.
 */
export class InMemoryPersistenceAdapter implements IPersistenceAdapter {
  private storage = new Map<string, ProjectBundle>();

  async saveProject(bundle: ProjectBundle): Promise<void> {
    // Deep clone to guarantee state isolation
    const cloned = JSON.parse(JSON.stringify(bundle));
    this.storage.set(bundle.project.id, cloned);
  }

  async loadProject(projectId: string): Promise<ProjectBundle | null> {
    const found = this.storage.get(projectId);
    if (!found) return null;
    return JSON.parse(JSON.stringify(found));
  }

  async listProjects(): Promise<Project[]> {
    return Array.from(this.storage.values()).map((b) => ({ ...b.project }));
  }

  async deleteProject(projectId: string): Promise<void> {
    this.storage.delete(projectId);
  }
}
