import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { SEARCH_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchMultiField() {
  return useLazyQuery(
    gql`
        query searchMultiField($input: String, $pageable: Pageable){
            searchMultiField(input: $input, pageable: $pageable){
                pageInfo{
                    startCursor
                    endCursor
                    hasPreviousPage
                    hasNextPage
                }
                totalCount
                edges{
                    node{
                        attachment{
                            id
                            attachmentId
                            fullName
                            fileName
                            content
                            objectRelate
                            module
                            filePath
                            fileExtension
                            size
                            tenantId
                        }
                        highlights{
                            field
                            values
                        }
                    }
                }
            }
        }
      `,
    {},
    {
      clientId: SEARCH_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { searchMultiField };
