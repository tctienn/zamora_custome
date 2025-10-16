import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { TICKET_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchAirline(data: { searchInput: object; pageable: object }) {
  return useQuery(
    gql`
      query SearchAirline($searchInput: SearchInput, $pageable: Pageable) {
        searchAirline(searchInput: $searchInput, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            id
            code
            name
            sortOrder
            type
            status
            createdBy
            createdTime
            logoFile {
                id
                downloadPath
            }
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

function getNextAirlineSortOrder() {
  return useQuery(
    gql`
      query GetNextAirlineSortOrder {
          getNextAirlineSortOrder
      }
    `,
    {},
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAirlineById(id: string) {
  return useQuery(
    gql`
      query GetDetailAirlineById($id: String!) {
        getDetailAirlineById(id: $id) {
            id
            code
            name
            sortOrder
            type
            logoFile {
              id
              downloadPath
            }
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

function deleteAirline() {
  return useMutation(
    gql`
        mutation deleteAirline($id: String!) {
            deleteAirline(id: $id)
        }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllAirline() {
  return useQuery(
    gql`
      query GetAllAirline {
        getAllAirline {
          id
          code
          name
          type
          sortOrder
          status
          createdBy
          createdTime
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

function deleteAirlineLogo() {
  return useMutation(
    gql`
        mutation DeleteAirlineLogo($id: String!) {
            deleteAirlineLogo(id: $id)
        }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteAirline,
  deleteAirlineLogo,
  getAirlineById,
  getAllAirline,
  getNextAirlineSortOrder,
  searchAirline
};
