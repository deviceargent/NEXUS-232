/**
 * NEXUS-232 Resources & Resource Anchors Domain Model
 */

export type ResourceType =
  | 'PDF'
  | 'URL'
  | 'Video'
  | 'Image'
  | 'Text'
  | 'Dataset'
  | 'Artifact'
  | '3DModel'
  | 'File';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ResourceAnchorType = 'VIDEO_TIMESTAMP' | 'PDF_PAGE' | 'DOCUMENT_FRAGMENT' | '3D_CAMERA';

export interface BaseAnchor {
  id: string;
  resourceId: string;
  label: string;
  createdAt: string;
}

export interface VideoAnchor extends BaseAnchor {
  type: 'VIDEO_TIMESTAMP';
  timestampSeconds: number;
}

export interface PDFAnchor extends BaseAnchor {
  type: 'PDF_PAGE';
  pageNumber: number;
  boundingBox?: BoundingBox;
}

export interface DocumentAnchor extends BaseAnchor {
  type: 'DOCUMENT_FRAGMENT';
  documentId: string;
  fragmentId: string;
}

export interface ThreeDAnchor extends BaseAnchor {
  type: '3D_CAMERA';
  position: [number, number, number];
  target: [number, number, number];
  meshIdentifier?: string;
}

export type ResourceAnchor = VideoAnchor | PDFAnchor | DocumentAnchor | ThreeDAnchor;

export interface ResourceMetadata {
  author?: string;
  doi?: string;
  year?: number;
  fileSizeBytes?: number;
  dimensions?: { width: number; height: number };
  durationSeconds?: number;
  datasetFormat?: string;
  [key: string]: unknown;
}

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  uri: string;
  mimeType?: string;
  metadata: ResourceMetadata;
  anchors: ResourceAnchor[];
  createdAt: string;
  updatedAt: string;
}
