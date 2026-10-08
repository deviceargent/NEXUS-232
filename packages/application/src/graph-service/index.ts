/**
 * NEXUS-232 Graph Query & Navigation Service
 */

import { TheoryNode, TheoryEdge, TheoryNodeType, TheoryStatus } from '@nexus/core';
import { TheoryService } from '../theory-service/index.js';

export interface GraphFilterOptions {
  types?: TheoryNodeType[];
  statuses?: TheoryStatus[];
  searchQuery?: string;
  isFrozen?: boolean;
}

export class GraphService {
  constructor(private theoryService: TheoryService) {}

  getAllNodes(): TheoryNode[] {
    return this.theoryService.getGraph().getAllNodes();
  }

  getAllEdges(): TheoryEdge[] {
    return this.theoryService.getGraph().getAllEdges();
  }

  getNode(nodeId: string): TheoryNode | undefined {
    return this.theoryService.getGraph().getNode(nodeId);
  }

  findNodeByAlias(alias: string): TheoryNode | undefined {
    const clean = alias.trim().toUpperCase();
    return this.getAllNodes().find((n) => n.alias.toUpperCase() === clean);
  }

  filterNodes(options: GraphFilterOptions): TheoryNode[] {
    let nodes = this.getAllNodes();

    if (options.types && options.types.length > 0) {
      const typeSet = new Set(options.types);
      nodes = nodes.filter((n) => typeSet.has(n.type));
    }

    if (options.statuses && options.statuses.length > 0) {
      const statusSet = new Set(options.statuses);
      nodes = nodes.filter((n) => statusSet.has(n.status));
    }

    if (options.isFrozen !== undefined) {
      nodes = nodes.filter((n) => n.isFrozen === options.isFrozen);
    }

    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const query = options.searchQuery.toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.alias.toLowerCase().includes(query) ||
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query)
      );
    }

    return nodes;
  }

  getParents(nodeId: string): TheoryNode[] {
    return this.theoryService.getGraph().getDirectParents(nodeId);
  }

  getChildren(nodeId: string): TheoryNode[] {
    return this.theoryService.getGraph().getDirectChildren(nodeId);
  }

  getDependencies(nodeId: string): TheoryNode[] {
    return this.theoryService.getGraph().getDirectDependencies(nodeId);
  }

  getConsequences(nodeId: string): TheoryNode[] {
    return this.theoryService.getGraph().getDirectConsequences(nodeId);
  }

  getAncestors(nodeId: string): TheoryNode[] {
    return this.theoryService.getGraph().getAncestors(nodeId);
  }

  getDescendants(nodeId: string): TheoryNode[] {
    return this.theoryService.getGraph().getDescendants(nodeId);
  }
}
