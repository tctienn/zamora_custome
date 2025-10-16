import { useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveConfigOrganization() {
  return useMutation(
    gql`
      mutation saveConfigOrganization($configOrganizationPayload: ConfigOrganizationPayload){
          saveConfigOrganization(configOrganizationPayload: $configOrganizationPayload){
              id
              organizationId
              ministry
              affiliatedUnit
              baseUnit
          }
      }
    `,
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findByOrganizationId(organizationId: string) {
  return useQuery(
    gql`
      query findByOrganizationId($organizationId: String){
          findByOrganizationId(organizationId: $organizationId){
              id
              organizationId
              ministry
              affiliatedUnit
              baseUnit
          }
      }
    `, { organizationId },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  findByOrganizationId,
  saveConfigOrganization
};
