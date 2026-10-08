/**
 * NEXUS-232 Agent Tools Definitions
 */

export interface ToolParameterProperty {
  type: string;
  description: string;
  enum?: string[];
  items?: { type: string };
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameterProperty>;
    required: string[];
  };
}

export const NEXUS_AGENT_TOOLS: AgentToolDefinition[] = [
  {
    name: 'create_node',
    description: 'Creates a new scientific theory node (Hypothesis, Derivation, Evidence, Question, Blocked, Resource, Equation, Experiment, Simulation) in the canvas.',
    parameters: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [
            'HypothesisNode',
            'DerivationNode',
            'EvidenceNode',
            'QuestionNode',
            'BlockedNode',
            'ResourceNode',
            'EquationNode',
            'ExperimentNode',
            'SimulationNode'
          ],
          description: 'Type of the theory node'
        },
        title: { type: 'string', description: 'Concise scientific title' },
        content: { type: 'string', description: 'Scientific formulation, premise or hypothesis text' },
        parentIds: { type: 'array', items: { type: 'string' }, description: 'Array of parent node IDs' },
        dependencyIds: { type: 'array', items: { type: 'string' }, description: 'Array of prerequisite dependency node IDs' }
      },
      required: ['type', 'title', 'content']
    }
  },
  {
    name: 'connect_nodes',
    description: 'Establishes a directed theoretical relationship between two nodes in the graph.',
    parameters: {
      type: 'object',
      properties: {
        sourceId: { type: 'string', description: 'Source node ID' },
        targetId: { type: 'string', description: 'Target node ID' },
        relationType: {
          type: 'string',
          enum: ['derives', 'supports', 'refutes', 'depends_on', 'relates_to'],
          description: 'Type of relation'
        }
      },
      required: ['sourceId', 'targetId', 'relationType']
    }
  },
  {
    name: 'derive_node',
    description: 'Derives consequences or intermediate mathematical steps from an existing premise node.',
    parameters: {
      type: 'object',
      properties: {
        premiseNodeId: { type: 'string', description: 'ID of the premise node being derived from' },
        title: { type: 'string', description: 'Title of the derived consequence' },
        content: { type: 'string', description: 'Theoretical deduction formulation' },
        mathLatex: { type: 'string', description: 'LaTeX representation of equation' }
      },
      required: ['premiseNodeId', 'title', 'content']
    }
  },
  {
    name: 'validate_node',
    description: 'Runs formal theoretical validation on a node and checks for contradictions, missing prerequisites, or cycle errors.',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'ID of node to validate' }
      },
      required: ['nodeId']
    }
  },
  {
    name: 'freeze_branch',
    description: 'Locks a theoretical branch from speculative mutations when validation reaches a hard stop or published milestone.',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'Root node ID of the branch to freeze' }
      },
      required: ['nodeId']
    }
  },
  {
    name: 'attach_resource',
    description: 'Associates an external evidence resource (PDF, paper, video, dataset, 3D model) to a theory node.',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'Target theory node ID' },
        resourceId: { type: 'string', description: 'Evidence resource ID' }
      },
      required: ['nodeId', 'resourceId']
    }
  },
  {
    name: 'create_document_fragment',
    description: 'Creates a synchronized LaTeX document fragment tied to one or more theory nodes.',
    parameters: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'Target document ID' },
        title: { type: 'string', description: 'Fragment title / section' },
        latexContent: { type: 'string', description: 'LaTeX source content' },
        sourceNodeIds: { type: 'array', items: { type: 'string' }, description: 'Originating theory node IDs' }
      },
      required: ['documentId', 'title', 'latexContent']
    }
  },
  {
    name: 'update_document',
    description: 'Updates the primary LaTeX text of a document.',
    parameters: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'Document ID' },
        latexContent: { type: 'string', description: 'Complete updated LaTeX code' }
      },
      required: ['documentId', 'latexContent']
    }
  },
  {
    name: 'compile_document',
    description: 'Compiles the LaTeX document to a PDF via the native compiler adapter.',
    parameters: {
      type: 'object',
      properties: {
        documentId: { type: 'string', description: 'Document ID to compile' },
        engine: {
          type: 'string',
          enum: ['pdflatex', 'xelatex', 'lualatex', 'tectonic'],
          description: 'Compiler engine'
        }
      },
      required: ['documentId']
    }
  },
  {
    name: 'focus_node',
    description: 'Centers and selects a node in the visual theory canvas and updates the inspector.',
    parameters: {
      type: 'object',
      properties: {
        nodeId: { type: 'string', description: 'Node ID to focus' }
      },
      required: ['nodeId']
    }
  },
  {
    name: 'search_resources',
    description: 'Searches for indexed papers, PDFs, datasets, videos, and models in the project.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or keyword' }
      },
      required: ['query']
    }
  },
  {
    name: 'open_resource',
    description: 'Opens a resource in the lower workspace viewer (PDF viewer, libmpv media adapter, 3D viewer).',
    parameters: {
      type: 'object',
      properties: {
        resourceId: { type: 'string', description: 'Resource ID to open' }
      },
      required: ['resourceId']
    }
  }
];
