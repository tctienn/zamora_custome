import { omit } from 'lodash';
import moment from 'moment';

import { CommentSendType, type DocComment, ObjectTypeEnum } from '@/apps/document/model/comment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { Process } from '@/apps/document/model/process/process';
import { DateTimeFormat } from '@/common/constants';
import { diffDurationDates } from '@/common/helpers/time-util';

export function findChildren(comments: DocComment[], comment: DocComment): DocComment[] {
  return comments.filter(c => comment.receivers?.some(c2 => c2.id === c.replyForId));
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
    && e.fromDeptId === currentComment.fromDeptId
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

function appendUserDeptRole(formData: FormData, userDeptRole: UserDeptRoleInput) {
  formData.append('userDeptRole.userId', userDeptRole.userId);
  formData.append('userDeptRole.userName', userDeptRole.userName);
  formData.append('userDeptRole.deptId', userDeptRole.deptId);
  formData.append('userDeptRole.deptName', userDeptRole.deptName);
  formData.append('userDeptRole.roleId', userDeptRole.roleId);
  formData.append('userDeptRole.roleName', userDeptRole.roleName);
  formData.append('userDeptRole.type', userDeptRole.type);
}

function appendSelectedUser(formData: FormData,
  selectedUsers: UserDeptRoleInput[] | UserDeptRoleInput,
  commentSendType: CommentSendType,
  docId: string,
  objectType: ObjectTypeEnum,
  isPrivate: boolean,
  replyForId?: string) {
  if (Array.isArray(selectedUsers)) {
    selectedUsers.forEach((user, index) => {
      formData.append(`receivers[${index}].toUserId`, user.userId);
      formData.append(`receivers[${index}].toDeptId`, user.deptId);
      formData.append(`receivers[${index}].toRoleId`, user.roleId);
      formData.append(`receivers[${index}].sendTime`, moment(new Date()).format(DateTimeFormat.ISO_LOCAL_DATE));
      formData.append(`receivers[${index}].sendType`, commentSendType);
      formData.append(`receivers[${index}].objectId`, docId);
      formData.append(`receivers[${index}].objectType`, objectType);
      formData.append(`receivers[${index}].toUserName`, user.userName);
      formData.append(`receivers[${index}].toDeptName`, user.deptName);
      formData.append(`receivers[${index}].toRoleName`, user.roleName);
      formData.append(`receivers[${index}].isPrivate`, isPrivate.toString());
    });
  } else {
    formData.append('receiver.toUserId', selectedUsers.userId);
    formData.append('receiver.toDeptId', selectedUsers.deptId);
    formData.append('receiver.toRoleId', selectedUsers.roleId);
    formData.append('receiver.sendTime', moment(new Date()).format(DateTimeFormat.ISO_LOCAL_DATE));
    formData.append('receiver.sendType', commentSendType);
    formData.append('receiver.objectId', docId);
    formData.append('receiver.objectType', objectType);
    formData.append('receiver.replyForId', replyForId || '');
    formData.append('receiver.toUserName', selectedUsers.userName);
    formData.append('receiver.toDeptName', selectedUsers.deptName);
    formData.append('receiver.toRoleName', selectedUsers.roleName);
    formData.append('receiver.isPrivate', isPrivate.toString());
  }
}

export function createFormCommentDocIn(
  content: string,
  attachments: FileList | undefined,
  selectedUsers: UserDeptRoleInput[] | UserDeptRoleInput,
  commentSendType: CommentSendType = CommentSendType.CHAT,
  userDeptRole: UserDeptRoleInput,
  docId: string,
  isPrivate: boolean,
  replyForId?: string,
): FormData {
  const formData = new FormData();
  formData.append('contentComment.content', content);
  let index = 0;
  while (attachments?.item(index)) {
    formData.append(`contentComment.lstAttachmentModel[${index}]`, attachments[index]);
    index++;
  }

  appendUserDeptRole(formData, userDeptRole);
  appendSelectedUser(formData, selectedUsers, commentSendType, docId, ObjectTypeEnum.VB_DEN, isPrivate, replyForId);

  return formData;
}

export function createFormCommentDocOut(
  content: string,
  attachments: FileList | undefined,
  selectedUsers: UserDeptRoleInput[] | UserDeptRoleInput,
  commentSendType: CommentSendType = CommentSendType.CHAT,
  userDeptRole: UserDeptRoleInput,
  docId: string,
  isPrivate: boolean,
  replyForId?: string,
): FormData {
  const formData = new FormData();
  formData.append('contentComment.content', content);
  let index = 0;
  while (attachments?.item(index)) {
    formData.append(`contentComment.lstAttachmentModel[${index}]`, attachments[index]);
    index++;
  }

  appendUserDeptRole(formData, userDeptRole);
  appendSelectedUser(formData, selectedUsers, commentSendType, docId, ObjectTypeEnum.VB_DI, isPrivate, replyForId);

  return formData;
}

export function createFormCommentDocSubmit(
  content: string,
  attachments: FileList | undefined,
  selectedUsers: UserDeptRoleInput[] | UserDeptRoleInput,
  commentSendType: CommentSendType = CommentSendType.CHAT,
  userDeptRole: UserDeptRoleInput,
  docId: string,
  isPrivate: boolean,
  replyForId?: string,
): FormData {
  const formData = new FormData();
  formData.append('contentComment.content', content);
  let index = 0;
  while (attachments?.item(index)) {
    formData.append(`contentComment.lstAttachmentModel[${index}]`, attachments[index]);
    index++;
  }

  appendUserDeptRole(formData, userDeptRole);
  appendSelectedUser(formData, selectedUsers, commentSendType, docId, ObjectTypeEnum.PHIEU_TRINH, isPrivate, replyForId);

  return formData;
}

export function mapToComment(inputProcess: Process): DocComment {
  return {
    ...omit(inputProcess, 'sendType', 'readTime'),
    id: inputProcess.id,
    fromUserId: inputProcess.senderId,
    fromDeptId: inputProcess.senderDeptId,
    fromRoleId: inputProcess.senderRoleId,
    fromUserName: inputProcess.senderName,
    fromDeptName: inputProcess.senderDeptName,
    fromRoleName: inputProcess.senderRoleName,
    toUserId: inputProcess.receiverId,
    toDeptId: inputProcess.receiverDeptId,
    toRoleId: inputProcess.receiverRoleId,
    toUserName: inputProcess.receiverName,
    toDeptName: inputProcess.receiverDeptName,
    toRoleName: inputProcess.receiverRoleName,
    createdTime: inputProcess.sendTime,
    attachments: inputProcess.attachments,
    receivers: [],
    content: inputProcess.note || '',
    commentType: 'log',
    sendTime: inputProcess.sendTime
  };
}