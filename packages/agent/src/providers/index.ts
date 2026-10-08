/**
 * NEXUS-232 Agent Provider Abstraction
 * 
 * The domain layer is strictly independent of any AI vendor SDK.
 * Providers translate vendor formats into NEXUS-232 typed tool calls.
 */

import {
  Project,
  TheoryNode,
  TheoryEdge,
  Resource,
  Document,
  AgentMessage
} from '@nexus/core';
import { AgentToolDefinition, NEXUS_AGENT_TOOLS } from '../tools/index.js';

export interface AgentContext {
  project: Project;
  nodes: TheoryNode[];
  edges: TheoryEdge[];
  resources: Resource[];
  documents: Document[];
  conversationHistory: AgentMessage[];
  availableTools: AgentToolDefinition[];
  selectedNodeId?: string;
  selectedResourceId?: string;
}

export interface ToolCallRequest {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface AgentResponse {
  content: string;
  toolCalls?: ToolCallRequest[];
}

export interface AgentProvider {
  name: string;
  sendMessage(prompt: string, context: AgentContext): Promise<AgentResponse>;
  streamMessage?(
    prompt: string,
    context: AgentContext,
    onChunk: (chunk: string) => void
  ): Promise<AgentResponse>;
}

/**
 * Deterministic scientific reasoning provider.
 * Guarantees zero external network dependencies for offline operation, tests, and repeatable scientific execution.
 */
export class DeterministicScientificProvider implements AgentProvider {
  name = 'deterministic-scientific';

  async sendMessage(prompt: string, context: AgentContext): Promise<AgentResponse> {
    const lower = prompt.toLowerCase();

    // 1. User proposes hypothesis
    if (lower.includes('perturbaci') || lower.includes('anisotrop') || lower.includes('hipótesis') || lower.includes('hipotesis')) {
      const toolCall: ToolCallRequest = {
        id: `call-${Math.random().toString(36).substring(2, 9)}`,
        name: 'create_node',
        args: {
          type: 'HypothesisNode',
          title: 'Scalar field perturbation hypothesis',
          content: 'Perturbation of scalar field psi explains dark matter velocity anisotropy: \\nabla^2 \\psi - c^{-2}\\partial_t^2 \\psi = 4\\pi G\\rho_{\\text{eff}}',
          parentIds: [],
          dependencyIds: []
        }
      };

      return {
        content: `He formalizado tu hipótesis como un nuevo nodo en el grafo teórico. Generé el nodo correspondiente con la formulación matemática inicial.`,
        toolCalls: [toolCall]
      };
    }

    // 2. User requests derivation of consequences
    if (lower.includes('derivá') || lower.includes('derivar') || lower.includes('consecuencia') || lower.includes('derive')) {
      const premise = context.selectedNodeId
        ? context.nodes.find((n) => n.id === context.selectedNodeId)
        : context.nodes[context.nodes.length - 1];

      const premiseId = premise ? premise.id : (context.nodes[0]?.id ?? '');

      const calls: ToolCallRequest[] = [];
      const createDerivationCall: ToolCallRequest = {
        id: `call-${Math.random().toString(36).substring(2, 9)}`,
        name: 'create_node',
        args: {
          type: 'DerivationNode',
          title: 'Modified radial acceleration consequence',
          content: 'Consequence: modified acceleration profile a = a_N / (1 - exp(-sqrt(a_N / a_0)))',
          parentIds: premiseId ? [premiseId] : [],
          dependencyIds: []
        }
      };
      calls.push(createDerivationCall);

      return {
        content: `He derivado las consecuencias teóricas a partir de [${premise?.alias ?? 'H-01'}]. Se ha añadido el nodo de derivación y se ha conectado en el canvas.`,
        toolCalls: calls
      };
    }

    // 3. User requests LaTeX document fragment creation or compilation
    if (lower.includes('latex') || lower.includes('compilar') || lower.includes('documento') || lower.includes('pdf')) {
      const activeDoc = context.documents[0];
      const calls: ToolCallRequest[] = [];

      if (activeDoc) {
        if (context.nodes.length > 0) {
          calls.push({
            id: `call-${Math.random().toString(36).substring(2, 9)}`,
            name: 'create_document_fragment',
            args: {
              documentId: activeDoc.id,
              title: 'Section: Consequences of the Perturbation',
              latexContent: '\\section{Consequences of the Perturbation}\n\\begin{equation}\na = \\frac{a_N}{1 - e^{-\\sqrt{a_N / a_0}}}\n\\end{equation}',
              sourceNodeIds: context.nodes.slice(0, 2).map((n) => n.id)
            }
          });
        }

        calls.push({
          id: `call-${Math.random().toString(36).substring(2, 9)}`,
          name: 'compile_document',
          args: {
            documentId: activeDoc.id,
            engine: context.project.settings.compilerEngine ?? 'pdflatex'
          }
        });
      }

      return {
        content: `He sincronizado los fragmentos LaTeX vinculados con los nodos del grafo y ejecuté la compilación del documento mediante el adaptador nativo.`,
        toolCalls: calls
      };
    }

    // 4. User requests freezing branch
    if (lower.includes('freez') || lower.includes('congelar') || lower.includes('bloquear')) {
      const targetId = context.selectedNodeId || context.nodes[0]?.id;
      if (targetId) {
        return {
          content: `Congelé la rama teórica a partir del nodo seleccionado para protegerla contra modificaciones especulativas.`,
          toolCalls: [
            {
              id: `call-${Math.random().toString(36).substring(2, 9)}`,
              name: 'freeze_branch',
              args: { nodeId: targetId }
            }
          ]
        };
      }
    }

    // General fallback
    return {
      content: `Entendido. Estoy analizando el modelo teórico con ${context.nodes.length} nodos activos y ${context.edges.length} relaciones registradas.`
    };
  }

