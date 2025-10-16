import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getIncomingFlowIdByDeptId(id: string) {
  return useQuery(
    gql`
      query getIncomingFlowIdByDeptId($id: String) {
        getIncomingFlowIdByDeptId(id: $id)
      }
    `,
    { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getOutgoingFlowIdByDeptId(id: string) {
  return useQuery(
    gql`
      query getOutgoingFlowIdByDeptId($id: String) {
        getOutgoingFlowIdByDeptId(id: $id)
      }
    `,
    { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllDeptIds() {
  return useQuery(
    gql`
      query getAllDeptIds {
        getAllDeptIds
      }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveDefaultFlowConfig() {
  return useMutation(
    gql`
      mutation saveDefaultFlowConfig(
        $incomingFlowId: String
        $outgoingFlowId: String
        $deptId: String
      ) {
        saveDefaultFlowConfig(
          incomingFlowId: $incomingFlowId
          outgoingFlowId: $outgoingFlowId
          deptId: $deptId
        ) {
          id
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  getAllDeptIds,
  getIncomingFlowIdByDeptId,
  getOutgoingFlowIdByDeptId,
  saveDefaultFlowConfig,
};
