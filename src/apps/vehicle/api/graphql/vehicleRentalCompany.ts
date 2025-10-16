import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { VEHICLE_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchVehicleRentalCompanyByKeyword(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
        query searchVehicleRentalCompanyByKeyword(
            $keyword: String
            $pageable: Pageable
        ) {
            searchVehicleRentalCompanyByKeyword(
                keyword: $keyword
                pageable: $pageable
            ) {
                totalCount
                edges {
                    node {
                        id
                        code
                        name
                        address
                        phone
                        email
                        website
                        taxCode
                        contactPerson
                        contactPhone
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

function getVehicleRentalCompanyById(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getVehicleRentalCompanyById(id: $id) {
                id
                code
                name
                address
                phone
                email
                website
                taxCode
                contactPerson
                contactPhone
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

function deleteVehicleRentalCompany() {
  return useMutation(
    gql`
        mutation deleteVehicleRentalCompany($id: String!) {
            deleteVehicleRentalCompany(id: $id)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllVehicleRentalCompany() {
  return useQuery(
    gql`
        query getAllVehicleRentalCompany {
            getAllVehicleRentalCompany {
                id
                code
                name
                address
                phone
                email
                website
                taxCode
                contactPerson
                contactPhone
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

function saveVehicleRentalCompany() {
  return useMutation(
    gql`
        mutation saveVehicleRentalCompany($vehicleRentalCompany: VehicleRentalCompanyInput) {
            saveVehicleRentalCompany(vehicleRentalCompany: $vehicleRentalCompany)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteVehicleRentalCompany,
  getAllVehicleRentalCompany,
  getVehicleRentalCompanyById,
  saveVehicleRentalCompany,
  searchVehicleRentalCompanyByKeyword
};