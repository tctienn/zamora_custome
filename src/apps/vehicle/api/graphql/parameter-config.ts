import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { VEHICLE_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

export function findParameterConfig() {
  return useQuery(
    gql`
        query findParameterConfig {
            findParameterConfig {
                value {
                    bookingCar {
                        enabled
                        structure
                        startValue
                        allowEdit
                    }
                    vehicleDispatchOrder {
                        enabled
                        structure
                        startValue
                        allowEdit
                    }
                    deadlineNotice {
                        carInsurance
                        vehicleRegistration
                        driverLicense
                    }
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

export function saveParameterConfig() {
  return useMutation(
    gql`
        mutation saveParameterConfig($parameterConfig: VehicleParameterInput) {
            saveParameterConfig(parameterConfig: $parameterConfig) {
                value {
                    bookingCar {
                        enabled
                        structure
                        startValue
                        allowEdit
                    }
                    vehicleDispatchOrder {
                        enabled
                        structure
                        startValue
                        allowEdit
                    }
                    deadlineNotice {
                        carInsurance
                        vehicleRegistration
                        driverLicense
                    }
                }
            }
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getBookingCarCode() {
  return useQuery(
    gql`
        query getBookingCarCode {
            getBookingCarCode
        }
    `,
    {},
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function increaseBookingCarStartValue() {
  return useMutation(
    gql`
        mutation increaseBookingCarStartValue {
            increaseBookingCarStartValue
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getVehicleDispatchOrderCode() {
  return useQuery(
    gql`
        query getVehicleDispatchOrderCode {
            getVehicleDispatchOrderCode
        }
    `,
    {},
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function increaseVehicleDispatchOrderStartValue() {
  return useMutation(
    gql`
        mutation increaseVehicleDispatchOrderStartValue {
            increaseVehicleDispatchOrderStartValue
        }
    `,
    {
      clientId: VEHICLE_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}
