import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAllGroupReceivingDocuments(data: { keyword: string | null }) {
  return useQuery(
    gql`
      query ($keyword: String) {
        getAllGroupReceivingDocuments(keyword: $keyword) {
          id
          name
          code
          status
          users {
            id
            userId
            roleId
            deptId
            userName
            username
            deptName
            roleName
            phone
            email
          }
        }
      }
    `,
    { ...data },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getGroupReceivingDocumentsById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getGroupReceivingDocumentsById(id: $id) {
          id
          code
          name
          status
          users {
            id
            userId
            roleId
            deptId
            userName
            username
            deptName
            roleName
            phone
            email
          }
        }
      }
    `,
    { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveGroupReceivingDocuments() {
  return useMutation(
    gql`
      mutation saveGroupReceivingDocuments(
        $groupReceivingDocuments: GroupReceivingDocumentsInput
      ) {
        saveGroupReceivingDocuments(
          groupReceivingDocuments: $groupReceivingDocuments
        )
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteGroupReceivingDocuments() {
  return useMutation(
    gql`
      mutation deleteGroupReceivingDocuments($id: String) {
        deleteGroupReceivingDocuments(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteGroupReceivingDocuments,
  getAllGroupReceivingDocuments,
  getGroupReceivingDocumentsById,
  saveGroupReceivingDocuments,
};
