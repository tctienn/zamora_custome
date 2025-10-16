import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getActiveUsersGraphql() {
  return useQuery(
    gql`
            query getAllUserStatusActive{
                getAllUserStatusActive{
                    username
                    avatar
                    email
                    fullName
                    id
                }
            }
        `, {}
    , {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getActiveUsersGraphql };