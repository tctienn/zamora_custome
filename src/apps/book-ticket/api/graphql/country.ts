import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { TICKET_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchCountry(data: { searchInput: object; pageable: object }) {
  return useQuery(
    gql`
      query SearchCountry($searchInput: SearchInput, $pageable: Pageable) {
        searchCountry(searchInput: $searchInput, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            id
            code
            name
            sortOrder
            status
            isDefault
            createdBy
            createdTime
            listCity {
              cityId
              cityName
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

function getNextCountrySortOrder() {
  return useQuery(
    gql`
      query GetNextCountrySortOrder {
          getNextCountrySortOrder
      }
    `,
    {},
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getCountryById(id: string) {
  return useQuery(
    gql`
      query GetDetailCountryById($id: String!) {
        getDetailCountryById(id: $id) {
            id
            code
            name
            sortOrder
            isDefault
            listCity {
                cityName
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

function deleteCountry() {
  return useMutation(
    gql`
        mutation deleteCountry($id: String!) {
            deleteCountry(id: $id)
        }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveCountry() {
  return useMutation(
    gql`
      mutation SaveCountry($input: SaveCountryReq) {
        saveCountry(saveCountryReq: $input)
      }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function setCountryDefault() {
  return useMutation(
    gql`
      mutation SetCountryDefault($id: String!) {
        setCountryDefault(id: $id)
      }
    `,
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function getAllCountryAndItCity() {
  return useQuery(
    gql`
      query GetAllCountryAndItCity {
        getAllCountryAndItCity {
          id
          code
          name
          status
          sortOrder
          isDefault
          createdBy
          createdTime
          listCity {
            cityId
            cityName
          }
        }
      }
    `,
    {},
    {
      clientId: TICKET_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function getAllCity() {
  return useQuery(
    gql`
      query GetAllCity {
        getAllCity {
          cityId
          cityName
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
  deleteCountry,
  getAllCity,
  getAllCountryAndItCity,
  getCountryById,
  getNextCountrySortOrder,
  saveCountry,
  searchCountry,
  setCountryDefault
};
