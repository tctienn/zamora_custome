import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { TICKET_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchWorkContent(data: { searchInput: object; pageable: object }) {
  return useQuery(
    gql`
      query SearchWorkContent($searchInput: SearchInput, $pageable: Pageable) {
        searchWorkContent(searchInput: $searchInput, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            id
            code
            content
            timeFrom
            timeTo
            openTicketRegistration
          }
        }
      }
    `,
    { ...data },
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only', 
    },
  );
}

function getWorkContentById(id: string) {
  return useQuery(
    gql`
      query GetDetailWorkContentById($id: String!) {
        getDetailWorkContentById(id: $id) {
            id
            code
            content
            timeFrom
            timeTo
            openTicketRegistration
        }
      }
    `,
    { id },
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function deleteWorkContent() {
  return useMutation(
    gql`
        mutation deleteWorkContent($id: String!) {
            deleteWorkContent(id: $id)
        }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveWorkContent() {
  return useMutation(
    gql`
      mutation SaveWorkContent($input: SaveWorkContentReq) {
        saveWorkContent(saveWorkContentReq: $input)
      }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllWorkContent() {
  return useQuery(
    gql`
      query GetAllWorkContent {
        getAllWorkContent {
          id
          content
        }
      }
    `,
    {},
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteWorkContent,
  getAllWorkContent,
  getWorkContentById,
  saveWorkContent,
  searchWorkContent
};
