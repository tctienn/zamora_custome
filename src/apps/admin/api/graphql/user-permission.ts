import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveUserPermission() {
  return useMutation(
    gql`
      mutation saveUserPermission($modulePermissionPayload: UserPermissionPayload){
          saveUserPermission(modulePermissionPayload: $modulePermissionPayload){
              userId
              apps{
                  app
                  modules{
                      module
                      functions{
                          function
                          actions
                      }
                  }
              }
          }
      }
    `,
    { clientId: ADMIN_CLIENT_ID }
  );
}

function findUserPermissionByUserId(userId: string) {
  return useQuery(
    gql`
      query findUserPermissionByUserId($userId: String){
          findUserPermissionByUserId(userId: $userId){
              userId
              apps{
                  app
                  modules{
                      module
                      functions{
                          function
                          actions
                      }
                  }
              }
          }
      }
    `, { userId }, { clientId: ADMIN_CLIENT_ID }
  );
}

export { findUserPermissionByUserId, saveUserPermission };
