import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getChatConversationsGraphql() {
  return useQuery(
    gql`
            query {
                chatConversations {
                    id
                    name
                    creatorId
                    adminIds
                    avatar
                    isGroup
                    members
                    totalAttachment
                }
            }
        `, {},
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function getChatConversationAttachmentsGraphql(conversationId: string) {
  return useQuery(
    gql`
            query ($conversationId: String!) {
                chatConversationAttachments(conversationId: $conversationId) {
                    id
                    name
                    path
                    size
                    sender
                    sentAt
                }
            }
        `, { conversationId },
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function getChatAttachmentGraphql(attachmentId: string) {
  return useQuery(
    gql`
            query ($attachmentId: String!) {
                chatAttachment(attachmentId: $attachmentId) {
                    id
                    name
                    path
                    size
                }
            }
        `, { attachmentId },
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function saveChatAttachmentToPersonnelGraphql() {
  return useMutation(
    gql`
        mutation ($attachmentId: String!) {
            saveToPersonnel(attachmentId: $attachmentId) {
                id
                name
                size
                treePath
                folderId
                createdAt
                createdBy
                lastModifiedAt
                lastModifiedBy
                extension
            }
        }
    `, { clientId: ECM_CLIENT_ID },
  );
}

function saveChatAttachmentToGroupGraphql() {
  return useMutation(
    gql`
        mutation ($attachmentId: String!, $groupId: String!) {
            saveToGroup(attachmentId: $attachmentId, groupId: $groupId) {
                id
                name
                size
                treePath
                folderId
                createdAt
                createdBy
                lastModifiedAt
                lastModifiedBy
                extension
            }
        }
    `, { clientId: ECM_CLIENT_ID },
  );
}

export {
  getChatAttachmentGraphql,
  getChatConversationAttachmentsGraphql,
  getChatConversationsGraphql,
  saveChatAttachmentToGroupGraphql,
  saveChatAttachmentToPersonnelGraphql
};