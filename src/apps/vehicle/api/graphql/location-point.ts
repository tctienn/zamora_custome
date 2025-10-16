import { useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { VEHICLE_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function searchLocationPoint(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
      query searchLocationPoint($keyword: String, $pageable: Pageable) {
        searchLocationPoint(keyword: $keyword, pageable: $pageable) {
          totalCount
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    { ...data },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getLocationPointById(id: string) {
  return useQuery(
    gql`
      query ($id: String!) {
        getLocationPointById(id: $id) {
          id
          name
        }
      }
    `,
    { id },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteLocationPoint() {
  return useMutation(
    gql`
      mutation deleteLocationPoint($id: String!) {
        deleteLocationPoint(id: $id)
      }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllLocationPoint() {
  return useQuery(
    gql`
      query getAllLocationPoint {
        getAllLocationPoint {
          id
          name
        }
      }
    `,
    {},
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveLocationPoint() {
  return useMutation(
    gql`
      mutation saveLocationPoint($locationPointInput: LocationPointInput) {
        saveLocationPoint(locationPointInput: $locationPointInput)
      }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteLocationPoint,
  getAllLocationPoint,
  getLocationPointById,
  saveLocationPoint,
  searchLocationPoint,
};
