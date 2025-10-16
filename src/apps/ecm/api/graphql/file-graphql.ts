import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ServiceType } from '@/apps/ecm/api/graphql/file-manage';
import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findFileById(id: string) {
  return useQuery(
    gql`
            query findById($id: String!) {
                findFileById(id: $id) {
                    id
                    name
                    size
                    treePath
                    folderId
                    createdAt
                    createdBy
                    lastModifiedAt
                    lastModifiedBy
                    extension
                    statusComment
                    isShare
                    personal
                }
            }
        `,
    { id }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getFileGraphql(type: ServiceType, fileId: string) {
  return useQuery(
    gql`
            query ($type: ServiceType!, $fileId: String!) {
                file(type: $type, fileId: $fileId) {
                    id
                    name
                    size
                    treePath
                    folderId
                    createdAt
                    createdBy
                    lastModifiedAt
                    lastModifiedBy
                    extension
                    personal
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

function turnOnOffCommentGrapdql() {
  return useMutation(
    gql`
            mutation turnOnOffComment($fileId: String){
                turnOnOffComment(fileId: $fileId){
                    id
                    name
                    size
                    treePath
                    folderId
                    createdAt
                    createdBy
                    lastModifiedAt
                    lastModifiedBy
                    extension
                    personal
                    statusComment
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

export { findFileById, getFileGraphql, turnOnOffCommentGrapdql };