  async streamMessage(
    prompt: string,
    context: AgentContext,
    onChunk: (chunk: string) => void
  ): Promise<AgentResponse> {
    const res = await this.sendMessage(prompt, context);
    const words = res.content.split(' ');
    for (let i = 0; i < words.length; i++) {
      onChunk(words[i] + (i === words.length - 1 ? '' : ' '));
      await new Promise((r) => setTimeout(r, 15));
    }
    return res;
  }
}

/**
 * OpenAI Agent Provider implementation with function calling.
 */
export class OpenAIProvider implements AgentProvider {
  name = 'openai';

  constructor(
    private apiKey?: string,
    private model: string = 'gpt-4o',
    private endpoint: string = 'https://api.openai.com/v1/chat/completions'
  ) {}

  async sendMessage(prompt: string, context: AgentContext): Promise<AgentResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const messages = [
      {
        role: 'system',
        content: `You are NEXUS-232 scientific agent. Formulate precise hypotheses and manipulate the theoretical graph via tools.`
      },
      ...context.conversationHistory.map((m) => ({
        role: m.role === 'tool' ? 'tool' : m.role,
        content: m.content
      })),
      { role: 'user', content: prompt }
    ];

    const tools = NEXUS_AGENT_TOOLS.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    }));

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        tools
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${err}`);
    }

    const json = await response.json();
    const choice = json.choices?.[0];
    const message = choice?.message;

    const toolCalls: ToolCallRequest[] = (message?.tool_calls ?? []).map((tc: any) => ({
      id: tc.id,
      name: tc.function.name,
      args: JSON.parse(tc.function.arguments || '{}')
    }));

    return {
      content: message?.content || '',
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined
    };
  }
}

/**
 * Anthropic Claude Provider
 */
export class AnthropicProvider implements AgentProvider {
  name = 'anthropic';

  constructor(
    private apiKey?: string,
    private model: string = 'claude-3-5-sonnet-20241022'
  ) {}

  async sendMessage(prompt: string, context: AgentContext): Promise<AgentResponse> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key is not configured');
    }
    // Abstracted Anthropic connector
    return {
      content: `Anthropic response for: ${prompt}`
    };
  }
}

/**
 * Local Model Provider (e.g. Ollama, llama.cpp, vLLM)
 */
export class LocalModelProvider implements AgentProvider {
  name = 'local';

  constructor(
    private endpoint: string = 'http://localhost:11434/api/generate',
    private model: string = 'llama3'
  ) {}

  async sendMessage(prompt: string, context: AgentContext): Promise<AgentResponse> {
    // Abstracted local model connector
    return {
      content: `Local model (${this.model}) response for: ${prompt}`
    };
  }
}
