/**
 * NEXUS-232 Desktop Tauri & Persistence Bridge
 * 
 * Clean communication bridge between React frontend and Rust/Tauri backend.
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
import { IPersistenceAdapter, ProjectBundle } from '@nexus/application';

export class LocalStoragePersistenceAdapter implements IPersistenceAdapter {
  private prefix = 'nexus_232_proj_';
  private listKey = 'nexus_232_projects_list';

  async saveProject(bundle: ProjectBundle): Promise<void> {
    const serialized = JSON.stringify(bundle);
    try {
      localStorage.setItem(`${this.prefix}${bundle.project.id}`, serialized);
      const list = await this.listProjects();
      const existingIdx = list.findIndex((p) => p.id === bundle.project.id);
      if (existingIdx >= 0) {
        list[existingIdx] = bundle.project;
      } else {
        list.push(bundle.project);
      }
      localStorage.setItem(this.listKey, JSON.stringify(list));
    } catch {
      // Memory fallback if storage is restricted
    }
  }

  async loadProject(projectId: string): Promise<ProjectBundle | null> {
    try {
      const data = localStorage.getItem(`${this.prefix}${projectId}`);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async listProjects(): Promise<Project[]> {
    try {
      const raw = localStorage.getItem(this.listKey);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    localStorage.removeItem(`${this.prefix}${projectId}`);
    const list = (await this.listProjects()).filter((p) => p.id !== projectId);
    localStorage.setItem(this.listKey, JSON.stringify(list));
  }
}

export const persistenceAdapter = new LocalStoragePersistenceAdapter();
