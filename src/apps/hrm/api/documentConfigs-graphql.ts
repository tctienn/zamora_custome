import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchDocumentConfigsGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query searchDocumentConfigs($keyword: String, $pageable: Pageable){
            searchDocumentConfigs(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        documentCode
                        documentName
                        description
                        required
                    }
                }
            }
        }
    `, { ...data },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteDocumentConfigGraphql() {
  return useMutation(
    gql`
        mutation deleteDocumentConfig($id: Int){
            deleteDocumentConfig(id: $id)
        }
    `, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveDocumentConfigGraphql() {
  return useMutation(
    gql`
        mutation ($body: DocumentConfigInput) {
            saveDocumentConfig(body: $body) {
                id
                documentCode
                documentName
                description
                required
            }
        }
    `, { clientId: ADMIN_CLIENT_ID });
}

function getAllDocumentConfigsGraphql() {
  return useQuery(
    gql`
        query {
            getAllDocumentConfigs {
                id
                documentCode
                documentName
                description
                required
            }
        }
    `, {}, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteDocumentConfigGraphql, getAllDocumentConfigsGraphql, saveDocumentConfigGraphql, searchDocumentConfigsGraphql };

