import type { Attachment } from '@/common/model';
import type { PageInfo } from '@/common/model/page';

export interface DocumentConfig {
  id: number | null;
  documentName: string | null;
  documentCode: string | null;
  required: boolean;
  description: string | null;
}

export interface DocumentConfigEdge {
  cursor: string;
  node: Node;
}

export interface DocumentConfigConnection {
  totalCount: number;
  pageInfo: PageInfo;
  edges: [DocumentConfigEdge];
}

export interface SearchDocumentConfigGraphqlResponse {
  totalCount: number;
  edges: Edges;
}

interface Node {
  id: number | null;
  documentName: string | null;
  documentCode: string | null;
  required: number | null;
  description: string | null;
}

export interface DocumentConfigResponse extends Node {
  ordinalNumber: number;
}

interface Edges {
  node: Node;
}

export enum DocumentStatus {
  SUBMISSION = 'SUBMISSION',
  UNSUBMISSION = 'UNSUBMISSION',
}

export interface EmployeeDocumentI {
  additionalDate: Date | null;
  status: DocumentStatus;
  required: boolean;
  documentCode: string;
  documentName: string;
  attachments: Attachment[];
  files?: FileList;
}