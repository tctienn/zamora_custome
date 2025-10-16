import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getEmailTemplateGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
            query ($keyword: String!, $pageable: Pageable) {
                emailTemplates(keyword: $keyword, pageable: $pageable) {
                    totalCount
                    edges {
                        node {
                            id
                            subject
                            content
                            templateType
                            status
                            isDefault
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

function getEmailTemplateParamsGraphql() {
  return useQuery(
    gql`
            query {
                emailTemplateParams {
                    type
                    params
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

function saveEmailTemplateGraphql() {
  return useMutation(
    gql`
            mutation ($id: String!, $emailTemplateInput: EmailTemplateInput!) {
                saveEmailTemplate(id: $id, emailTemplateInput: $emailTemplateInput) {
                    id
                }
            }
        `, { clientId: ADMIN_CLIENT_ID });
}

function deleteEmailTemplateGraphql() {
  return useMutation(
    gql`
            mutation ($id: String!) {
                deleteEmailTemplate(id: $id) {
                    id
                }
            }
        `, { clientId: ADMIN_CLIENT_ID });
}

function getAllTemplate() {
  return useQuery(
    gql`
            query {
                getAllTemplate {
                    templateType
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

export {
  deleteEmailTemplateGraphql,
  getAllTemplate,
  getEmailTemplateGraphql,
  getEmailTemplateParamsGraphql,
  saveEmailTemplateGraphql
};
