import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MEETING_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAttendeeByMeetingId(data: { id: string, pageable: { page: number, size: number } }) {
  return useQuery(
    gql`
        query getAttendeeByMeetingId($id: String!,$pageable:Pageable){
            getAttendeeByMeetingId(id: $id, pageable: $pageable){
                edges{
                    node{
                        id
                        isHost
                        meetingId
                        participate
                        reason
                        seen
                        seenTime
                        userId
                        cancelTime
                    }
                }
            }
        }
    `, { ...data }, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function updateAttendee() {
  return useMutation(
    gql`
        mutation updateAttendee($id: String!,$participate:Boolean, $reason: String){
            updateAttendee(id: $id, participate: $participate, reason: $reason)
        }
    `, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function updateAttendeeByUserId() {
  return useMutation(
    gql`
        mutation updateAttendeeByUserId($meetingId: String!,$participate:Boolean, $reason: String){
            updateAttendeeByUserId(meetingId: $meetingId, participate: $participate, reason: $reason)
        }
    `, {
      clientId: MEETING_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getAttendeeByMeetingId, updateAttendee, updateAttendeeByUserId };
