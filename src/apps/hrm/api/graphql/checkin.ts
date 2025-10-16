import { useLazyQuery, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function checkInAndOutByDate(date: string) {
  return useQuery(
    gql`
        query checkInAndOutByDate($date: Date!) {
            checkInAndOutByDate(date: $date) {
                employeeId
                personId
                firstCheckin
                lastCheckout
            }
        }`,
    { date },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function listCheckInByDateAndEmployeeId(date: string, employeeId: string) {
  return useQuery(
    gql`
        query listCheckInByDateAndEmployeeId($date: Date!, $employeeId: String!) {
            listCheckInByDateAndEmployeeId(date: $date, employeeId: $employeeId) {
                id
                employeeId
                detectedImageUrl
                placeName
                timeStamp
            }
        }`,
    {
      date,
      employeeId
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countGuestByDate(date: string) {
  return useQuery(
    gql`
      query countGuestByDate($date: Date!) {
        countGuestByDate(date: $date)
      }`,
    { date },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getGuestByDate() {
  return useLazyQuery(
    gql`
        query getGuestByDate($date: Date!) {
            getGuestByDate(date: $date) {
              id
              employeeId
              detectedImageUrl
              placeName
              timeStamp
            }
        }`,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  checkInAndOutByDate,
  countGuestByDate,
  getGuestByDate,
  listCheckInByDateAndEmployeeId
};