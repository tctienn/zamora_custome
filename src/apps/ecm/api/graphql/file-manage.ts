import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

enum ServiceType {
  PERSON, PERSON_RECENT, PERSON_TRASH, SHARED, GROUP, GROUP_TRASH, ADMIN_TRASH
}

function getRootFolderId(type: ServiceType | undefined, id: string) {
  return useQuery(
    gql`
            query ($type: ServiceType!, $id: String!) {
                rootFolder(type: $type, id: $id) {
                    id
                }
            }
        `,
    {
      type: ServiceType[type ? type : ServiceType.PERSON],
      id
    }, { fetchPolicy: 'network-only' }
  );
}

function listFoldersAndFiles(type: ServiceType | undefined, folderId: string) {
  return useQuery(
    gql`
            query ($type: ServiceType!, $folderId: String!) {
                listFoldersAndFiles(type: $type, folderId: $folderId) {
                    folders {
                        id
                        name
                        tags
                        isImportant
                        treePath
                        lastModifiedAt
                        isDeleted
                        isShare
                        createdBy
                    }
                    files {
                        id
                        name
                        extension
                        treePath
                        size
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                        isShare
                        createdBy
                        statusComment
                        isComment
                    }
                }
            }
        `,
    {
      type: ServiceType[type ? type : ServiceType.PERSON],
      folderId
    },
    { fetchPolicy: 'network-only' }
  );
}

function findFileFolderByKeyword() {
  return useLazyQuery(
    gql`
      query findFileFolderByKeyword($type:ServiceType!, $folderId: String!, $keyword: String){
          findFileFolderByKeyword(type: $type, folderId: $folderId, keyword: $keyword){
              folders {
                  id
                  name
                  tags
                  isImportant
                  treePath
                  lastModifiedAt
                  isDeleted
                  isShare
                  createdBy
              }
              files {
                  id
                  name
                  extension
                  treePath
                  size
                  tags
                  isImportant
                  lastModifiedAt
                  isDeleted
                  isShare
                  createdBy
                  statusComment
                  isComment
              }
          }
      }
        `,
    {},
    { fetchPolicy: 'network-only' }
  );
}

function getTreePath(type: ServiceType | undefined, folderId: string) {
  return useQuery(
    gql`
            query ($type: ServiceType!, $folderId: String!) {
                treePath(type: $type, folderId: $folderId) {
                    path
                    pathId
                }
            }`,
    {
      type: ServiceType[type ? type : ServiceType.PERSON],
      folderId
    }, { fetchPolicy: 'network-only' }
  );
}

function createFolder() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $name: String!, $parentFolderId: String!) {
                createFolder(type: $type, name: $name, parentFolderId: $parentFolderId) {
                    id
                    name
                    tags
                    treePath
                    isDeleted
                }
            }`
  );
}

function rename() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $id: String!, $name: String!, $isFolder: Boolean!) {
                rename(type: $type, id: $id, name: $name, isFolder: $isFolder) {
                    id
                    name
                    treePath
                    ... on File {
                        extension
                        size
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                    ... on Folder {
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                }
            }`
  );
}

function moveMultiple() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $ids: [FileFolderId!], $targetFolderId: String!) {
                moveMultiple(type: $type, ids: $ids, targetFolderId: $targetFolderId) {
                    id
                    name
                    treePath
                    ... on File {
                        extension
                        size
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                    ... on Folder {
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                }
            }`
  );
}

function copyMultiple() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $ids: [FileFolderId!], $targetFolderId: String!) {
                copyMultiple(type: $type, ids: $ids, targetFolderId: $targetFolderId) {
                    id
                    name
                    treePath
                    ... on File {
                        extension
                        size
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                    ... on Folder {
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                }
            }`
  );
}

function trashMultiple() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $ids: [FileFolderId!]) {
                moveToTrashMultiple(type: $type, ids: $ids) {
                    id
                    name
                    treePath
                    ... on File {
                        extension
                        size
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                    ... on Folder {
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                }
            }`
  );
}

function del() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $id: String!, $isFolder: Boolean!) {
                delete(type: $type, id: $id, isFolder: $isFolder) {
                    id
                    name
                    treePath
                    ... on File {
                        extension
                        size
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                    ... on Folder {
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                }
            }`
  );
}

