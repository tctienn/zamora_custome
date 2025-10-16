import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { OrganizationType } from '@/apps/document/model/organization';
import type { EdgeInputInterface, NodeInputInterface } from '@/apps/work-flow/model/flow';

export type UserSelectNextActionModel = {
  flowId?: string
  flowInstanceId?: string
  result: string
  nodeId: string
  orgType?: OrganizationType
  isStartNode: boolean
}

export type UserSelectNext = UserDeptRoleInput & {
  avatar: string,
  email: string,
  positionName: string,
  isClericalCharged: boolean,
}
export type UserSelectNextResponse = {
  node: NodeInputInterface,
  edge: EdgeInputInterface,
  usersSelectNext: UserSelectNext[]
}
export type SkipChooseUserModel = {
    flowInstanceId: string
    nodeId: string
    result: string
    docId: string
    type: ProcessNameType
}
export enum ProcessNameType{
   INCOMING = 'INCOMING',
    OUTGOING = 'OUTGOING',
    SUBMIT = 'SUBMIT',
}
