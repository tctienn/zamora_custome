import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findByGroupId(groupId: string) {
  return useQuery(
    gql`query findByGroupId($groupId: String) {
            findByGroupId(groupId: $groupId) {
                id {
                    groupId
                    path
                    userId
                }
                permission
            }
        }`, { groupId },
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function save() {
  return useMutation(
    gql`mutation save($inputData: [FileFolderPermissionInput]) {
            save(inputData: $inputData) {
                id {
                    groupId
                    path
                    userId
                }
                permission
            }
        }`,
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findByGroupIdAndPath(groupId: string, path: string) {
  return useQuery(
    gql`query findByGroupIdAndPath($groupId: String, $path: String) {
            findByGroupIdAndPath(groupId: $groupId, path: $path) {
                id{
                    groupId
                    path
                    userId
                }
                permission
            }
        }`, {
      groupId,
      path
    },
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findByIdGroupIdAndIdUserIdAndIdPath(groupId: string, userId: string, path: string) {
  return useQuery(
    gql`query findByIdGroupIdAndIdUserIdAndIdPath($groupId: String, $userId: String, $path: String){
            findByIdGroupIdAndIdUserIdAndIdPath(groupId: $groupId, userId: $userId, path: $path){
                id{
                    groupId
                    path
                    userId
                }
                permission
            }
        }`, {
      groupId,
      userId,
      path
    },
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { findByGroupId, findByGroupIdAndPath, findByIdGroupIdAndIdUserIdAndIdPath, save };
