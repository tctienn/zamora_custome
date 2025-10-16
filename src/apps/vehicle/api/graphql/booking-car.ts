import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { VEHICLE_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchBookingCar(data: {
  searchModel: any;
  pageable: object;
}) {
  return useQuery(
    gql`
        query searchBookingCar(
            $searchModel: BookingCarSearchModel
            $pageable: Pageable
        ) {
            searchBookingCar(searchModel: $searchModel, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        numTicket
                        createdDate
                        userBooking
                        numberUsers
                        departureDate
                        expectedReturnDate
                        userId
                        companion
                        numKm
                        priority
                        status
                        fuelCost
                        roadCost
                        norder
                        onSitePlace
                        departurePoint
                        destination
                        reson
                        otherCost
                        note
                        status
                        userPhone
                        accompanyingDepartment
                        flowId
                        driverPhone
                        licensePlate
                        organizationId
                        actualTimeEnded
                        actualDepartureTime
                        organizationParentId
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
        query maxNOrderBookingCar {
            maxNOrderBookingCar
        }
    `,
    {},
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getBookingCarById(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getBookingCarById(id: $id) {
                id
                numTicket
                createdDate
                userBooking
                numberUsers
                departureDate
                expectedReturnDate
                userId
                companion
                numKm
                priority
                fuelCost
                roadCost
                status
                norder
                onSitePlace
                departurePoint
                destination
                reson
                otherCost
                note
                noteDispatchOrder
                driverSource
                licensePlate
                driver
                numDispatchOrderCreatedDate
                numDispatchOrder
                userPhone
                accompanyingDepartment
                flowId
                driverPhone
                accompanyingDepartmentName
                organizationId
                organizationParentId
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

function getBookingCarByNumTicket(numTicket: string) {
  return useQuery(
    gql`
        query ($numTicket: String!) {
            getBookingCarByNumTicket(numTicket: $numTicket) {
                id
                numTicket
                createdDate
                userBooking
                numberUsers
                departureDate
                expectedReturnDate
                userId
                companion
                priority
                numKm
                fuelCost
                roadCost
                norder
                onSitePlace
                departurePoint
                destination
                reson
                status
                note
                otherCost
                userPhone
                accompanyingDepartment
                flowId
                driverPhone
                organizationId
                organizationParentId
            }
        }
    `,
    { numTicket },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteBookingCar() {
  return useMutation(
    gql`
        mutation deleteBookingCar($id: String!) {
            deleteBookingCar(id: $id)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function setTimeActualOfTheTrip() {
  return useMutation(
    gql`
        mutation setTimeActualOfTheTrip($id: String!) {
            setTimeActualOfTheTrip(id: $id)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveDispatchOrder() {
  return useMutation(
    gql`
        mutation saveDispatchOrder($bookingCar: BookingCarInput) {
            saveDispatchOrder(bookingCar: $bookingCar)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function changeStatus() {
  return useMutation(
    gql`
        mutation changeStatus($id: String, $newStatus: BookingCarStatus) {
            changeStatus(id: $id, newStatus: $newStatus) {
                id
            }
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteBookingCarAttachment() {
  return useMutation(
    gql`
        mutation deleteBookingCarAttachment($id: String!) {
            deleteBookingCarAttachment(id: $id)
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllBookingCar() {
  return useQuery(
    gql`
        query getAllBookingCar {
            getAllBookingCar {
                id
                numTicket
                createdDate
                userBooking
                numberUsers
                departureDate
                expectedReturnDate
                userId
                companion
                numKm
                fuelCost
                priority
                roadCost
                norder
                onSitePlace
                departurePoint
                destination
                reson
                note
                otherCost
                status
                userPhone
                accompanyingDepartment
                flowId
                driverPhone
                organizationId
                organizationParentId
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

function getNumTicketNotExistInDispatchOrder() {
  return useQuery(
    gql`
        query getNumTicketNotExistInDispatchOrder {
            getNumTicketNotExistInDispatchOrder {
                id
                numTicket
                createdDate
                userBooking
                numberUsers
                departureDate
                expectedReturnDate
                userId
                companion
                numKm
                priority
                fuelCost
                roadCost
                norder
                onSitePlace
                departurePoint
                destination
                reson
                note
                status
                otherCost
                userPhone
                accompanyingDepartment
                flowId
                driverPhone
                organizationId
                organizationParentId
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

function getAllBookingCarByStatus() {
  return useQuery(
    gql`
        query getAllBookingCarByStatus {
            getAllBookingCarByStatus {
                id
                numTicket
                createdDate
                userBooking
                numberUsers
                departureDate
                expectedReturnDate
                userId
                companion
                numKm
                fuelCost
                priority
                roadCost
                otherCost
                norder
                onSitePlace
                departurePoint
                destination
                reson
                note
                userPhone
                status
                accompanyingDepartment
                flowId
                driverPhone
                organizationId
                organizationParentId
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

function countBookingCarByStatus() {
  return useQuery(
    gql`
        query countBookingCarByStatus {
            countBookingCarByStatus {
                status
                count
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

function getBookingCarAttachments(bookingCarId: string) {
  return useQuery(
    gql`
        query getBookingCarAttachments($bookingCarId: String!) {
            getBookingCarAttachments(bookingCarId: $bookingCarId) {
                id
                bookingCarId
                quote
                attachment {
                    name
                    path
                    size
                }
            }
        }
    `,
    { bookingCarId },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getSummaryDashboard(organizationId: string, year: number) {
  return useQuery(
    gql`
        query getSummaryDashboard($organizationId: String, $year: Int) {
            getSummaryDashboard(organizationId: $organizationId, year: $year)
        }
    `,
    {
      organizationId,
      year
    },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function summaryCarBookingsByUnit(organizationId: string, year: number) {
  return useQuery(
    gql`
        query summaryCarBookingsByUnit($organizationId: String, $year: Int) {
            summaryCarBookingsByUnit(organizationId: $organizationId, year: $year)
        }
    `,
    {
      organizationId,
      year
    },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findFreeAndBusyVehiclesToday(organizationId: string) {
  return useQuery(
    gql`
        query findFreeAndBusyVehiclesToday($organizationId: String) {
            findFreeAndBusyVehiclesToday(organizationId: $organizationId) {
                freeVehicles {
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
                }
                busyVehicles {
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
                }
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

function summaryDriverStatistics(organizationId: string, year: number) {
  return useQuery(
    gql`
        query summaryDriverStatistics($organizationId: String, $year: Int) {
            summaryDriverStatistics(organizationId: $organizationId, year: $year)
        }
    `,
    {
      organizationId,
      year
    },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function summaryCarStatistics(organizationId: string, year: number) {
  return useQuery(
    gql`
        query summaryCarStatistics($organizationId: String, $year: Int) {
            summaryCarStatistics(organizationId: $organizationId, year: $year)
        }
    `,
    {
      organizationId,
      year
    },
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findBookingCarByOrganizationId(organizationId: string) {
  return useQuery(
    gql`
        query findBookingCarByOrganizationId($organizationId: String) {
            findBookingCarByOrganizationId(organizationId: $organizationId) {
                id
                numTicket
                createdDate
                userBooking
                numberUsers
                departureDate
                expectedReturnDate
                userId
                companion
                numKm
                priority
                fuelCost
                roadCost
                status
                norder
                onSitePlace
                departurePoint
                destination
                reson
                otherCost
                note
                noteDispatchOrder
                driverSource
                licensePlate
                driver
                numDispatchOrderCreatedDate
                numDispatchOrder
                userPhone
                accompanyingDepartment
                flowId
                driverPhone
                accompanyingDepartmentName
                organizationId
                organizationParentId
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
  changeStatus,
  countBookingCarByStatus,
  deleteBookingCar,
  deleteBookingCarAttachment,
  findBookingCarByOrganizationId,
  findFreeAndBusyVehiclesToday,
  getAllBookingCar,
  getAllBookingCarByStatus,
  getBookingCarAttachments,
  getBookingCarById,
  getBookingCarByNumTicket,
  getNumTicketNotExistInDispatchOrder,
  getSummaryDashboard,
  maxNOrder,
  saveDispatchOrder,
  searchBookingCar,
  setTimeActualOfTheTrip,
  summaryCarBookingsByUnit, summaryCarStatistics,
  summaryDriverStatistics
};
