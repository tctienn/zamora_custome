import { DocStatus } from '@/apps/document/model/doc/doc-in';
import type { InComingProcess } from '@/apps/document/model/process/incoming';

export function createItem(
  incomingProcess: InComingProcess,
): { sendUser: any; receiveUser: any } {
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
    receiverName,
    receiverDeptName,
    receiverRoleId,
    receiverRoleName,
    completeTime,
    status,
    processType,
    actionName,
    note,
  } = incomingProcess;

  const createNodeData = (type: 'sender' | 'receiver', userData: any) => ({
    user: {
      userId: userData.userId,
      userName: userData.userName,
      deptId: userData.deptId,
      deptName: userData.deptName,
      roleId: userData.roleId,
      roleName: userData.roleName,
    },
    content: {
      senderType: type,
      processType: processType,
      actionName: actionName,
      note: note,
      ...type === 'sender' ? {
        sendTime: sendTime,
        sendTime2: sendTime,
        status: DocStatus.DA_XL
      } : {
        completeTime: completeTime,
        status: status
      },
    },
  });

  const sendUser = {
    id: `${parentId}_${senderId}`,
    ...createNodeData('sender', {
      userId: senderId,
      userName: senderName,
      deptId: senderDeptId,
      deptName: senderDeptName,
      roleId: senderRoleId,
      roleName: senderRoleName,
    }),
  };

  const receiveUser = {
    id: `${id}_${receiverId ?? receiverDeptId}`,
    ...createNodeData('receiver', {
      userId: receiverId,
      userName: receiverName,
      deptId: receiverDeptId,
      deptName: receiverDeptName,
      roleId: receiverRoleId,
      roleName: receiverRoleName,
    }),
  };

  return {
    sendUser,
    receiveUser
  };
}