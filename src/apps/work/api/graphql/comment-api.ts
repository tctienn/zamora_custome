import { provideApolloClients, useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import apolloClients, { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

provideApolloClients(apolloClients);

function addCommentGraphql() {
  return useMutation(
    gql`
            mutation addComment($type: String, $objectId: String, $content: String, $replyId: String){
                addComment(type: $type, objectId: $objectId, content: $content, replyId: $replyId){
                    id
                    content
                    replyId
                    type
                    objectId
                }
            }
        `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findCommentsGraphql(type: string, objectId: string, replyId?: string, pageable?: Pageable) {
  return useLazyQuery(
    gql`
            query findComments($type: String, $objectId: String, $replyId: String, $pageable: Pageable){
                findComments(type: $type, objectId: $objectId, replyId: $replyId, pageable: $pageable){
                    edges{
                        node{
                            id
                            content
                            objectId
                            replyId
                            type
                            createdBy
                            createdTime
                            isEdited
                            replyComment {
                                id
                                createdBy
                                createdTime
                                content
                                createdTime
                            }
                            seenUserIds
                            attachments {
                                id
                                name
                                extension
                                name
                                size
                                path
                            }
                        }
                    }
                    totalCount
                }
            }
        `, {
      type,
      objectId,
      replyId,
      pageable
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { addCommentGraphql, findCommentsGraphql };

