import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchLeaveApplication() {
  return useLazyQuery(
    gql`
      query searchLeaveApplication($keyword: String) {
        searchLeaveApplication(keyword: $keyword) {
            id
            title
            employeeId
            leaveType
            status
            startTime
            endTime
            eFormInstanceId
            eFormCode
            workFlowId
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

export { searchLeaveApplication };