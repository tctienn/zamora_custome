import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAllByFileName(fileName: string | null, pageable: object) {
  return useQuery(
    gql`
      query ($fileName: String, $pageable: Pageable) {
        getAllByFileName(fileName: $fileName, pageable: $pageable) {
          id
          fileName
          fileParent
          deptIds
          fileType
          fileYear
          numOrder
          createdBy
          status
          note
          shareUser {
            userId
            permission
          }
        }
      }
    `,
    {
      fileName,
      pageable,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllFile() {
  return useQuery(
    gql`
      query getAllFile {
        getAllFile {
          id
          fileName
          fileParent
          deptIds
          fileType
          fileYear
          numOrder
          createdBy
          status
          note
          shareUser {
            userId
            permission
          }
        }
      }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getMaxFileNumOrder(userId: string, fileParentId: string) {
  return useQuery(
    gql`
      query getMaxFileNumOrder($userId: String, $fileParentId: String) {
        getMaxFileNumOrder(userId: $userId, fileParentId: $fileParentId)
      }
    `,
    {
      userId,
      fileParentId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getFileInfoById(id: string) {
  return useQuery(
    gql`
      query ($id: String) {
        getFileInfoById(id: $id) {
          id
          fileName
          fileParent
          deptIds
          fileType
          fileYear
          numOrder
          createdTime
          createdBy
          status
          note
          shareUser {
            userId
            permission
          }
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

function saveFile() {
  return useMutation(
    gql`
      mutation saveFile($file: FileModel) {
        saveFile(file: $file)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveShareUser() {
  return useMutation(
    gql`
      mutation saveShareUser($id: String, $shareUsers: [UserPermissionInput]) {
        saveShareUser(id: $id, shareUsers: $shareUsers)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveDocs() {
  return useMutation(
    gql`
      mutation saveDocs($id: String, $listDocs: [DocInFile]) {
        saveDocs(id: $id, listDocs: $listDocs)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteFile() {
  return useMutation(
    gql`
      mutation deleteFile($id: String) {
        deleteFile(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteDocInFile() {
  return useMutation(
    gql`
      mutation deleteDocInFile($id: String, $idDoc: String) {
        deleteDocInFile(id: $id, idDoc: $idDoc)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllAttachmentsByFileId(id: string) {
  return useQuery(
    gql`
      query getAllAttachmentsByFileId($id: String) {
        getAllAttachmentsByFileId(id: $id) {
          docId
          quote
          docDate
          docCode
          attachmentId
          fullName
          objectId
          fileName
          fileExtension
          filePath
          size
          createdBy
          objectType
          status
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

function getAllDocsByFileId(id: string) {
  return useQuery(
    gql`
      query getAllDocsByFileId($id: String) {
        getAllDocsByFileId(id: $id) {
          docId
          quote
          docDate
          docCode
          objectType
          status
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

export {
  deleteDocInFile,
  deleteFile,
  getAllAttachmentsByFileId,
  getAllByFileName,
  getAllDocsByFileId,
  getAllFile,
  getFileInfoById,
  getMaxFileNumOrder,
  saveDocs,
  saveFile,
  saveShareUser,
};
