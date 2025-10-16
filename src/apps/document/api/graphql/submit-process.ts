import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findSubmitProcessById(processId: string) {
  return useQuery(
    gql`
          query findSubmitProcessById($processId: String!) {
              findSubmitProcessById(processId:$processId){
                  id
                  docSubmitId
                  senderDeptId
                  flowInstanceId
                  stepId
                  isComplete
                  processType
                  senderId
                  senderDeptId
              }
          }
      `, { processId: processId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findLastProcessByDocSubmitId(docId: string, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
          query findLastProcessByDocSubmitId($docId: String!,$userDeptRole:UserDeptRole) {
              findLastProcessByDocSubmitId(docId:$docId,userDeptRole: $userDeptRole){
                  id
                  docSubmitId
                  senderDeptId
                  flowInstanceId
                  stepId
                  isComplete
                  processType
                  senderId
                  senderDeptId
              }
          }
      `, {
      docId: docId,
      userDeptRole: userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getProcessByDocSubmitId(docId: string) {
  return useQuery(
    gql`
        query getProcessByDocSubmitId($docId: String){
            getProcessByDocSubmitId(docId: $docId){
                id
                docSubmitId
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
                deadlineDate
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
      `, { docId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { findLastProcessByDocSubmitId, findSubmitProcessById, getProcessByDocSubmitId };