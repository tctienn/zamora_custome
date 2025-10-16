import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getShareInformation(fileFolderId: string, isFolder: boolean) {
  return useQuery(
    gql`
            query ($fileFolderId: String!, $isFolder: Boolean!) {
                shareInformation(fileFolderId: $fileFolderId, isFolder: $isFolder) {
                    path
                    type
                    defaultPermission
                    sharedUserId
                    sharedUsers {
                        userId
                        fullName
                        permission
                    }
                }
            }
        `,
    {
      fileFolderId,
      isFolder
    },
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function getSearchShareUsers(keyword: string) {
  return useQuery(
    gql`
            query ($keyword: String!) {
                searchShareUsers(keyword:$keyword){
                    userId
                    fullName
                    permission
                    email
                }
            }`,
    { keyword },
    { clientId: ECM_CLIENT_ID }
  );
}

function saveShareInformation() {
  return useMutation(
    gql(`
      mutation($info: ShareInfoInput!){
        saveShareInfo(info: $info){
          path
        }
      }
    `),
    { clientId: ECM_CLIENT_ID }
  );
}

function deleteShareInformation() {
  return useMutation(
    gql(`
                mutation deleteShareInformation($path: String!){
                    deleteShareInformation(path: $path)
                }
    `),
    { clientId: ECM_CLIENT_ID }
  );
}

function getSharedFileGraphql(fileId: string) {
  return useQuery(
    gql`
            query ($fileId: String!) {
                sharedFile(fileId: $fileId) {
                    id
                    name
                    extension
                    treePath
                    size
                    tags
                    lastModifiedAt
                    isDeleted
                    personal
                }
            }`,
    { fileId },
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function getSharedFileFolderInFolderGraphql(folderId: string) {
  return useQuery(
    gql`
            query ($folderId: String!) {
                sharedFileFolderInFolder(folderId: $folderId) {
                    folders {
                        id
                        name
                        tags
                        treePath
                        lastModifiedAt
                        isDeleted
                    }
                    files {
                        id
                        name
                        extension
                        treePath
                        size
                        tags
                        lastModifiedAt
                        isDeleted
                        statusComment
                    }
                }
            }`,
    { folderId },
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function findByIdFileFolderIdAndIdIsFolder(fileFolderId: string, isFolder: boolean) {
  return useQuery(
    gql`query findByIdFileFolderIdAndIdIsFolder($fileFolderId: String, $isFolder: Boolean){
            findByIdFileFolderIdAndIdIsFolder(fileFolderId: $fileFolderId,isFolder: $isFolder ){
                id{
                    fileFolderId
                    isFolder
                    userId
                }
                permission
                sharedTime
                sharedUserId
                type
            }
        }`,
    {
      fileFolderId,
      isFolder
    },
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

function getSharedInformation(fileFolderId: string, isFolder: boolean) {
  return useQuery(
    gql`query getSharedInformation($fileFolderId: String, $isFolder: Boolean){
            getSharedInformation(fileFolderId: $fileFolderId,isFolder: $isFolder ){
                email
                fullName
                id
                username
                permission
            }
        }`,
    {
      fileFolderId,
      isFolder
    },
    {
      fetchPolicy: 'network-only',
      clientId: ECM_CLIENT_ID
    }
  );
}

export {
  deleteShareInformation,
  findByIdFileFolderIdAndIdIsFolder,
  getSearchShareUsers,
  getSharedFileFolderInFolderGraphql,
  getSharedFileGraphql,
  getSharedInformation,
  getShareInformation,
  saveShareInformation
};
