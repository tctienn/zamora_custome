import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getGroupUserInGraphql() {
  return useQuery(
    gql`
            query {
                groupUserIn {
                    id
                    name
                    description
                    createDate
                    groupType
                    status
                    avatar
                    typeOfPrivacy
                    users {
                        id
                        level
                        fullName
                        email
                        groupId
                    }
                    typeOfPrivacy
                }
            }`, {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getGroupUserInGraphql };