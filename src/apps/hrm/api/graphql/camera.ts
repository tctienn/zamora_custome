import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function getCameraAccessToken() {
  return useQuery(
    gql`
        query {
            getCameraAccessToken
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function cameraPlaces() {
  return useQuery(
    gql`
        query {
            cameraPlaces {
                id
                name
                address
            }
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function syncCameraPlaces() {
  return useMutation(
    gql`
        mutation {
            syncCameraPlaces
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function cameraDevices() {
  return useQuery(
    gql`
        query {
            cameraDevices {
                id
                name
                placeId
                placeName
                useForCheckin
            }
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function syncCameraDevices() {
  return useMutation(
    gql`
        mutation {
            syncCameraDevices
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function syncCameraPersons() {
  return useMutation(
    gql`
        mutation {
            syncCameraPersons
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function searchCameraPerson(keyword: string | undefined, pageable: Pageable) {
  return useQuery(
    gql`
        query searchCameraPerson($keyword: String, $pageable: Pageable) {
            searchCameraPerson(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        name
                        employeeId
                        aliasId
                        title
                        avatar
                    }
                }
            }
        }
    `,
    {
      keyword,
      pageable,
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveCameraAccessToken() {
  return useMutation(
    gql`
        mutation saveCameraAccessToken($token: String!) {
            saveCameraAccessToken(token: $token)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function setUseForCheckin() {
  return useMutation(
    gql`
        mutation setUseForCheckin($id: String) {
            setUseForCheckin(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllMapEmployeeCamPerson(pageable: Pageable) {
  return useQuery(
    gql`
        query getAllMapEmployeeCamPerson($pageable: Pageable) {
            getAllMapEmployeeCamPerson(pageable: $pageable)
        }
    `,
    { pageable },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveMapEmployeeCamPerson() {
  return useMutation(
    gql`
        mutation saveMapEmployeeCamPerson($employeeId: String, $cameraPersonId: String) {
            saveMapEmployeeCamPerson(employeeId: $employeeId, cameraPersonId: $cameraPersonId)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteMapEmployeeCamPerson() {
  return useMutation(
    gql`
        mutation deleteMapEmployeeCamPerson($employeeId: String) {
            deleteMapEmployeeCamPerson(employeeId: $employeeId)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getUnmappedCameraPersons() {
  return useQuery(
    gql`
        query getUnmappedCameraPersons{
            getUnmappedCameraPersons {
                id
                name
                employeeId
                aliasId
                title
                avatar
            }
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  cameraDevices,
  cameraPlaces,
  deleteMapEmployeeCamPerson,
  getAllMapEmployeeCamPerson,
  getCameraAccessToken,
  getUnmappedCameraPersons,
  saveCameraAccessToken,
  saveMapEmployeeCamPerson,
  searchCameraPerson,
  setUseForCheckin,
  syncCameraDevices,
  syncCameraPersons,
  syncCameraPlaces
};