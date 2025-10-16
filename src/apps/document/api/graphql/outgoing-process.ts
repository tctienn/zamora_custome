import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findOutProcessById(processId: string) {
  return useQuery(
    gql`
          query findOutProcessById($processId: String!) {
              findOutProcessById(processId:$processId){
                  id
                  senderDeptId
                  flowInstanceId
                  stepId
                  isComplete
                  docId
                  processType
              }
          }
      `, { processId: processId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findLastOutProcessByDocId(docId: string | undefined, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
          query findLastOutProcessByDocId($docId: String!, $userDeptRole: UserDeptRole!) {
              findLastOutProcessByDocId(docId: $docId, userDeptRole: $userDeptRole){
                  id
                  docId
                  stepId
                  processType
                  flowInstanceId
                  isComplete
              }
          }
      `, {
      docId,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findProcessByDocId(docId: string) {
  return useQuery(
    gql`
          query findProcessByDocId($docId: String) {
              findProcessByDocId(docId: $docId){
                id
                docId
                senderId
                senderName
                senderDeptId
                senderDeptName
                senderRoleId
                senderRoleName
                sendTime
                receiverId
                receiverName
                receiverDeptId
                receiverDeptName
                receiverRoleId
                receiverRoleName
                processType
                sendType
                status
                flowInstanceId
                stepId
                actionType
                actionName
                parentId
                isRead
                readTime
                isComplete
                completeTime
                note
                orderProcess
                delegateInfoId
                signType
                signTime
                isDeleted
                deadlineDate
              }
          }
      `, { docId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllOutProcessByDocIdForDrawRealFlow(docId: string | undefined, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
          query ($docId: String!, $userDeptRole: UserDeptRole!) {
              getAllOutProcessByDocIdForDrawRealFlow(docId: $docId, userDeptRole: $userDeptRole) {
                  id
                  docId
                  senderId
                  senderName
                  senderDeptId
                  senderDeptName
                  senderRoleId
                  senderRoleName
                  sendTime
                  receiverId
                  receiverName
                  receiverDeptId
                  receiverDeptName
                  receiverRoleId
                  receiverRoleName
                  processType
                  sendType
                  status
                  flowInstanceId
                  stepId
                  actionType
                  actionName
                  parentId
                  isRead
                  readTime
                  isComplete
                  completeTime
                  note
                  orderProcess
                  delegateInfoId
                  isDeleted

                  attachments {
                      id
                      fullName
                      fileName
                      fileExtension
                      size
                      filePath
                      attachType
                  }
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

export { findLastOutProcessByDocId, findOutProcessById, findProcessByDocId, getAllOutProcessByDocIdForDrawRealFlow };
