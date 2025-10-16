import { useLazyQuery, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { ObjectTypeEnum, PrivateCommentDocRequestInput } from '@/apps/document/model/comment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getCommentByDocIdAndDeptId(docId: string, deptId?: string) {
  return useQuery(
    gql`
          query getCommentByDocIdAndDeptId($docId: String!,$deptId:String){
              getCommentByDocIdAndDeptId(docId: $docId,deptId: $deptId) {
                  id
                  fromUserId
                  fromUserName
                  fromDeptId
                  fromDeptName
                  fromRoleId
                  fromRoleName
                  toUserId
                  toUserName
                  toDeptId
                  toDeptName
                  toRoleId
                  toRoleName
                  content
                  hasAttachment
                  objectType
              }
          }
      `,
    {
      docId,
      deptId
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docInRelatedUsers(docId: string, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
      query docInRelatedUsers($docId: String!, $userDeptRole: UserDeptRole!){
        docInRelatedUsers(docId:$docId, userDeptRole: $userDeptRole) {
          userId
          userName
          deptId
          deptName
          roleId
          roleName
        }
      }
      `,
    {
      docId,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function listCommentsGraphql(objectType: ObjectTypeEnum, objectId: string, isPrivate = false) {
  return useQuery(
    gql`
          query  listComments($objectType: ObjectTypeEnum!,$objectId: String!,$isPrivate: Boolean!){
              listComments(objectType:$objectType, objectId: $objectId,isPrivate: $isPrivate) {
                  id
                  fromUserId
                  fromDeptId
                  fromRoleId
                  toUserId
                  toDeptId
                  toRoleId
                  sendTime
                  sendType
                  objectId
                  objectType
                  replyForId
                  content
                  isDeleted
                  hasAttachment
                  fromUserName
                  fromDeptName
                  fromRoleName
                  toUserName
                  toDeptName
                  toRoleName
                  isRead
                  readTime
                  isCompleted
                  completeTime
                  createdTime
                  createdBy
                  lastModifiedTime
                  hasAttachment
                  isEdited

                  attachments{
                      id
                      size
                      fullName
                      fileExtension
                      fileName
                      filePath
                  }
              }
          }
      `,
    {
      objectType,
      objectId,
      isPrivate
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function listPrivateCommentsGrahql(request: PrivateCommentDocRequestInput) {
  return useLazyQuery(
    gql`
          query  listPrivateComments($request: PrivateCommentDocRequestModel){
              listPrivateComments(request:$request ) {
                  id
                  fromUserId
                  fromDeptId
                  fromRoleId
                  toUserId
                  toDeptId
                  toRoleId
                  sendTime
                  sendType
                  objectId
                  objectType
                  replyForId
                  content
                  isDeleted
                  hasAttachment
                  fromUserName
                  fromDeptName
                  fromRoleName
                  toUserName
                  toDeptName
                  toRoleName
                  isRead
                  readTime
                  isCompleted
                  completeTime
                  createdTime
                  createdBy
                  lastModifiedTime
                  hasAttachment
                  isEdited

                  attachments{
                      id
                      size
                      fullName
                      fileExtension
                      fileName
                      filePath
                  }
              }
          }
      `,
    { request },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

//DOCOUT
function docOutRelatedUsers(docId: string, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query docOutRelatedUsers($docId: String!, $userDeptRole: UserDeptRole!){
              docOutRelatedUsers(docId:$docId, userDeptRole: $userDeptRole) {
                  userId
                  userName
                  deptId
                  deptName
                  roleId
                  roleName
              }
          }
      `,
    {
      docId,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

///SUBMIT DOC
function docSubmitRelatedUsers(docId: string, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query docSubmitRelatedUsers($docId: String!, $userDeptRole: UserDeptRole!){
              docSubmitRelatedUsers(docId:$docId, userDeptRole: $userDeptRole) {
                  userId
                  userName
                  deptId
                  deptName
                  roleId
                  roleName
              }
          }
      `,
    {
      docId,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  docInRelatedUsers,
  docOutRelatedUsers,
  docSubmitRelatedUsers,
  getCommentByDocIdAndDeptId,
  listCommentsGraphql,
  listPrivateCommentsGrahql
};
