import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

export enum DocumentType {
  INCOMING_DOC = 'INCOMING_DOC',
  OUTGOING_DOC = 'OUTGOING_DOC',
  SUBMIT_DOC = 'SUBMIT_DOC',
}

export enum FieldType {
  TEXT = 'TEXT',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
}

function getAllOCRConfigs(docType: string) {
  return useQuery(
    gql`
      query getAllOCRConfigs($docType: DocumentType) {
        getAllOCRConfigs(docType: $docType) {
          id
          name
          field
          regex
          type
        }
      }
    `,
    { docType },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveOCRConfigs() {
  return useMutation(
    gql`
      mutation saveOCRConfigs(
        $configs: [OCRConfigModel]
        $typeDoc: DocumentType
      ) {
        saveOCRConfigs(configs: $configs, typeDoc: $typeDoc)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteOCRConfig() {
  return useMutation(
    gql`
      mutation deleteOCRConfig($id: String) {
        deleteOCRConfig(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { deleteOCRConfig, getAllOCRConfigs, saveOCRConfigs };
