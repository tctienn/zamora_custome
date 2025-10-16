import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchOrgOut(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
      query ($keyword: String, $pageable: Pageable) {
        searchOrgOut(keyword: $keyword, pageable: $pageable) {
          totalCount
          edges {
            node {
              id
              orgOutCode
              orgOutIdentify
              orgOutName
              address
              email
              isSendToEsb
              isDeleted
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

function getOrgOutById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getOrgOutById(id: $id) {
          id
          orgOutCode
          orgOutIdentify
          orgOutName
          address
          email
          isSendToEsb
          isDeleted
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

function getOrgOut() {
  return useQuery(
    gql`
      query getOrgOut {
        getOrgOut {
          id
          orgOutCode
          orgOutIdentify
          orgOutName
          address
          email
          isSendToEsb
          isDeleted
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

function saveOrgOut() {
  return useMutation(
    gql`
      mutation saveOrgOut($orgOut: OrgOutInput) {
        saveOrgOut(orgOut: $orgOut) {
          id
          orgOutCode
          orgOutIdentify
          orgOutName
          address
          email
          isSendToEsb
          isDeleted
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteOrgOut() {
  return useMutation(
    gql`
      mutation deleteOrgOut($id: String) {
        deleteOrgOut(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { deleteOrgOut, getOrgOut, getOrgOutById, saveOrgOut, searchOrgOut };
