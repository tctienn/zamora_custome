import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findFolderById(id: string) {
  return useQuery(
    gql`
            query findById($id: String!) {
                findFolderById(id: $id) {
                    id
                    name
                    treePath
                    createdAt
                    createdBy
                    lastModifiedAt
                    lastModifiedBy
                }
            }
        `,
    { id }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getTotalSizeFileByTreePath(treePath: string) {
  return useQuery(
    gql`
            query getTotalSizeFileByTreePath($treePath: String!) {
                getTotalSizeFileByTreePath(treePath: $treePath)
            }`, { treePath }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { findFolderById, getTotalSizeFileByTreePath };
