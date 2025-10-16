import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findRoleByUserId(userId: string) {
  return useLazyQuery(
    gql`
      query findRoleByUserId($userId: String) {
        findRoleByUserId(userId: $userId)
      }
    `,
    { userId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveRoleDefault() {
  return useMutation(
    gql`
      mutation saveRoleDefault($roleDefault: RoleDefault) {
        saveRoleDefault(roleDefault: $roleDefault)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { findRoleByUserId, saveRoleDefault };
