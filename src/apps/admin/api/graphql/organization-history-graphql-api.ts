import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getListOrganizationHistory(organizationId: string) {
  return useQuery(
    gql`
            query getListOrganizationHistory($organizationId: String){
                getListOrganizationHistory(organizationId: $organizationId){
                    id
                    organizationId
                    organizationName
                    type
                    fromDate
                    toDate
                }
            }
        `,
    { organizationId },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getListOrganizationHistory };
