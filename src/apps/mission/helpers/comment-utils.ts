import { omit } from 'lodash';
import moment from 'moment';

import type { Process } from '@/apps/document/model/process/process';
import { DateTimeFormat } from '@/common/constants';
import { diffDurationDates } from '@/common/helpers/time-util';

import type { DocComment, UserDeptRoleInput } from '../model/doc/doc-in';

export function findChildren(comments: DocComment[], comment: DocComment): DocComment[] {
  return comments.filter(c => comment.receivers?.some(c2 => c2.chatId === c.replyForChatId));
}

export function mapChildren(comments: DocComment[], comment: DocComment): DocComment {
  return {
    ...comment,
    replyComment: findChildren(comments, comment).map(c => mapChildren(comments, c))
  };
}

export function processComment(rs: DocComment[], currentComment: DocComment) {
  currentComment = {
    ...currentComment,
    receivers: [currentComment],
    commentType: 'comment'
  };

  const findRs = rs.find(e =>
    e.fromUserId === currentComment.fromUserId
    && e.fromDepartmentId === currentComment.fromDepartmentId
    && e.fromRoleId === currentComment.fromRoleId
    && e.createdTime && currentComment.createdTime
    && Math.abs(diffDurationDates(e.createdTime, currentComment.createdTime)) <= 1
  );

  if (findRs) {
    findRs.receivers = [...findRs.receivers || [], currentComment];
  } else {
    rs.push(currentComment);
  }
}

function appendUserDeptRole(formData: FormData, userDeptRole: UserDeptRoleInput, jobId: string, replyForId?: string ) {
  formData.append('sender.fromUserId', userDeptRole.userId);
  formData.append('sender.fromUserName', userDeptRole.userName);
  formData.append('sender.fromDepartmentId', userDeptRole.deptId);
  formData.append('sender.fromDepartmentName', userDeptRole.deptName);
  formData.append('sender.fromRoleId', userDeptRole.roleId);
  formData.append('sender.fromRoleName', userDeptRole.roleName);
  formData.append('jobId', jobId);
  formData.append('sender.sendTime', moment(new Date()).format(DateTimeFormat.ISO_LOCAL_DATE_TIME));
  if(replyForId){
    formData.append('sender.replyForChatId', replyForId);
  }
}

function appendSelectedUser(formData: FormData,
  selectedUsers: UserDeptRoleInput[] | UserDeptRoleInput) {
  if (Array.isArray(selectedUsers)) {
    selectedUsers.forEach((user, index) => {
      formData.append(`receiver[${index}].toUserId`, user.userId);
      formData.append(`receiver[${index}].toDepartmentId`, user.deptId);
      formData.append(`receiver[${index}].toRoleId`, user.roleId);
      formData.append(`receiver[${index}].toUserName`, user.userName);
      formData.append(`receiver[${index}].toDepartmentName`, user.deptName);
      formData.append(`receiver[${index}].toRoleName`, user.roleName);
    });
  } else {
    formData.append('receiver[0].toUserId', selectedUsers.userId);
    formData.append('receiver[0].toDepartmentId', selectedUsers.deptId);
    formData.append('receiver[0].toRoleId', selectedUsers.roleId);
    formData.append('receiver[0].toUserName', selectedUsers.userName);
    formData.append('receiver[0].toDepartmentName', selectedUsers.deptName);
    formData.append('receiver[0].toRoleName', selectedUsers.roleName);
  }
}

export function createFormCommentDocIn(
  content: string,
  attachments: FileList | undefined,
  selectedUsers: UserDeptRoleInput[] | UserDeptRoleInput,
  userDeptRole: UserDeptRoleInput,
  jobId: string,
  replyForId?: string,
  chatId?: string,
): FormData {
  const formData = new FormData();
  if(chatId){
    formData.append('chatId', chatId);
  }
  formData.append('sender.content', content);
  let index = 0;
  while (attachments?.item(index)) {
    formData.append(`sender.attachments[${index}].attachment`, attachments[index]);
    index++;
  }

  appendUserDeptRole(formData, userDeptRole, jobId, replyForId);
  appendSelectedUser(formData, selectedUsers);

  return formData;
}

export function mapToComment(inputProcess: Process): DocComment {
  return {
    ...omit(inputProcess, 'sendType', 'readTime'),
    chatId: inputProcess.id,
    fromUserId: inputProcess.senderId,
    fromDepartmentId: inputProcess.senderDeptId,
    fromRoleId: inputProcess.senderRoleId,
    fromUserName: inputProcess.senderName,
    fromDepartmentName: inputProcess.senderDeptName,
    fromRoleName: inputProcess.senderRoleName,
    toUserId: inputProcess.receiverId,
    toDepartmentId: inputProcess.receiverDeptId,
    toRoleId: inputProcess.receiverRoleId,
    toUserName: inputProcess.receiverName,
    toDepartmentName: inputProcess.receiverDeptName,
    toRoleName: inputProcess.receiverRoleName,
    createdTime: inputProcess.sendTime,
    attachments: inputProcess.attachments,
    receivers: [],
    content: inputProcess.note || '',
    commentType: 'log',
    sendTime: inputProcess.sendTime
  };
}