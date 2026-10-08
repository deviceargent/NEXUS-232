# NEXUS-232 — Agent Interface & Tool Contract Specification

## 1. Provider Abstraction

The `AgentProvider` interface decouples the scientific workspace from external AI providers:

```typescript
export interface AgentProvider {
  name: string;
  sendMessage(prompt: string, context: AgentContext): Promise<AgentResponse>;
  streamMessage?(prompt: string, context: AgentContext, onChunk: (text: string) => void): Promise<AgentResponse>;
}
```

Implementations include:
* `DeterministicScientificProvider`: Offline deterministic mathematical & graph reasoning engine.
* `OpenAIProvider`: Function calling provider via OpenAI API.
* `AnthropicProvider`: Claude integration via Anthropic tools.
* `LocalModelProvider`: Local inference via Ollama / llama.cpp / vLLM.

---

## 2. Agent Tool Definitions

The agent executes actions exclusively through typed tools dispatched by `AgentService`:

| Tool | Parameters | Description |
|---|---|---|
| `create_node` | `type`, `title`, `content`, `parentIds?`, `dependencyIds?` | Creates a new theory node in the canvas |
| `connect_nodes` | `sourceId`, `targetId`, `relationType` | Establishes a derivation or dependency link |
| `derive_node` | `premiseNodeId`, `title`, `content`, `mathLatex?` | Derives consequence and creates link |
| `validate_node` | `nodeId` | Validates node prerequisites & cycle rules |
| `freeze_branch` | `nodeId` | Locks a derivation branch from further edits |
| `attach_resource` | `nodeId`, `resourceId` | Links PDF, video, or 3D model evidence |
| `create_document_fragment` | `documentId`, `title`, `latexContent`, `sourceNodeIds` | Links LaTeX section to theory nodes |
| `update_document` | `documentId`, `latexContent` | Updates primary LaTeX text |
| `compile_document` | `documentId`, `engine` | Executes compiler adapter and generates PDF |
| `focus_node` | `nodeId` | Centers node in visual canvas and opens inspector |
| `search_resources` | `query` | Searches indexed papers and datasets |
| `open_resource` | `resourceId` | Opens resource in lower workspace |

---

## 3. Tool Execution Flow

1. User sends message in `ChatPanel`.
2. `AgentPlanner` compiles context (nodes, edges, resources, active selection).
3. Active `AgentProvider` returns response and optional tool calls.
4. `AgentService` runs tool actions through domain services (`TheoryService`, `GraphService`, `DocumentService`, `ResourceService`, `CompilationService`).
5. Execution records and referenced node pills appear directly in chat messages.
