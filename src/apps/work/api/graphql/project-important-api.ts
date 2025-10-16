import { provideApolloClients, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import apolloClients, { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

provideApolloClients(apolloClients);

function saveProjectImportant() {
  return useMutation(
    gql`
      mutation saveProjectImportant($project: ProjectImportantInput){
          saveProjectImportant(project: $project){
              projectId
              isImportant
              userId
          }
      }
    `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { saveProjectImportant };