import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function findByUserSupport(
  userDeptRole: UserDeptRoleInput
) {
  return useQuery(
    gql`
          query findByUserSupport($userDeptRole: UserDeptRole!) {
              findByUserSupport(userDeptRole: $userDeptRole) {
                  id
                  userId
                  userSupportId
                  supportType
                  supportPermission
                  supportsPermission
                  orgType
                  roleId
                  deptId
              }
          }
      `,
    { userDeptRole },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { findByUserSupport };
