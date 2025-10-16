import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { VEHICLE_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchVehicleByKeyword(data: { keyword: string; organizationId: string; pageable: object }) {
  return useQuery(
    gql`
        query searchVehicleByKeyword(
            $keyword: String
            $numberOfSeats: Int
            $organizationId: String
            $pageable: Pageable
        ) {
            searchVehicleByKeyword(
                keyword: $keyword
                numberOfSeats: $numberOfSeats
                organizationId: $organizationId
                pageable: $pageable
            ) {
                totalCount
                edges {
                    node {
                        id
                        licensePlate
                        vehicleBranch
                        vehicleType
                        yearOfManufacture
                        norder
                        numberOfSeats
                        status
                        frameNumber
                        engineNumber
                        vehicleStatus
                        usagePurpose
                        origin
                        color
                        transmission
                        organizationId
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
        query maxNOrderVehicle {
            maxNOrderVehicle
        }
    `,
    {},
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getVehicleById(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getVehicleById(id: $id) {
                id
                licensePlate
                vehicleBranch
                vehicleType
                yearOfManufacture
                norder
                numberOfSeats
                status
                isAvailable
                frameNumber
                engineNumber
                color
                registrationCertificateNumber
                fuelType
                hasAirportSecurityCard
                inspectionDate
                registrationPeriod
                vehicleStatus
                usagePurpose
                origin
                transmission
                organizationId
                images {
                    id
                    objectId
                    objectType
                    extension
                    name
                    path
                    size
                }
                registrationCertificateFrontImg {
                    id
                    objectId
                    objectType
                    extension
                    name
                    path
                    size
                }
                registrationCertificateBackImg {
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

function deleteVehicle() {
  return useMutation(
    gql`
        mutation deleteVehicle($id: String!) {
            deleteVehicle(id: $id)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllVehicle() {
  return useQuery(
    gql`
        query getAllVehicle {
            getAllVehicle {
                id
                licensePlate
                vehicleBranch
                vehicleType
                yearOfManufacture
                norder
                numberOfSeats
                status
                frameNumber
                engineNumber
                vehicleStatus
                usagePurpose
                origin
                transmission
                color
                organizationId
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

function getAllVehicleByOrganizationId(
  organizationId?: string, bookingCarId?: string
) {
  return useQuery(
    gql`
        query getAllVehicleByOrganizationId(
            $organizationId: String
            $bookingCarId: String
        ) {
            getAllVehicleByOrganizationId(
                organizationId: $organizationId
                bookingCarId: $bookingCarId
            ) {
                id
                licensePlate
                vehicleBranch
                vehicleType
                yearOfManufacture
                norder
                frameNumber
                engineNumber
                numberOfSeats
                status
                vehicleStatus
                usagePurpose
                origin
                transmission
                color
                hasAirportSecurityCard
                organizationId
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

function getExpiringOrExpiredVehicles(
  organizationId: string
) {
  return useQuery(
    gql`
        query getExpiringOrExpiredVehicles(
            $organizationId: String
        ) {
            getExpiringOrExpiredVehicles(
                organizationId: $organizationId
            ) {
                id
                licensePlate
                vehicleBranch
                vehicleType
                yearOfManufacture
                norder
                frameNumber
                engineNumber
                numberOfSeats
                status
                vehicleStatus
                usagePurpose
                origin
                transmission
                color
                hasAirportSecurityCard
                organizationId
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
  deleteVehicle,
  getAllVehicle,
  getAllVehicleByOrganizationId,
  getExpiringOrExpiredVehicles,
  getVehicleById,
  maxNOrder,
  searchVehicleByKeyword
};
