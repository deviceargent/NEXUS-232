/**
 * NEXUS-232 Agent Service
 * 
 * Executes agent tools against application services.
 * The agent modifies domain models ONLY through application services.
 */

import {
  AgentMessage,
  AgentAction,
  TheoryNodeType,
  EdgeRelationType,
  ResourceType,
  generateId
} from '@nexus/core';
import { TheoryService } from '../theory-service/index.js';
import { GraphService } from '../graph-service/index.js';
import { DocumentService } from '../document-service/index.js';
import { ResourceService } from '../resource-service/index.js';
import { CompilationService } from '../compilation-service/index.js';

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  data?: unknown;
  error?: string;
  referencedNodeIds?: string[];
  referencedResourceIds?: string[];
}

export class AgentService {
  private messages: AgentMessage[] = [];
  private actions: AgentAction[] = [];

  constructor(
    private theoryService: TheoryService,
    private graphService: GraphService,
    private documentService: DocumentService,
    private resourceService: ResourceService,
    private compilationService: CompilationService
  ) {}

  getMessages(): AgentMessage[] {
    return [...this.messages];
  }

  getActions(): AgentAction[] {
    return [...this.actions];
  }

  addMessage(msg: Omit<AgentMessage, 'id' | 'timestamp'>): AgentMessage {
    const message: AgentMessage = {
      ...msg,
      id: generateId(),
      timestamp: new Date().toISOString()
    };
    this.messages.push(message);
    return message;
  }

  async executeTool(name: string, args: Record<string, any>): Promise<ToolExecutionResult> {
    const actionId = generateId();
    const action: AgentAction = {
      id: actionId,
      type: name,
      parameters: args,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };
    this.actions.push(action);

    try {
      let resultData: unknown;
      let referencedNodeIds: string[] = [];
      let referencedResourceIds: string[] = [];

      switch (name) {
        case 'create_node': {
          const { type, title, content, parentIds = [], dependencyIds = [], metadata = {} } = args;
          const node = this.theoryService.createNode(
            type as TheoryNodeType,
            title,
            content,
            parentIds,
            dependencyIds,
            metadata
          );
          referencedNodeIds = [node.id, ...parentIds, ...dependencyIds];
          resultData = node;
          break;
        }

        case 'connect_nodes': {
          const { sourceId, targetId, relationType = 'derives' } = args;
          const edge = this.theoryService.connectNodes(
            sourceId,
            targetId,
            relationType as EdgeRelationType
          );
          referencedNodeIds = [sourceId, targetId];
          resultData = edge;
          break;
        }

        case 'derive_node': {
          const { premiseNodeId, title, content, mathLatex = '' } = args;
          const node = this.theoryService.createNode(
            'DerivationNode',
            title,
            content,
            [premiseNodeId],
            [],
            { equationLatex: mathLatex }
          );
          referencedNodeIds = [node.id, premiseNodeId];
          resultData = node;
          break;
        }

        case 'validate_node': {
          const { nodeId } = args;
          const node = this.graphService.getNode(nodeId);
          if (!node) throw new Error(`Node ${nodeId} not found`);
          const validation = this.theoryService.setNodeStatus(nodeId, node.status);
          referencedNodeIds = [nodeId];
          resultData = validation;
          break;
        }

        case 'freeze_branch': {
          const { nodeId } = args;
          const frozen = this.theoryService.freezeBranch(nodeId);
          referencedNodeIds = frozen.map((n) => n.id);
          resultData = { frozenNodesCount: frozen.length, nodeIds: referencedNodeIds };
          break;
        }

        case 'attach_resource': {
          const { nodeId, resourceId } = args;
          this.resourceService.attachResourceToNode(nodeId, resourceId);
          referencedNodeIds = [nodeId];
          referencedResourceIds = [resourceId];
          resultData = { attached: true, nodeId, resourceId };
          break;
        }

        case 'create_document_fragment': {
          const { documentId, title, latexContent, startLine = 1, endLine = 10, sourceNodeIds = [] } = args;
          const frag = this.documentService.createFragment(
            documentId,
            title,
            latexContent,
            startLine,
            endLine,
            undefined,
            sourceNodeIds
          );
          referencedNodeIds = sourceNodeIds;
          resultData = frag;
          break;
        }

        case 'update_document': {
          const { documentId, latexContent } = args;
          const doc = this.documentService.updateDocumentContent(documentId, latexContent);
          resultData = { id: doc.id, title: doc.title, length: doc.latexContent.length };
          break;
        }

        case 'compile_document': {
          const { documentId, engine = 'pdflatex' } = args;
          const compilation = await this.compilationService.compileDocument(documentId, engine);
          resultData = compilation;
          break;
        }

        case 'focus_node': {
          const { nodeId } = args;
          const node = this.graphService.getNode(nodeId);
          if (!node) throw new Error(`Node ${nodeId} not found`);
          referencedNodeIds = [nodeId];
          resultData = { focusedNodeId: nodeId, alias: node.alias };
          break;
        }

        case 'search_resources': {
          const { query = '' } = args;
          const resources = this.resourceService.getAllResources().filter((r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.uri.toLowerCase().includes(query.toLowerCase())
          );
          referencedResourceIds = resources.map((r) => r.id);
          resultData = resources;
          break;
        }

        case 'open_resource': {
          const { resourceId } = args;
          const res = this.resourceService.getResource(resourceId);
          if (!res) throw new Error(`Resource ${resourceId} not found`);
          referencedResourceIds = [resourceId];
          resultData = res;
          break;
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      action.status = 'SUCCESS';
      action.result = resultData;

      return {
        toolName: name,
        success: true,
        data: resultData,
        referencedNodeIds,
        referencedResourceIds
      };
    } catch (err: any) {
      action.status = 'FAILED';
      action.error = err.message || String(err);
      return {
        toolName: name,
        success: false,
        error: action.error
      };
    }
  }
}
