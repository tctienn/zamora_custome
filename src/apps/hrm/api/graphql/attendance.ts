import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function attendanceInMonth(employeeId: string, date: string) {
  return useQuery(
    gql`
        query attendanceInMonth($employeeId: String!, $date: Date!) {
            attendanceInMonth(employeeId: $employeeId, date: $date) {
                id
                employeeId
                date
                shiftCode
                startTime
                checkIn
                symbol
                workingDay
                totalHours
            }
        }
    `,
    {
      employeeId,
      date,
    },
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

function attendances() {
  return useLazyQuery(
    gql`
        query attendances($employeeId: String!, $date: Date!) {
            attendances(employeeId: $employeeId, date: $date) {
                id
                employeeId
                shiftName
                shiftCode
                startTime
                endTime
                workingDay
                totalHours
                checkIn
                checkOut
                location
                date
                type
                symbol
                note
            }
        }
    `,
    {},
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

function attendanceByShift() {
  return useLazyQuery(
    gql`
        query attendanceByShift($employeeId: String!, $date: Date!, $shiftCode: String!) {
            attendanceByShift(employeeId: $employeeId, date: $date, shiftCode: $shiftCode) {
                id
                employeeId
                shiftName
                shiftCode
                startTime
                endTime
                workingDay
                totalHours
                checkIn
                checkOut
                location
                date
                type
                symbol
                note
            }
        }
    `,
    {},
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

function setSymbolManual() {
  return useMutation(
    gql`
        mutation setSymbolManual($employeeId: String!, $date: Date!, $shiftCode: String!, $symbol: String!) {
            setSymbolManual(employeeId: $employeeId, date: $date, shiftCode: $shiftCode, symbol: $symbol)
        }
    `,
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

export {
  attendanceByShift,
  attendanceInMonth,
  attendances,
  setSymbolManual
};