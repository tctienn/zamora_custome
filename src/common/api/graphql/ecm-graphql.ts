import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { EcmServiceType } from '@/common/model/ecm';

function getEcmRootFolderIdGraphql(type: EcmServiceType, folderId: string) {
  return useQuery(
    gql`
            query ($type: ServiceType!, $id: String!) {
                rootFolder(type: $type, id: $id) {
                    id
                }
            }
        `,
    {
      type: EcmServiceType[type],
      id: folderId
    }, { fetchPolicy: 'network-only' }
  );
}

function getEcmFileFolderGraphql(type: EcmServiceType, folderId: string) {
  return useQuery(
    gql`
            query ($type: ServiceType!, $folderId: String!) {
                listFoldersAndFiles(type: $type, folderId: $folderId) {
                    folders {
                        id
                        name
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
                        isImportant
                        lastModifiedAt
                        isDeleted
                        isShare
                        createdBy
                        statusComment
                    }
                }
            }
        `,
    {
      type: EcmServiceType[type],
      folderId
    },
    { fetchPolicy: 'network-only' }
  );
}

export { getEcmFileFolderGraphql, getEcmRootFolderIdGraphql };