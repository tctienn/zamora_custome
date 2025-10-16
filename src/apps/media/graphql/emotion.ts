import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { Emotion, MediaType } from '@/apps/media/model/media';
import { MEDIA_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function addEmotion() {
  return useMutation<Emotion, { mediaType: MediaType, mediaId: string, emotionType: string }>(
    gql`
            mutation ($mediaType: MediaType!, $mediaId: String!, $emotionType: String!) {
                addEmotion(mediaType: $mediaType, mediaId: $mediaId, emotionType: $emotionType) {
                    userId
                    emotionType
                    createdAt
                }
            }`, { clientId: MEDIA_CLIENT_ID, }
  );
}

export { addEmotion };
