import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function addResultGraphql() {
  return useMutation(
    gql`
            mutation addResult($task: TaskResultInput){
                addResult(taskResult: $task){
                    id
                    taskId
                    weight
                    percent
                    statusId
                    statusName
                    description
                }
            }
        `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { addResultGraphql };