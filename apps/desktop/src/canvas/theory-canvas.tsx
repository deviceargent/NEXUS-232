import React, { useMemo, useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  MarkerType
} from '@xyflow/react';
import { useNexus } from '../app/context.js';
import { useUIStore } from '../app/store.js';
import { theoryNodeTypes } from './node-components.js';
import { CanvasToolbar } from './canvas-toolbar.js';
import { EdgeRelationType } from '@nexus/core';

export const TheoryCanvas: React.FC = () => {
  const { nodes: domainNodes, edges: domainEdges, theoryService, syncState } = useNexus();
  const { selectedNodeId, setSelectedNodeId } = useUIStore();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter nodes based on search & status filter
  const filteredDomainNodes = useMemo(() => {
    return domainNodes.filter((node) => {
      if (statusFilter !== 'ALL' && node.status !== statusFilter) return false;
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        return (
          node.alias.toLowerCase().includes(q) ||
          node.title.toLowerCase().includes(q) ||
          node.content.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [domainNodes, statusFilter, searchQuery]);

  // Convert domain nodes to XYFlow nodes
  const flowNodes: Node[] = useMemo(() => {
    // Basic automatic layout grid if position not set
    const cols = 3;
    const spacingX = 320;
    const spacingY = 220;

    return filteredDomainNodes.map((node, index) => {
      const defaultX = 60 + (index % cols) * spacingX;
      const defaultY = 60 + Math.floor(index / cols) * spacingY;

      const posX = node.metadata?.position?.x ?? defaultX;
      const posY = node.metadata?.position?.y ?? defaultY;

      return {
        id: node.id,
        type: node.type,
        position: { x: posX, y: posY },
        data: {
          node,
          isSelected: node.id === selectedNodeId
        },
        selected: node.id === selectedNodeId
      };
    });
  }, [filteredDomainNodes, selectedNodeId]);

  // Convert domain edges to XYFlow edges
  const flowEdges: Edge[] = useMemo(() => {
    const activeNodeIds = new Set(filteredDomainNodes.map((n) => n.id));

    return domainEdges
      .filter((e) => activeNodeIds.has(e.sourceId) && activeNodeIds.has(e.targetId))
      .map((edge) => {
        const isDerives = edge.relationType === 'derives';
        const strokeColor = isDerives ? '#38bdf8' : '#94a3b8';

        return {
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
          animated: isDerives,
          style: {
            stroke: strokeColor,
            strokeWidth: 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 14,
            height: 14
          }
        };
      });
  }, [domainEdges, filteredDomainNodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      try {
        theoryService.connectNodes(connection.source, connection.target, 'derives');
        syncState();
      } catch (err: any) {
        alert(err.message || 'Error connecting nodes');
      }
    },
    [theoryService, syncState]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const handleFitView = () => {
    rfInstance?.fitView({ padding: 0.2, duration: 400 });
  };

  const handleCenterSelected = () => {
    if (!selectedNodeId || !rfInstance) return;
    const node = rfInstance.getNode(selectedNodeId);
    if (node) {
      rfInstance.setCenter(node.position.x + 120, node.position.y + 70, {
        zoom: 1.1,
        duration: 400
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-[var(--nexus-bg)] overflow-hidden select-none">
      <CanvasToolbar
        onFitView={handleFitView}
        onCenterSelected={handleCenterSelected}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={theoryNodeTypes}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={setRfInstance}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2.5}
        className="h-full w-full"
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls className="!bottom-4 !left-4" showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const status = (n.data as any)?.node?.status;
            if (status === 'VALID') return '#10b981';
            if (status === 'BLOCKED') return '#f43f5e';
            if (status === 'IN_REVIEW') return '#f59e0b';
            return '#38bdf8';
          }}
          maskColor="rgba(9, 12, 16, 0.75)"
          className="!bottom-4 !right-4 !w-36 !h-24"
        />
      </ReactFlow>
    </div>
  );
};
