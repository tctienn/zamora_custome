import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MEETING_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAllSubstituteParticipants(meetingId: string) {
  return useQuery(
    gql`
        query getAllSubstituteParticipants($meetingId: String){
            getAllSubstituteParticipants(meetingId: $meetingId){
                id
                meetingId
                userId
                substituteParticipant
            }
        }
    `, { meetingId }, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveSubstituteParticipant() {
  return useMutation(
    gql`
        mutation saveSubstituteParticipant($meetingId: String, $substituteParticipant: String){
            saveSubstituteParticipant(meetingId: $meetingId, substituteParticipant: $substituteParticipant)
        }
    `, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteSubstituteParticipant() {
  return useMutation(
    gql`
        mutation deleteSubstituteParticipant($meetingId: String){
            deleteSubstituteParticipant(meetingId: $meetingId)
        }
    `, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteSubstituteParticipant, getAllSubstituteParticipants, saveSubstituteParticipant };