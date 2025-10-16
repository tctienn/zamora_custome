import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

export function permissionsByTask(taskId: string) {
  return useQuery(
    gql`
          query ($taskId: String!) {
              permissionsByTask(taskId: $taskId)
          }
      `, { taskId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export function savePermissionConfig() {
  return useMutation(
    gql`
          mutation savePermissionConfig($config: PermissionConfigInput){
              savePermissionConfig(config:$config){
                  id
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export function searchPermissionConfig() {
  return useLazyQuery(
    gql`
          query searchPermissionConfig($permissionType: String,$roleCode: String,$userId: String){
              searchPermissionConfig(permissionType: $permissionType,roleCode: $roleCode,userId: $userId){
                  id
                  deptIds
              }
          }
      `, {}, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export function findFirstPermissionByUserId(userId: string) {
  return useLazyQuery(
    gql`
          query findFirstByUserId($userId: String){
              findFirstByUserId(userId: $userId){
                  id
                  permissionType
                  roleCode
                  userId
                  deptIds
              }
          }
      `, { userId }, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}
