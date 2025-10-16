import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { OrganizationType } from '@/apps/document/model/organization';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findByDocIdAndLeaderIdAndAssistantId(docId: string, leaderId: string, assistantId: string) {
  return useQuery(
    gql`
      query findByDocIdAndLeaderIdAndAssistantId($docId: String, $leaderId: String, $assistantId: String){
          findByDocIdAndLeaderIdAndAssistantId(docId: $docId, leaderId: $leaderId, assistantId: $assistantId){
              id
              docId
              leaderId
              leaderName
              assistantId
              assistantName
              priority
          }
      }
    `,
    {
      docId,
      leaderId,
      assistantId
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function savePriorityPrivate() {
  return useMutation(
    gql`
      mutation savePriorityPrivate($priorityPrivate: PriorityPrivateInput){
          savePriorityPrivate(priorityPrivate: $priorityPrivate){
              id
              docId
              leaderId
              leaderName
              assistantId
              assistantName
              priority
          }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { findByDocIdAndLeaderIdAndAssistantId, savePriorityPrivate };
