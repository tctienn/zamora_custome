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
                    organizationCode
                    organizationName
                }
            }
        `, {}
    , {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllUserMoreInfoGraphql() {
  return useQuery(
    gql`
            query getAllUserMoreInfo{
                getAllUserMoreInfo{
                    id
                    employeeId
                    fullName
                    username
                    email
                    avatar
                    birthDay
                    phone
                    positionName
                    employeeId
                    departments{
                        code
                        name
                    }
                }
            }
        `, {}
    , {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getActiveUsersGraphql, getAllUserMoreInfoGraphql };