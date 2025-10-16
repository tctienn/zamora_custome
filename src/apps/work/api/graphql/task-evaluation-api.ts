import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function evaluateGraphql() {
  return useMutation(
    gql`
        mutation evaluate($task: TaskEvaluationInput){
            evaluate(taskEvaluation: $task){
                id,
                taskId,
                ok,
                point,
                description,
            }
        }
    `, { clientId: WORK_CLIENT_ID }
  );
}

export { evaluateGraphql };