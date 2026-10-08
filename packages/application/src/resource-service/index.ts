/**
 * NEXUS-232 Resource & Anchor Service
 */

import {
  Resource,
  ResourceType,
  ResourceAnchor,
  ResourceMetadata,
  VideoAnchor,
  PDFAnchor,
  DocumentAnchor,
  ThreeDAnchor,
  generateId
} from '@nexus/core';
import { TheoryService } from '../theory-service/index.js';

export class ResourceService {
  private resources = new Map<string, Resource>();

  constructor(private theoryService?: TheoryService) {}

  addResource(
    type: ResourceType,
    title: string,
    uri: string,
    metadata: ResourceMetadata = {}
  ): Resource {
    const now = new Date().toISOString();
    const resource: Resource = {
      id: generateId(),
      title,
      type,
      uri,
      metadata,
      anchors: [],
      createdAt: now,
      updatedAt: now
    };
    this.resources.set(resource.id, resource);
    return resource;
  }

  getResource(id: string): Resource | undefined {
    return this.resources.get(id);
  }

  getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  addVideoAnchor(resourceId: string, label: string, timestampSeconds: number): VideoAnchor {
    const res = this.resources.get(resourceId);
    if (!res) throw new Error(`Resource ${resourceId} not found`);

    const anchor: VideoAnchor = {
      id: generateId(),
      resourceId,
      label,
      type: 'VIDEO_TIMESTAMP',
      timestampSeconds,
      createdAt: new Date().toISOString()
    };
    res.anchors.push(anchor);
    return anchor;
  }

  addPDFAnchor(
    resourceId: string,
    label: string,
    pageNumber: number,
    boundingBox?: { x: number; y: number; width: number; height: number }
  ): PDFAnchor {
    const res = this.resources.get(resourceId);
    if (!res) throw new Error(`Resource ${resourceId} not found`);

    const anchor: PDFAnchor = {
      id: generateId(),
      resourceId,
      label,
      type: 'PDF_PAGE',
      pageNumber,
      boundingBox,
      createdAt: new Date().toISOString()
    };
    res.anchors.push(anchor);
    return anchor;
  }

  add3DAnchor(
    resourceId: string,
    label: string,
    position: [number, number, number],
    target: [number, number, number],
    meshIdentifier?: string
  ): ThreeDAnchor {
    const res = this.resources.get(resourceId);
    if (!res) throw new Error(`Resource ${resourceId} not found`);

    const anchor: ThreeDAnchor = {
      id: generateId(),
      resourceId,
      label,
      type: '3D_CAMERA',
      position,
      target,
      meshIdentifier,
      createdAt: new Date().toISOString()
    };
    res.anchors.push(anchor);
    return anchor;
  }

  attachResourceToNode(nodeId: string, resourceId: string): void {
    if (!this.resources.has(resourceId)) {
      throw new Error(`Resource ${resourceId} not found`);
    }
    if (this.theoryService) {
      const node = this.theoryService.getGraph().getNode(nodeId);
      if (node && !node.resourceIds.includes(resourceId)) {
        this.theoryService.updateNode(nodeId, {
          resourceIds: [...node.resourceIds, resourceId]
        });
      }
    }
  }

  getResourcesForNode(nodeId: string): Resource[] {
    if (!this.theoryService) return [];
    const node = this.theoryService.getGraph().getNode(nodeId);
    if (!node) return [];
    return node.resourceIds
      .map((id) => this.resources.get(id))
      .filter((r): r is Resource => !!r);
  }
}
