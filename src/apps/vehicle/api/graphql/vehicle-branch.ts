import { useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { VEHICLE_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function searchVehicleBranch(data: { keyword: string }) {
  return useQuery(
    gql`
        query searchVehicleBranch($keyword: String) {
            searchVehicleBranch(keyword: $keyword) {
                totalCount
                edges {
                    node {
                        id
                        code
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

function getVehicleBranchById(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getVehicleBranchById(id: $id) {
                id
                code
                name
                logo {
                    id
                    objectId
                    objectType
                    extension
                    name
                    path
                    size
                }
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

function deleteVehicleBranch() {
  return useMutation(
    gql`
        mutation deleteVehicleBranch($id: String!) {
            deleteVehicleBranch(id: $id)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllVehicleBranch() {
  return useQuery(
    gql`
        query getAllVehicleBranch {
            getAllVehicleBranch {
                id
                code
                name
                countVehicleModel
                logo {
                    id
                    objectId
                    objectType
                    extension
                    name
                    path
                    size
                }
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

function saveVehicleModel() {
  return useMutation(
    gql`
        mutation saveVehicleModel($vehicleModelInput: VehicleModelInput) {
            saveVehicleModel(vehicleModelInput: $vehicleModelInput)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteVehicleModel() {
  return useMutation(
    gql`
        mutation deleteVehicleModel($id: String!) {
            deleteVehicleModel(id: $id)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllVehicleModel() {
  return useQuery(
    gql`
        query getAllVehicleModel {
            getAllVehicleModel {
                id
                code
                name
                vehicleBranch
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

function getAllVehicleModelByBranch(vehicleBranch: string) {
  return useQuery(
    gql`
        query getAllVehicleModelByBranch($vehicleBranch: String) {
            getAllVehicleModelByBranch(vehicleBranch: $vehicleBranch) {
                id
                code
                name
                vehicleBranch
            }
        }
    `,
    { vehicleBranch },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getVehicleModelById(id: string) {
  return useQuery(
    gql`
        query getVehicleModelById($id: String!) {
            getVehicleModelById(id: $id) {
                id
                code
                name
                vehicleBranch
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

export {
  deleteVehicleBranch,
  deleteVehicleModel,
  getAllVehicleBranch,
  getAllVehicleModel,
  getAllVehicleModelByBranch,
  getVehicleBranchById,
  getVehicleModelById,
  saveVehicleModel,
  searchVehicleBranch
};
