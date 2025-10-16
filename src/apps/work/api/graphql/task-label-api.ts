import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveLabelGraphql() {
  return useMutation(
    gql`
            mutation saveLabel($task: TaskLabelInput){
                saveLabel(taskLabel: $task){
                    id,
                    taskId,
                    labelId,
                    labelTitle,
                    labelColor,
                }
            }
        `, { clientId: WORK_CLIENT_ID }
  );
}

function addLabelsToTaskGraphql() {
  return useMutation(
    gql`
            mutation addLabelsToTask($taskId: String, $labels: [TaskLabelInput]){
                addLabelsToTask(taskId: $taskId, labels: $labels){
                    id,
                    taskId,
                    labelId,
                    labelTitle,
                    labelColor,
                }
            }
        `, { clientId: WORK_CLIENT_ID }
  );
}

function taskLabelByTaskIdGraphql(taskId: string) {
  return useQuery(
    gql`
            query taskLabelByTaskId($taskId: String){
                taskLabelByTaskId(taskId: $taskId){
                    id,
                    taskId,
                    labelId,
                    labelTitle,
                    labelColor,
                }
            }
        `, { taskId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function removeTaskLabelsByGraphql() {
  return useMutation(
    gql`
            mutation removeTaskLabelsBy($taskLabels: [String]){
                removeTaskLabelsBy(taskLabels: $taskLabels)
            }
        `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { addLabelsToTaskGraphql, removeTaskLabelsByGraphql, saveLabelGraphql, taskLabelByTaskIdGraphql };