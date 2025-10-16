import type { TreeNode } from 'primevue/treenode';

export type EFormGroup = {
  id?: string;
  name?: string;
  parentId?: string;
  description?: string;
  orderNumber?: number;
  children?: EFormGroup[];
}

export type ExpireDate = {
  startTime: Date,
  endTime: Date
}

export function convertGroupToTree(
  groups: EFormGroup[],
  parentId: string | undefined = undefined
): TreeNode[] {
  return groups
    .filter(group => parentId ? group.parentId === parentId : !group.parentId)
    .map(group => ({
      key: group.id,
      label: group.name,
      data: group,
      children: convertGroupToTree(groups, group.id),
    }));
}

export type EForm = {
  code: string
  name: string
  orderNumber?: number
  groupId?: string
  description?: string
  isActive?: boolean

  versions?: EFormVersion[]
}

export type EFormVersion = {
  id?: string
  eFormCode?: string
  name?: string
  status?: VersionStatus
}

export type EFormVersionInfo = EFormVersion & {
  eFormName?: string
}

export enum VersionStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ACTIVE = 'ACTIVE',
}

export type EFormTree = {
  id: string
  name: string
  parentId?: string
  children?: EFormTree[]
  type: EFormTreeType
}

export enum EFormTreeType {
  GROUP = 'GROUP',
  E_FORM = 'E_FORM'
}
