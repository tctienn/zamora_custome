import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveEmployeePermission() {
  return useMutation(
    gql`
      mutation saveEmployeePermission($payload: EmployeePermissionPayload){
          saveEmployeePermission(payload: $payload){
              userId
              organizationIds
              organizationCodes
              functionType
          }
      }
    `,
    { clientId: HRM_CLIENT_ID }
  );
}

function getEmployeePermissionByUserId() {
  return useLazyQuery(
    gql`
      query getEmployeePermissionByUserId($userId: String, $functionType: FunctionType){
          getEmployeePermissionByUserId(userId: $userId, functionType: $functionType){
            userId
            organizationIds
            organizationCodes
            functionType
          }
      }
    `, {}, {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getEmployeePermissionByUserId, saveEmployeePermission };
