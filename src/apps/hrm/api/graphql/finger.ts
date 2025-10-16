import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function fingerUsers(keyword: string, pageable: Pageable) {
  return useQuery(
    gql`
      query fingerUsers($keyword: String, $pageable: Pageable) {
      fingerUsers(keyword: $keyword, pageable: $pageable) {
        totalCount
          edges {
            node {
              id
              name
              enabled
            }
          }
        }
      }
    `,
    {
      keyword,
      pageable
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function syncFingerUsers() {
  return useMutation(
    gql`
      mutation syncFingerUsers {
        syncFingerUsers
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function syncFingerData() {
  return useMutation(
    gql`
      mutation syncFingerData {
        syncFingerData
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  fingerUsers,
  syncFingerData,
  syncFingerUsers
};