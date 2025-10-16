import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { VEHICLE_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchDriverByKeyword(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
        query searchDriverByKeyword(
            $keyword: String
            $pageable: Pageable
        ) {
            searchDriverByKeyword(
                keyword: $keyword
                pageable: $pageable
            ) {
                totalCount
                edges {
                    node {
                        id
                        driverSource
                        userId
                        fullname
                        gender
                        phone
                        organizationIds
                        driverType
                        listVehicles
                        norder
                        status
                        vehicleRentalCompanyId
                        driverLicense
                        driverLicenseExpiryDate
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

function maxNOrder() {
  return useQuery(
    gql`
        query maxNOrderDriver {
            maxNOrderDriver
        }
    `,
    {},
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getDriverById(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getDriverById(id: $id) {
                id
                driverSource
                userId
                fullname
                gender
                phone
                organizationIds
                driverType
                listVehicles
                norder
                status
                vehicleRentalCompanyId
                driverLicense
                driverLicenseExpiryDate
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

function deleteDriver() {
  return useMutation(
    gql`
        mutation deleteDriver($id: String!) {
            deleteDriver(id: $id)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllDriver() {
  return useQuery(
    gql`
        query getAllDriver {
            getAllDriver {
                id
                driverSource
                userId
                fullname
                gender
                phone
                organizationIds
                driverType
                listVehicles
                norder
                status
                vehicleRentalCompanyId
                driverLicense
                driverLicenseExpiryDate
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

function saveDriver() {
  return useMutation(
    gql`
        mutation saveDriver($driverPayload: DriverPayload) {
            saveDriver(driverPayload: $driverPayload)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findFreeDriversByOrganizationId(organizationId?: string, bookingCarId?: string) {
  return useQuery(
    gql`
        query findFreeDriversByOrganizationId(
            $organizationId: String
            $bookingCarId: String
        ) {
            findFreeDriversByOrganizationId(
                organizationId: $organizationId
                bookingCarId: $bookingCarId
            ) {
                id
                driverSource
                userId
                fullname
                gender
                phone
                organizationIds
                driverType
                listVehicles
                norder
                status
                vehicleRentalCompanyId
                driverLicense
                driverLicenseExpiryDate
            }
        }
    `,
    {
      organizationId,
      bookingCarId
    },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getExpiredLicenseDriver(organizationId: string) {
  return useQuery(
    gql`
        query getExpiredLicenseDriver(
            $organizationId: String
        ) {
            getExpiredLicenseDriver(
                organizationId: $organizationId
            ) {
                id
                driverSource
                userId
                fullname
                gender
                phone
                organizationIds
                driverType
                listVehicles
                norder
                status
                vehicleRentalCompanyId
                driverLicense
                driverLicenseExpiryDate
            }
        }
    `,
    { organizationId },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteDriver,
  findFreeDriversByOrganizationId,
  getAllDriver,
  getDriverById,
  getExpiredLicenseDriver,
  maxNOrder,
  saveDriver,
  searchDriverByKeyword
};