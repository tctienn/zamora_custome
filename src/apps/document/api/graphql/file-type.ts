import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAllFileTypes(data: { keyword: string | null }) {
  return useQuery(
    gql`
      query ($keyword: String) {
        getAllFileTypes(keyword: $keyword) {
          id
          name
          code
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

function getFileTypeById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getFileTypeById(id: $id) {
          id
          code
          name
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

function saveFileType() {
  return useMutation(
    gql`
      mutation saveFileType($fileType: FileTypeInput) {
        saveFileType(fileType: $fileType)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteFileType() {
  return useMutation(
    gql`
      mutation deleteFileType($id: String) {
        deleteFileType(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { deleteFileType, getAllFileTypes, getFileTypeById, saveFileType };
