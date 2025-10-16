import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function configuredAttendances() {
  return useQuery(
    gql`
      query configuredAttendances {
        configuredAttendances {
          type
          enabled
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

function getDefaultAttendanceType() {
  return useQuery(
    gql`
      query {
        defaultAttendanceType
      }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function toggleDefaultAttendance() {
  return useMutation(
    gql`
      mutation toggleDefaultAttendance($type: AttendanceType!) {
        toggleDefaultAttendance(type: $type) {
          type
          enabled
        }
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

export {
  configuredAttendances,
  getDefaultAttendanceType,
  toggleDefaultAttendance
};