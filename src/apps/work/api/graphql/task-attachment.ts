import { provideApolloClients, useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { AttachmentSearch } from '@/apps/work/model/taskAttachment';
import apolloClients, { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

provideApolloClients(apolloClients);

function searchAttachment(searchRequest: AttachmentSearch, page: Pageable) {
  return useLazyQuery(
    gql`
        query searchAttachment($searchRequest:AttachmentSearchRequest,$page:Pageable){
            searchAttachment(searchRequest:$searchRequest,page:$page){
                edges{
                    node{
                        id
                        objectId
                        name
                        extension
                        size
                        createdBy
                        createdTime
                        lastModifiedBy
                        lastModifiedTime
                        originType
                        originId
                        path
                    }
                }
                totalCount
            }
        }
    `, {
      searchRequest,
      page
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteAttachmentById() {
  return useMutation(
    gql`
          mutation deleteAttachmentById($id:String){
              deleteAttachmentById(id:$id)
          }
      `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function renameAttachment() {
  return useMutation(
    gql`
          mutation renameAttachment($id:String,$name:String){
              renameAttachment(id:$id,name:$name){
                  id
                  name
              }
          }
      `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteAttachmentById, renameAttachment, searchAttachment };