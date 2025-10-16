import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { CommentInputInterface } from '@/apps/media/model/comment';
import type { MediaType } from '@/apps/media/model/media';
import { MEDIA_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function saveComment() {
  return useMutation<any, { commentInput: CommentInputInterface }>(
    gql`
            mutation ($commentInput: CommentInput!) {
                saveComment(commentInput: $commentInput){
                    id
                    content
                    objectId
                    repliedCommentId
                    createdBy
                }
            }`, { clientId: MEDIA_CLIENT_ID, }
  );
}

function deleteComment() {
  return useMutation<string, { id: string }>(
    gql`
            mutation ($id: String!) {
                deleteComment(id: $id)
            }
    `, { clientId: MEDIA_CLIENT_ID, }
  );
}

function replyCommentsByRepliedCommentId(objectId: string, mediaType: MediaType, repliedCommentId: string | null, pageable: Pageable) {
  return useQuery(
    gql`
            query ($objectId: String!, $mediaType: MediaType!,$repliedCommentId:String,$pageable:Pageable) {
                replyCommentsByRepliedCommentId(objectId:$objectId,mediaType:$mediaType, repliedCommentId:$repliedCommentId,pageable:$pageable){
                    edges{
                        node{
                            id
                            objectId
                            type
                            content
                            createdBy
                            createdTime
                            repliedCommentId
                            count
                        }
                    }
                    totalCount
                }
            }`, {
      objectId: objectId,
      mediaType: mediaType,
      repliedCommentId: repliedCommentId,
      pageable: pageable
    }
    ,
    {
      clientId: MEDIA_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  deleteComment,
  replyCommentsByRepliedCommentId,
  saveComment
};
