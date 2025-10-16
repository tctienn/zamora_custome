import { type DocComment, ObjectTypeEnum } from '@/apps/document/model/comment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_URL } from '@/common/api/configService';
import baseApi from '@/common/api/rest/baseApi';

function listComments(objectType: ObjectTypeEnum, objectId: string, isPrivate = false) {
  return baseApi.get<DocComment[]>(`${DOCUMENT_URL}/comments?objectType=${objectType}&objectId=${objectId}&isPrivate=${isPrivate}`);
}

function createChatComment(data: FormData) {
  return baseApi.postWithFile<DocComment[]>(`${DOCUMENT_URL}/comments/chat`, data);
}

function replyComment(commentId: string, data: FormData) {
  return baseApi.postWithFile<DocComment[]>(`${DOCUMENT_URL}/comments/reply/${commentId}`, data);
}

function editComment(commentId: string, editCommentModel: FormData
) {
  return baseApi.putWithFile<DocComment>(`${DOCUMENT_URL}/comments/edit/${commentId}`, editCommentModel);
}

function sendDocToGetComments(formData: FormData) {
  return baseApi.postWithFile(
    `${DOCUMENT_URL}/comments/send-doc-to-get-comments`,
    formData,
  );
}

function delComment(commentId: string,
  userDeptRole: UserDeptRoleInput
) {
  return baseApi.del<DocComment>(`${DOCUMENT_URL}/comments/delete/${commentId}`, {}, { data: userDeptRole });
}

export {
  createChatComment,
  delComment,
  editComment,
  listComments,
  replyComment,
  sendDocToGetComments
};
