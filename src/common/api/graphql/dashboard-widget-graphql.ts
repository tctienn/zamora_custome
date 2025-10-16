import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getGroupNotesUserInGraphql() {
  return useQuery(
    gql`
        query {
            groupUserIn {
                id
                name
                notes {
                    id
                    content
                    pinned
                    createdAt
                    isDeleted
                }
            }
        }`, {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function countGroupNotesUserInGraphql() {
  return useQuery(
    gql`
            query {
                countGroupNotes
            }`, {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getChatConversationsGraphql() {
  return useQuery(
    gql`
            query {
                chatConversations {
                    id
                    name
                    avatar
                    isGroup
                    lastMessage {
                        sentAt
                    }
                }
            }
        `, {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only' 
    }
  );
}

export { countGroupNotesUserInGraphql, getChatConversationsGraphql, getGroupNotesUserInGraphql };