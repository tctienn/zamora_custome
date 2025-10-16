import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type {
  VehicleDispatchOrderSearchModel,
  VehicleLogSearchModel,
} from '@/apps/vehicle/model/vehicleDispatchOrder';
import { VEHICLE_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchVehicleDispatchOrderByKeyword(data: {
  searchModel: VehicleDispatchOrderSearchModel;
  pageable: object;
}) {
  return useQuery(
    gql`
      query searchVehicleDispatchOrder(
        $searchModel: VehicleDispatchOrderSearchModel
        $pageable: Pageable
      ) {
        searchVehicleDispatchOrder(
          searchModel: $searchModel
          pageable: $pageable
        ) {
          totalCount
          edges {
            node {
              id
              numDispatchOrder
              numTicket
              bookingDate
              createdDate
              userBooking
              numberUsers
              departureDate
              expectedReturnDate
              bookingVehicleType
              externalVehicleBranch
              externalVehicleCard
              externalVehicleInfo
              vehicleId
              users
              driverPhoneNumber
              numKm
              fuelCost
              roadCost
              onSitePlace
              departurePoint
              destination
              reson
              note
              licensePlate
              driver
              numberOfSeats
              vehicleBranch
              status
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

function searchVehicleLog(data: {
  searchModel: VehicleLogSearchModel;
  pageable: object;
}) {
  return useQuery(
    gql`
      query searchVehicleLog(
        $searchModel: VehicleLogSearchModel
        $pageable: Pageable
      ) {
        searchVehicleLog(searchModel: $searchModel, pageable: $pageable) {
          totalCount
          edges {
            node {
              id
              numDispatchOrder
              numTicket
              bookingDate
              createdDate
              userBooking
              numberUsers
              departureDate
              expectedReturnDate
              bookingVehicleType
              externalVehicleBranch
              externalVehicleCard
              externalVehicleInfo
              vehicleId
              users
              driverPhoneNumber
              numKm
              fuelCost
              roadCost
              onSitePlace
              departurePoint
              destination
              reson
              note
              licensePlate
              driver
              numberOfSeats
              vehicleBranch
              status
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

function getVehicleDispatchOrderById(id: string) {
  return useQuery(
    gql`
      query ($id: String!) {
        getVehicleDispatchOrderById(id: $id) {
          id
          numDispatchOrder
          numTicket
          bookingDate
          createdDate
          userBooking
          numberUsers
          departureDate
          expectedReturnDate
          bookingVehicleType
          externalVehicleBranch
          externalVehicleCard
          externalVehicleInfo
          vehicleId
          users
          numKm
          fuelCost
          roadCost
          driverPhoneNumber
          onSitePlace
          departurePoint
          destination
          reson
          note
          licensePlate
          driver
          numberOfSeats
          vehicleBranch
          kmEstimate
          kmReality
          gasolineEstimate
          gasolineReality
          costEstimate
          costReality
          kmInitial
          kmEnd
          status
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

function deleteVehicleDispatchOrder() {
  return useMutation(
    gql`
      mutation deleteVehicleDispatchOrder($id: String!) {
        deleteVehicleDispatchOrder(id: $id)
      }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllVehicleDispatchOrder() {
  return useQuery(
    gql`
      query getAllVehicleDispatchOrder {
        getAllVehicleDispatchOrder {
          id
          numDispatchOrder
          numTicket
          bookingDate
          createdDate
          userBooking
          numberUsers
          departureDate
          expectedReturnDate
          bookingVehicleType
          externalVehicleBranch
          externalVehicleCard
          externalVehicleInfo
          vehicleId
          users
          numKm
          fuelCost
          roadCost
          onSitePlace
          departurePoint
          destination
          reson
          note
          licensePlate
          driver
          driverPhoneNumber
          numberOfSeats
          vehicleBranch
          status
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

function saveVehicleDispatchOrder() {
  return useMutation(
    gql`
      mutation saveVehicleDispatchOrder(
        $vehicleDispatchOrderInput: VehicleDispatchOrderInput
      ) {
        saveVehicleDispatchOrder(
          vehicleDispatchOrderInput: $vehicleDispatchOrderInput
        )
      }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countDispatchOrderByStatus() {
  return useQuery(
    gql`
      query countDispatchOrderByStatus {
        countDispatchOrderByStatus {
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

function changeDispatchOrderStatus() {
  return useMutation(
    gql`
      mutation changeDispatchOrderStatus($id: String!) {
        changeDispatchOrderStatus(id: $id)
      }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  changeDispatchOrderStatus,
  countDispatchOrderByStatus,
  deleteVehicleDispatchOrder,
  getAllVehicleDispatchOrder,
  getVehicleDispatchOrderById,
  saveVehicleDispatchOrder,
  searchVehicleDispatchOrderByKeyword,
  searchVehicleLog,
};
