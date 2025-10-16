import { useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MEETING_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function searchByKeyword(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
      query ($keyword: String, $pageable: Pageable) {
        searchTextMediaDevice(keyword: $keyword, pageable: $pageable) {
          totalCount
          edges {
            node {
              id
              name
              status
              description
              mediaOrDevice
            }
          }
        }
      }
    `,
    { ...data },
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function maxNOrder() {
  return useQuery(
    gql`
      query maxNOrderQuery {
        maxNOrderMediaDevice
      }
    `,
    {},
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getMediaDeviceById(id: string) {
  return useQuery(
    gql`
      query ($id: String!) {
        getMediaDeviceById(id: $id) {
          id
          name
          status
          description
          mediaOrDevice
          norder
          images {
            id
            objectId
            objectType
            extension
            name
            path
            size
            isDeleted
          }
        }
      }
    `,
    { id },
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteMediaDevice() {
  return useMutation(
    gql`
      mutation deleteMediaDevice($id: String!) {
        deleteMediaDevice(id: $id)
      }
    `,
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllMediaDeviceByStatusActive() {
  return useQuery(
    gql`
      query getAllActiveMediaDevices {
        getAllActiveMediaDevices {
          id
          name
          status
          description
          mediaOrDevice
        }
      }
    `,
    {},
    {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteMediaDevice,
  getAllMediaDeviceByStatusActive,
  getMediaDeviceById,
  maxNOrder,
  searchByKeyword,
};
