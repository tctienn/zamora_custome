import type { Nullable } from 'primevue/ts-helpers';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { OrganizationType } from '@/apps/document/model/organization';

export interface FlowInterface {
  id?: string;
  name: string;
  type: string;
  description?: string;
  orgType: OrganizationType;
  orgIds: string[];
  isTemp: boolean;
  app: string;
  status: string | boolean; // Added status field to support both string and boolean values
}

export interface FlowEntityInput {
  name: string;
  type: string;
  orgIds: string[];
  orgType: OrganizationType;
  description: string;
  isTemp: boolean;
}

export const defaultFlow = {
  orgType: OrganizationType.ADMINISTRATIVE,
  isTemp: false,
  status: 'ACTIVE' // Default status as string
} as FlowInterface;

export interface FlowInputInterface {
  nodes: NodeInputInterface[];
  edges: EdgeInputInterface[];
}

export type Outcome = {
  name: string;
  label?: string;
  color?: string;
  required?: { field: Nullable<string>, value: Nullable<string> }[];
  autoNext?: number;
  disable?: boolean;
}

type CommonNode = {
  id: string;
  position: object;
  initialized: boolean;
  dimensions: object;
  handleBounds: object;
}

export type CommonNodeData = {
  label: string
  outcomes: Outcome[]
  orgType: OrganizationType
  optionActions?: Outcome[]
  options?: UserOption;
}

export type UserOption = {
  toCreator?: boolean;
  userIds?: string[];
  orgIds?: string[];
  roleIds?: string[];
  orgRoles?: OrgRole[];
  userDeptRoles?: UserDeptRoleInput[];
}
export type OrgRole = {
  orgId: string | null; roles: string[];
}

export type BasicNodeData = CommonNodeData & {
  selectionOption?: SelectionOption;
  status?: string
}
type SplitNodeData = CommonNodeData
type JoinNodeData = CommonNodeData & {
  mergeOption: 'ALL' | 'ANY'
}

type StartNodeData = CommonNodeData
type EndNodeData = CommonNodeData & {
  status?: string
}

export type BasicNode = CommonNode & {
  type: NodeType.BASIC;
  data: BasicNodeData;
}

export type StartNode = CommonNode & {
  type: NodeType.START;
  data: StartNodeData;
}

export type EndNode = CommonNode & {
  type: NodeType.END;
  data: EndNodeData;
}
export type JoinNode = CommonNode & {
  type: NodeType.JOIN
  data: JoinNodeData
}

export type SplitNode = CommonNode & {
  type: NodeType.SPLIT
  data: SplitNodeData
}

export type NodeInputInterface = BasicNode | StartNode | EndNode | JoinNode | SplitNode;

export interface EdgeInputInterface {
  source: string;
  target: string;
  id: string;
  data: {
    outcome?: string
    [key: string]: any; // Allow other properties in data if necessary
  };
  targetX: number;
  targetY: number;
  sourceX: number;
  sourceY: number;
  sourceHandle: string;
  targetHandle: string;
}

export enum NodeType {
  START = 'START',
  END = 'END',
  BASIC = 'BASIC',
  ELEMENT = 'ELEMENT',
  SUB_FLOW = 'SUB_FLOW',
  SPLIT = 'SPLIT',
  JOIN = 'JOIN'
}

export enum SelectionOption {
  ONE = 'ONE',
  MULTIPLE = 'MULTIPLE',
  ALL = 'ALL'
}

export enum MergeOption {
  ANY = 'ANY',
  ALL = 'ALL'
}