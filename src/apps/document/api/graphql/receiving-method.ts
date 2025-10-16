import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchReceivingMethod(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
      query ($keyword: String, $pageable: Pageable) {
        searchReceivingMethod(keyword: $keyword, pageable: $pageable) {
          totalCount
          edges {
            node {
              id
              name
              code
              status
            }
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

function getReceivingMethodById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getReceivingMethodById(id: $id) {
          id
          code
          name
          status
          norder
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

function getAllReceivingMethod() {
  return useQuery(
    gql`
      query getAllReceivingMethod {
        getAllReceivingMethod {
          id
          code
          name
          status
        }
      }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveReceivingMethod() {
  return useMutation(
    gql`
      mutation saveReceivingMethod($receivingMethod: ReceivingMethodInput) {
        saveReceivingMethod(receivingMethod: $receivingMethod) {
          id
          code
          name
          status
          norder
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteReceivingMethod() {
  return useMutation(
    gql`
      mutation deleteReceivingMethod($id: String) {
        deleteReceivingMethod(id: $id) {
          id
          code
          name
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function maxNOrderReceivingMethod() {
  return useQuery(
    gql`
      query maxOrderActiveReceivingMethod {
        maxOrderActiveReceivingMethod
      }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteReceivingMethod,
  getAllReceivingMethod,
  getReceivingMethodById,
  maxNOrderReceivingMethod,
  saveReceivingMethod,
  searchReceivingMethod,
};
