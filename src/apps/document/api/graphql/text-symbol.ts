import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getTextSymbolByDeptId(id: string) {
  return useQuery(
    gql`
      query getTextSymbolByDeptId($id: String) {
        getTextSymbolByDeptId(id: $id)
      }
    `,
    { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveTextSymbol() {
  return useMutation(
    gql`
      mutation saveTextSymbol($textSymbol: String, $deptId: String) {
        saveTextSymbol(textSymbol: $textSymbol, deptId: $deptId)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { getTextSymbolByDeptId, saveTextSymbol };
