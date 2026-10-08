/**
 * NEXUS-232 Agent Planner & Orchestrator
 */

import {
  ProjectService,
  TheoryService,
  GraphService,
  DocumentService,
  ResourceService,
  AgentService,
  CompilationService
} from '@nexus/application';
import {
  AgentProvider,
  AgentContext,
  DeterministicScientificProvider,
  OpenAIProvider
} from '../providers/index.js';
import { NEXUS_AGENT_TOOLS } from '../tools/index.js';

export class AgentPlanner {
  private activeProvider: AgentProvider;
  private providers = new Map<string, AgentProvider>();

  constructor(
    private projectService: ProjectService,
    private theoryService: TheoryService,
    private graphService: GraphService,
    private documentService: DocumentService,
    private resourceService: ResourceService,
    private agentService: AgentService,
    private compilationService: CompilationService
  ) {
    const defaultDeterministic = new DeterministicScientificProvider();
    this.providers.set('deterministic', defaultDeterministic);
    this.providers.set('openai', new OpenAIProvider());
    this.activeProvider = defaultDeterministic;
  }

  setProvider(name: string, provider: AgentProvider): void {
    this.providers.set(name, provider);
    this.activeProvider = provider;
  }

  getActiveProvider(): AgentProvider {
    return this.activeProvider;
  }

  async processUserMessage(
    userText: string,
    selectedNodeId?: string,
    selectedResourceId?: string,
    onChunk?: (text: string) => void
  ): Promise<{
    agentMessage: string;
    executedTools: Array<{ toolName: string; success: boolean; data?: unknown }>;
  }> {
    // 1. Record user message
    this.agentService.addMessage({
      role: 'user',
      content: userText
    });

    const project = this.projectService.getCurrentProject();
    if (!project) throw new Error('No project active');

    // 2. Assemble context
    const context: AgentContext = {
      project,
      nodes: this.graphService.getAllNodes(),
      edges: this.graphService.getAllEdges(),
      resources: this.resourceService.getAllResources(),
      documents: this.documentService.getAllDocuments(),
      conversationHistory: this.agentService.getMessages(),
      availableTools: NEXUS_AGENT_TOOLS,
      selectedNodeId,
      selectedResourceId
    };

    // 3. Query provider
    let response;
    if (onChunk && this.activeProvider.streamMessage) {
      response = await this.activeProvider.streamMessage(userText, context, onChunk);
    } else {
      response = await this.activeProvider.sendMessage(userText, context);
      if (onChunk) {
        onChunk(response.content);
      }
    }

    // 4. Execute tool calls through application services
    const executedTools: Array<{ toolName: string; success: boolean; data?: unknown }> = [];
    const referencedNodeIds: string[] = [];
    const referencedResourceIds: string[] = [];

    if (response.toolCalls && response.toolCalls.length > 0) {
      for (const call of response.toolCalls) {
        const result = await this.agentService.executeTool(call.name, call.args);
        executedTools.push({
          toolName: call.name,
          success: result.success,
          data: result.data
        });
        if (result.referencedNodeIds) {
          referencedNodeIds.push(...result.referencedNodeIds);
        }
        if (result.referencedResourceIds) {
          referencedResourceIds.push(...result.referencedResourceIds);
        }
      }
    }

    // 5. Record agent response in history
    this.agentService.addMessage({
      role: 'assistant',
      content: response.content,
      toolCalls: response.toolCalls?.map((tc) => ({
        id: tc.id,
        name: tc.name,
        args: tc.args,
        status: 'SUCCESS'
      })),
      referencedNodeIds: Array.from(new Set(referencedNodeIds)),
      referencedResourceIds: Array.from(new Set(referencedResourceIds))
    });

    return {
      agentMessage: response.content,
      executedTools
    };
  }
}
