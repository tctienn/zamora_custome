import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function taskDeadlineByTaskIdGraphql() {
  return useQuery(
    gql`
            query taskDeadlineByTaskId($taskId: String){
                taskDeadlineByTaskId(taskId: $taskId){
                    id
                    reason
                    taskId
                    oldDeadline
                    isCurrent
                    newDeadline
                    oldStart
                    newStart
                }
            }
        `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function changeDeadlineGraphql() {
  return useMutation(
    gql`
            mutation changeDeadline($task: TaskDeadlineInput){
                changeDeadline(taskDeadlineModel: $task){
                    id
                    reason
                    taskId
                    oldDeadline
                    isCurrent
                    newDeadline
                    oldStart
                    newStart
                }
            }
        `, { clientId: WORK_CLIENT_ID }
  );
}

export { changeDeadlineGraphql, taskDeadlineByTaskIdGraphql };