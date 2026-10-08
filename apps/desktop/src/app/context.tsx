/**
 * NEXUS-232 Application Services Context
 * 
 * Provides typed application services to React components.
 * Components do NOT implement scientific logic; they delegate to services.
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
import {
  ProjectService,
  TheoryService,
  GraphService,
  DocumentService,
  ResourceService,
  CompilationService,
  AgentService,
  ProjectBundle
} from '@nexus/application';
import { AgentPlanner } from '@nexus/agent';
import { persistenceAdapter } from '../shell/desktop-bridge.js';

export interface NexusServicesContextValue {
  projectService: ProjectService;
  theoryService: TheoryService;
  graphService: GraphService;
  documentService: DocumentService;
  resourceService: ResourceService;
  compilationService: CompilationService;
  agentService: AgentService;
  agentPlanner: AgentPlanner;

  // Reactive state synced with application layer
  currentProject: Project | null;
  nodes: TheoryNode[];
  edges: TheoryEdge[];
  resources: Resource[];
  documents: Document[];
  compilations: Compilation[];
  messages: AgentMessage[];
  actions: AgentAction[];

  // Trigger synchronization across React components
  syncState: () => void;
  saveCurrentProject: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
}

const NexusContext = createContext<NexusServicesContextValue | null>(null);

export const NexusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Service singletons
  const services = useMemo(() => {
    const projectService = new ProjectService(persistenceAdapter);
    const theoryService = new TheoryService();
    const graphService = new GraphService(theoryService);
    const documentService = new DocumentService(theoryService);
    const resourceService = new ResourceService(theoryService);
    const compilationService = new CompilationService(documentService);
    const agentService = new AgentService(
      theoryService,
      graphService,
      documentService,
      resourceService,
      compilationService
    );
    const agentPlanner = new AgentPlanner(
      projectService,
      theoryService,
      graphService,
      documentService,
      resourceService,
      agentService,
      compilationService
    );

    return {
      projectService,
      theoryService,
      graphService,
      documentService,
      resourceService,
      compilationService,
      agentService,
      agentPlanner
    };
  }, []);

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [nodes, setNodes] = useState<TheoryNode[]>([]);
  const [edges, setEdges] = useState<TheoryEdge[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [compilations, setCompilations] = useState<Compilation[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);

  const syncState = () => {
    setCurrentProject(services.projectService.getCurrentProject());
    setNodes(services.graphService.getAllNodes());
    setEdges(services.graphService.getAllEdges());
    setResources(services.resourceService.getAllResources());
    setDocuments(services.documentService.getAllDocuments());
    setMessages(services.agentService.getMessages());
    setActions(services.agentService.getActions());
    const doc = services.documentService.getAllDocuments()[0];
    if (doc) {
      setCompilations(services.compilationService.getCompilationHistory(doc.id));
    }
  };

  const saveCurrentProject = async () => {
    const proj = services.projectService.getCurrentProject();
    if (!proj) return;
    const bundle: ProjectBundle = {
      project: proj,
      nodes: services.graphService.getAllNodes(),
      edges: services.graphService.getAllEdges(),
      resources: services.resourceService.getAllResources(),
      documents: services.documentService.getAllDocuments(),
      compilations,
      messages: services.agentService.getMessages(),
      actions: services.agentService.getActions()
    };
    await persistenceAdapter.saveProject(bundle);
  };

  const createProject = async (name: string, description = '') => {
    const project = await services.projectService.createProject(name, description);
    // Initialize default document
    services.documentService.createDocument('Theoretical Foundations & Derivations');
    // Initialize initial sample paper resource
    const paper = services.resourceService.addResource(
      'PDF',
      'Milgrom (1983) - A Modification of the Newtonian Dynamics',
      'papers/milgrom1983.pdf',
      { author: 'M. Milgrom', year: 1983 }
    );
    services.resourceService.addPDFAnchor(paper.id, 'Core Field Equation (p. 3)', 3);

    // Initialize 3D simulation resource
    const sim3d = services.resourceService.addResource(
      '3DModel',
      'Galactic Rotation Velocity Dispersion (Simulation Grid)',
      'models/galaxy_dispersion.obj',
      { datasetFormat: 'N-body particle vector field' }
    );
    services.resourceService.add3DAnchor(sim3d.id, 'Anisotropy Halo Vantage', [5, 5, 8], [0, 0, 0]);

    // Initialize Video experiment resource
    const vid = services.resourceService.addResource(
      'Video',
      'Lab Simulation Run #27 - Hydrodynamic Turbulence',
      'videos/run27.mp4',
      { durationSeconds: 120 }
    );
    services.resourceService.addVideoAnchor(vid.id, 'Turbulence transition', 42);

    syncState();
    await saveCurrentProject();
  };

  const loadProject = async (id: string) => {
    const bundle = await services.projectService.loadProject(id);
    if (!bundle) return;
    // Re-hydrate services
    for (const node of bundle.nodes) {
      if (!services.theoryService.getGraph().hasNode(node.id)) {
        services.theoryService.getGraph().addNode(node);
      }
    }
    for (const edge of bundle.edges) {
      if (!services.theoryService.getGraph().getEdge(edge.id)) {
        services.theoryService.getGraph().addEdge(edge);
      }
    }
    syncState();
  };

  // Auto-initialize first default project on mount
  useEffect(() => {
    createProject(
      'Dark Matter Anisotropy Exploration (NEXUS-01)',
      'Primary workspace investigating scalar field perturbations and galactic rotation velocity dispersion.'
    );
  }, []);

  const value: NexusServicesContextValue = {
    ...services,
    currentProject,
    nodes,
    edges,
    resources,
    documents,
    compilations,
    messages,
    actions,
    syncState,
    saveCurrentProject,
    createProject,
    loadProject
  };

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
};

export const useNexus = () => {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error('useNexus must be used within a NexusProvider');
  return ctx;
};