function dels() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $ids: [FileFolderId!]) {
                deletes(type: $type, ids: $ids) {
                    id
                    name
                    treePath
                    ... on File {
                        extension
                        size
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                    ... on Folder {
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                }
            }`
  );
}

function restores() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $ids: [FileFolderId!]) {
                restores(type: $type, ids: $ids) {
                    id
                    name
                    treePath
                    ... on File {
                        extension
                        size
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                    ... on Folder {
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                }
            }`
  );
}

function createEmptyFileGraphql() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $name: String!, $fileType: BlankFileType!, $folderId: String!) {
                createEmptyFile(type: $type, name: $name, fileType: $fileType, folderId: $folderId) {
                    id
                    name
                    treePath
                    extension
                    size
                    tags
                    lastModifiedAt
                    isDeleted
                }
            }`
  );
}

function getFileVersionsGraphql(type: ServiceType, fileId: string) {
  return useQuery(
    gql`
            query ($type: ServiceType!, $fileId: String!) {
                fileVersions(type: $type, fileId: $fileId) {
                    time
                    userId
                    user {
                        username
                        fullName
                    }
                    action
                    md5
                    version
                }
            }
        `,
    {
      type: ServiceType[type],
      fileId
    },
    { fetchPolicy: 'network-only' }
  );
}

function getCurrentFileVersionGraphql(type: ServiceType, fileId: string) {
  return useQuery(
    gql`
            query ($type: ServiceType!, $fileId: String!) {
                currentFileVersion(type: $type, fileId: $fileId)
            }
        `,
    {
      type: ServiceType[type],
      fileId
    },
    { fetchPolicy: 'network-only' }
  );
}

function revertGraphql() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $fileId: String!, $md5: String!) {
                revert(type: $type, fileId: $fileId, md5: $md5)
            }`
  );
}

function toggleImportantGraphql() {
  return useMutation(
    gql`
            mutation ($type: ServiceType!, $ids: [FileFolderId!], $mark: Boolean) {
                toggleImportant(type: $type, ids: $ids, mark: $mark) {
                    id
                    name
                    treePath
                    ... on File {
                        extension
                        size
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                        statusComment
                    }
                    ... on Folder {
                        tags
                        isImportant
                        lastModifiedAt
                        isDeleted
                    }
                }
            }`
  );
}

function getCapacity(type: ServiceType, folderId: string, groupId?: string) {
  return useQuery(
    gql`
            query getCapacity($type: ServiceType!,$folderId: String!, $groupId: String){
                getCapacity(type: $type,folderId: $folderId, groupId: $groupId){
                    total
                    used
                }
            }
        `, {
      type: ServiceType[type],
      folderId,
      groupId
    }, { fetchPolicy: 'network-only' }
  );
}

function getDocumentDashboard(userId: string, total: number) {
  return useQuery(
    gql`
            query getDocumentDashboard($userId: String, $total: Int){
                getDocumentDashboard(userId: $userId, total: $total){
                    documentRecent{
                        files{
                            id
                            name
                            extension
                            size
                            lastModifiedAt
                            treePath
                        }
                    }
                    documentShared{
                        files{
                            id
                            name
                            extension
                            size
                            lastModifiedAt
                            treePath
                        }
                    }
                    myDocument{
                        files{
                            id
                            name
                            extension
                            size
                            lastModifiedAt
                            treePath
                        }
                    }
                    numberDocumentRecent
                    numberDocumentShared
                    numberMyDocument
                }
            }
        `, {
      userId,
      total
    }, { fetchPolicy: 'network-only' }
  );
}

export {
  copyMultiple,
  createEmptyFileGraphql,
  createFolder,
  del,
  dels,
  findFileFolderByKeyword,
  getCapacity,
  getCurrentFileVersionGraphql,
  getDocumentDashboard,
  getFileVersionsGraphql,
  getRootFolderId,
  getTreePath,
  listFoldersAndFiles,
  moveMultiple,
  rename,
  restores,
  revertGraphql,
  ServiceType,
  toggleImportantGraphql,
  trashMultiple
};
