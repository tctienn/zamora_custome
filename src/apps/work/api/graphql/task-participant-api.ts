import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function participantByTaskIdGraphql(taskId: string) {
  return useQuery(
    gql`
            query participantByTaskId($taskId: String){
                participantByTaskId(taskId: $taskId){
                    id,
                    taskId,
                    type,
                    participantId,
                    participantName,
                    participantEmail,
                    participantAvatar,
                    percent,
                    orderNo,
                }
            }
        `, { taskId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function changeParticipantGraphql() {
  return useMutation(
    gql`
            mutation changeParticipant($taskId: String, $participants: [ParticipantInput]){
                changeParticipant(taskId: $taskId, participants: $participants)
            }
        `, { clientId: WORK_CLIENT_ID }
  );
}

export { changeParticipantGraphql, participantByTaskIdGraphql };