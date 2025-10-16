import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function addAnswer() {
  return useMutation(
    gql`
      mutation saveAnswers($answers: [AnswerInput]){
          saveAnswers(answers: $answers)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { addAnswer };
