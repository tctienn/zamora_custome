import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchDocTemplateByKeyword(data: {
  keyword: string;
  pageable: object;
}) {
  return useQuery(
    gql`
      query ($keyword: String, $pageable: Pageable) {
        searchDocTemplateByKeyword(keyword: $keyword, pageable: $pageable) {
          totalCount
          edges {
            node {
              id
              deptId
              signal
              docTemplateName
              description
              docTemplateType
              status
              createdTime
              createdBy
            }
          }
        }
      }
    `,
    { ...data },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getDocTemplateById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        findDocTemplateById(id: $id) {
          id
          deptId
          signal
          docTemplateName
          description
          docTemplateType
          status
          createdTime
          createdBy
        }
      }
    `,
    { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteDocTemplate() {
  return useMutation(
    gql`
      mutation deleteDocTemplate($id: String) {
        deleteDocTemplate(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { deleteDocTemplate, getDocTemplateById, searchDocTemplateByKeyword };
