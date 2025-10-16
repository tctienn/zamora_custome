import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getEmailConfigurationGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
            query ($keyword: String!, $pageable: Pageable) {
                emailConfigurations(keyword: $keyword, pageable: $pageable) {
                    totalCount
                    edges {
                        node {
                            id
                            name
                            server
                            protocol
                            port
                            account
                            description
                            status,
                            templateTypes
                        }
                    }
                }
            }
        `,
    { ...data },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveEmailConfigurationGraphql() {
  return useMutation(
    gql`
            mutation ($id: String!, $emailConfigurationInput: EmailConfigurationInput!) {
                saveEmailConfiguration(id: $id, emailConfigurationInput: $emailConfigurationInput) {
                    id
                    server
                    protocol
                    port
                    account
                    status
                }
            }
        `, { clientId: ADMIN_CLIENT_ID });
}

function toggleEmailConfigurationStatusGraphql() {
  return useMutation(
    gql`
            mutation ($id: String!) {
                toggleEmailConfigurationStatus(id: $id) {
                    id
                    server
                    protocol
                    port
                    account
                    status
                }
            }
        `, { clientId: ADMIN_CLIENT_ID });
}

function deleteEmailConfigurationGraphql() {
  return useMutation(
    gql`
            mutation ($id: String!) {
                deleteEmailConfiguration(id: $id) {
                    id
                    server
                    protocol
                    port
                    account
                    status
                }
            }
        `, { clientId: ADMIN_CLIENT_ID });
}

export {
  deleteEmailConfigurationGraphql,
  getEmailConfigurationGraphql,
  saveEmailConfigurationGraphql,
  toggleEmailConfigurationStatusGraphql
};
