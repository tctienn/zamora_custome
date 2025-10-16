import type { XYPosition } from '@vue-flow/core';
import type { Edge } from '@vue-flow/core/dist/types/edge';
import type { Node } from '@vue-flow/core/dist/types/node';

import { DocStatus } from '@/apps/document/model/doc/doc-in';
import { ProcessType } from '@/apps/document/model/process/incoming';
import type { Process } from '@/apps/document/model/process/process';

export type NodeProcess = {
  process: Process,
  sendNode: Node,
  receiveNode: Node,
}
export function createNode(
  process: Process,
  sendNodeId: string,
  receiveNodeId: string,
  position: XYPosition = {
    x: 0,
    y: 0
  },
): { sendNode: Node; receiveNode: Node } {
  const {
    id,
    parentId,
    senderId,
    receiverId,
    receiverDeptId,
    senderName,
    senderDeptId,
    senderDeptName,
    senderRoleId,
    senderRoleName,
    sendTime,
    readTime,
    receiverName,
    receiverDeptName,
    receiverRoleId,
    receiverRoleName,
    completeTime,
    status,
    processType,
  } = process;

  const createNodeData = (type: 'sender' | 'receiver', userData: any) => ({
    senderType: type,
    processId: id,
    parentProcessId: parentId,
    userId: userData.userId,
    userName: userData.userName,
    deptId: userData.deptId,
    deptName: userData.deptName,
    roleId: userData.roleId,
    roleName: userData.roleName,
    processType: processType,
    note: userData.note,
    ...type === 'sender' ? {
      sendTime: sendTime,
      status: DocStatus.DA_XL
    } : {
      receiveTime: sendTime,
      readTime: readTime,
      completeTime: completeTime,
      status: status,
    },
  });

  const sendNode: Node = {
    id: sendNodeId,
    data: createNodeData('sender', {
      ...process,
      userId: senderId,
      userName: senderName,
      deptId: senderDeptId,
      deptName: senderDeptName,
      roleId: senderRoleId,
      roleName: senderRoleName,
    }),
    position,
    type: 'HIS_BASIC_NODE',
  };

  const receiveNode: Node = {
    id: receiveNodeId,
    data: createNodeData('receiver', {
      ...process,
      userId: receiverId,
      userName: receiverName,
      deptId: receiverDeptId,
      deptName: receiverDeptName,
      roleId: receiverRoleId,
      roleName: receiverRoleName,
    }),
    position: position,
    type: 'HIS_BASIC_NODE',
  };

  return {
    sendNode,
    receiveNode
  };
}

export function createEdge(
  process: Process,
  sourceId?: string,
  targetId?: string,
  edgeId?: string,
): Edge {
  const {
    id,
    parentId,
    senderId,
    receiverId,
    receiverDeptId,
    actionName,
    processType
  } = process;

  const edge: Edge = {
    id: edgeId || process?.id || 'first',
    type: 'HIS_BASIC_EDGE',
    data: {
      ...process,
      label: actionName ?? 'Next',
      processType: processType,
      actionName: actionName,
      style: {
        stroke: processTypeColorMap[processType || ProcessType.DE_BIET],
        'stroke-width': '0.15rem'
      }
    },
    source: sourceId ?? `${parentId ?? id}_`,
    target: targetId ?? `${id}_${receiverId ?? receiverDeptId}`,
  };

  return edge;
}

const processTypeColorMap: Record<string, string> = {
  [ProcessType.XL_CHINH]: 'green',
  [ProcessType.PHOI_HOP]: 'blue', // Example color
  [ProcessType.DE_BIET]: 'yellow', // Example color
};
