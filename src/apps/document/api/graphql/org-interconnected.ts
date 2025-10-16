import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchOrgInterconnected(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
      query ($keyword: String, $pageable: Pageable) {
        searchOrgInterconnected(keyword: $keyword, pageable: $pageable) {
          totalCount
          edges {
            node {
              id
              code
              name
              parentUnit
              identify
              signatory
              address
              email
              phone
              fax
              domainName
              lock
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

function getOrgInterconnectedById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getOrgInterconnectedById(id: $id) {
          id
          code
          name
          norder
          parentUnit
          identify
          signatory
          address
          email
          phone
          fax
          domainName
          lock
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

function getAllOrgInterconnected() {
  return useQuery(
    gql`
      query getAllOrgInterconnected {
        getAllOrgInterconnected {
          id
          code
          name
          norder
          parentUnit
          identify
          signatory
          address
          email
          phone
          fax
          domainName
          lock
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

function saveOrgInterconnected() {
  return useMutation(
    gql`
      mutation saveOrgInterconnected(
        $orgInterconnected: OrgInterconnectedInput
      ) {
        saveOrgInterconnected(orgInterconnected: $orgInterconnected) {
          id
          code
          name
          norder
          parentUnit
          identify
          signatory
          address
          email
          phone
          fax
          domainName
          lock
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteOrgInterconnected() {
  return useMutation(
    gql`
      mutation deleteOrgInterconnected($id: String) {
        deleteOrgInterconnected(id: $id) {
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

function maxNOrderOrgInterconnected() {
  return useQuery(
    gql`
      query maxOrderActiveOrgInterconnected {
        maxOrderActiveOrgInterconnected
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
  deleteOrgInterconnected,
  getAllOrgInterconnected,
  getOrgInterconnectedById,
  maxNOrderOrgInterconnected,
  saveOrgInterconnected,
  searchOrgInterconnected,
};
