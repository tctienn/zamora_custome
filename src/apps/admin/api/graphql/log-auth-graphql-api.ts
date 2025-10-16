import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getLogAuthGraphql(data: { pageable: object }) {
  return useQuery(
    gql`
        query getLogAuth($pageable: Pageable){
            getLogAuth(pageable: $pageable){
                totalCount
                edges{
                    node{
                        id
                        userId
                        userName
                        email
                        fullName
                        time
                        ip
                        actionType
                        resultType
                    }
                }
            }
        }
    `, { ...data },
    { clientId: ADMIN_CLIENT_ID }
  );
}

function getSummaryCountLogByOrgId(organizationId: any) {
  return useQuery(
    gql`
        query getSummaryCountLogByOrgId($organizationId: String){
            getSummaryCountLogByOrgId(organizationId: $organizationId){
                id
                name
                count
            }
        }
    `, { organizationId },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function getLoggedTodayByOrgId(organizationId: any) {
  return useQuery(
    gql`
        query getLoggedTodayByOrgId($organizationId: String){
            getLoggedTodayByOrgId(organizationId: $organizationId) {
                id
                userId
                userName
                email
                fullName
                time
                ip
                actionType
                resultType
            }
        }
    `, { organizationId },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

export { getLogAuthGraphql, getLoggedTodayByOrgId, getSummaryCountLogByOrgId };
