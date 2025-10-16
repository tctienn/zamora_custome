import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getGroupGraphql(groupId: string) {
  return useQuery(
    gql`
        query($id: String) {
            getUserGroup(id: $id) {
                id,
                name
                status
                users {
                    id
                    level
                    fullName
                    email
                }
            }
        }
    `, { id: groupId }
    , {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getGroupGraphql };