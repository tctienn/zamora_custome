import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID, DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function administrativeUserOrganizationRoles() {
  return useLazyQuery(
    gql`
      query {
        userOrganizationRoles {
          id
          userId
          organization {
            id
            name
            code
            type
          }
          role {
            code
            name
            permissions
          }
        }
      }
    `,
    {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function userOrganizationRoles() {
  return useLazyQuery(
    gql`
      query {
        userOrganizationRoles {
          id
          userId
          organization {
            id
            name
            code
            type
          }
          role {
            code
            name
            permissions
          }
        }
      }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getDelegateRoles() {
  return useLazyQuery(
    gql`
      query {
        delegateRoles {
          id
          userId
          organization {
            id
            name
            code
            type
          }
          role {
            code
            name
            permissions
          }
          delegateId
        }
      }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  administrativeUserOrganizationRoles,
  getDelegateRoles,
  userOrganizationRoles
};