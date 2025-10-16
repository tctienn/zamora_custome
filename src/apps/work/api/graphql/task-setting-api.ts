import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getTaskSettingGraphql(taskId: string) {
  return useQuery(
    gql`
        query ($taskId: String!){
            getTaskSetting(taskId: $taskId) {
                tasks {
                    id
                    name
                    description
                    weight
                    participants {
                        id
                        participantName
                        type
                    }
                }
                participantTaskSettingResponse {
                    id
                    participantName
                    percent
                    positionName
                }
                remind {
                    id
                    taskId
                    warningBeforeDays
                    emailAlert
                    notification
                }
            }
        }
    `, { taskId }, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveTaskSettingGraphql() {
  return useMutation(
    gql`
        mutation ($taskSettingInput: TaskSettingInput){
            saveTaskSetting(taskSettingInput: $taskSettingInput)
        }
    `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getTaskSettingGraphql, saveTaskSettingGraphql };