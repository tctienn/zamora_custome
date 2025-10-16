import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveDocumentTempConfig() {
  return useMutation(
    gql`
          mutation saveDocumentTempConfig($config:DocumentTempConfigModelInput){
              saveDocumentTempConfig(config:$config){
                  id
                  name
                  __typename
              }
          }
      `, {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { saveDocumentTempConfig };
