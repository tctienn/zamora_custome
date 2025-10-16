import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { EmployeeFilter } from '@/apps/hrm/model/employee';
import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function employeeShifts(filter: EmployeeFilter, pageable: Pageable) {
  return useQuery(
    gql`
      query employeeShifts($filter: EmployeeFilter!, $pageable: Pageable) {
        employeeShifts(filter: $filter, pageable: $pageable) {
          totalCount
          edges {
            node {
              employeeId
              code
              fullName
              avatar
              totalHours
              workingDay
              jobTitle
              organizationId
              organizationName
              shifts {
                code
                name
              }
            }
          }
        }
      }
    `,
    {
      filter,
      pageable
    },
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );

}

function saveEmployeeShift() {
  return useMutation(
    gql`
      mutation saveEmployeeShift($employeeId: String!, $shiftCodes: [String]!) {
        saveEmployeeShift(employeeId: $employeeId, shiftCodes: $shiftCodes) 
      }
    `,
    {
      fetchPolicy: 'network-only',
      clientId: HRM_CLIENT_ID,
    }
  );
}

export { employeeShifts, saveEmployeeShift };