import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findByDocIdAndReceiverIsDept(docId: string, deptId: string) {
  return useQuery(
    gql`
            query findByDocIdAndReceiverIsDept($docId: String!, $deptId: String!) {
                findByDocIdAndReceiverIsDept(docId: $docId, deptId: $deptId){
                    docId
                    status
                    id
                    parentId
                    actionName
                    actionType
                    completeTime
                    isComplete
                    processType
                    sendType
                    sendTime
                }
            }
        `, {
      docId: docId,
      deptId: deptId
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findByProcessId(processId: string) {
  return useQuery(
    gql`
            query findByProcessId($processId: String!) {
                findByProcessId(processId:$processId){
                    id
                    senderDeptId
                    flowInstanceId
                    stepId
                    isComplete
                    docId
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

function getAllProcessByDocIdForDrawRealFlow(docId: string | undefined, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
        query ($docId: String, $userDeptRole: UserDeptRole!) {
            getAllProcessByDocIdForDrawRealFlow(docId: $docId, userDeptRole: $userDeptRole) {
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
                deadlineDate
                deadlineNumber
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

function findLastProcessByDocId(docId: string | undefined, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
            query findLastProcessByDocId($docId: String, $userDeptRole: UserDeptRole!) {
                findLastProcessByDocId(docId: $docId, userDeptRole: $userDeptRole){
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

export {
  findByDocIdAndReceiverIsDept,
  findByProcessId,
  findLastProcessByDocId,
  getAllProcessByDocIdForDrawRealFlow
};
