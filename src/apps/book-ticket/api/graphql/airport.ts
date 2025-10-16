import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { TICKET_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchAirport(data: { searchInput: object; pageable: object }) {
  return useQuery(
    gql`
      query SearchAirport($searchInput: SearchInput, $pageable: Pageable) {
        searchAirport(searchInput: $searchInput, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            id
            code
            name
            sortOrder
            countryName
            cityName
            status
            isDefault
            createdBy
            createdTime
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

function getNextAirportSortOrder() {
  return useQuery(
    gql`
      query GetNextAirportSortOrder {
          getNextAirportSortOrder
      }
    `,
    {},
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAirportById(id: string) {
  return useQuery(
    gql`
      query GetDetailAirportById($id: String!) {
        getDetailAirportById(id: $id) {
            id
            code
            name
            sortOrder
            countryId
            cityId
            isDefault
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

function deleteAirport() {
  return useMutation(
    gql`
        mutation deleteAirport($id: String!) {
            deleteAirport(id: $id)
        }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveAirport() {
  return useMutation(
    gql`
      mutation SaveAirport($input: SaveAirportReq) {
        saveAirport(saveAirportReq: $input)
      }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function setAirportDefault() {
  return useMutation(
    gql`
      mutation SetAirportDefault($id: String!) {
        setAirportDefault(id: $id)
      }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function getAllAirport() {
  return useQuery(
    gql`
      query GetAllAirport {
        getAllAirport {
          id
          code
          name
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
  deleteAirport,
  getAirportById,
  getAllAirport,
  getNextAirportSortOrder,
  saveAirport,
  searchAirport,
  setAirportDefault
};
