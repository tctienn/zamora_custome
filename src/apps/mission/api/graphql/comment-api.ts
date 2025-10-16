import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MISSION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

export function getListUserRelatedToJobId(jobId: string) {
  return useLazyQuery(
    gql`
      query GetListUserRelatedToJobId($jobId: String){
        getListUserRelatedToJobId(jobId:$jobId) {
            jobId
            userId
            userName
            userDepartmentId
            userDepartmentName
            userRoleId
            userRoleName
            jobRole
        }
      }
      `,
    { jobId },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getListJobChatByJobId(jobId: string) {
  return useQuery(
    gql`
          query GetListJobChatByJobId($jobId: String){
              getListJobChatByJobId(jobId: $jobId) {
                  chatId
                  jobId
                  fromUserId
                  fromUserName
                  fromDepartmentId
                  fromDepartmentName
                   fromRoleId
                  fromRoleName
                  replyForChatId
                  content
                  sendTime
                  toUserId
                  toUserName
                  toDepartmentId
                  toDepartmentName
                  toRoleId
                  toRoleName
                  sendTime
                  attachments {
                      id
                      attachment
                      size
                      fileExtension
                      downloadPath
                  }
                }
              }
      `,
    { jobId },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function deleteJobChatByChatId() {
  return useMutation(
    gql`
      mutation DeleteJobChatByChatId($chatId: String) {
        deleteJobChatByChatId(chatId: $chatId)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function deleteJobChatFileAttachment() {
  return useMutation(
    gql`
      mutation DeleteJobChatFileAttachment($id: String, $chatId: String) {
        deleteJobChatFileAttachment(id: $id, chatId: $chatId)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}