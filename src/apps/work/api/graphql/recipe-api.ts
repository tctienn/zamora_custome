import { provideApolloClients, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import apolloClients, { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

provideApolloClients(apolloClients);

function findByProjectId(projectId: string) {
  return useQuery(
    gql`
      query findByProjectId($projectId: String){
          findByProjectId(projectId: $projectId){
              id
              projectId
              name
              type
              configImplementer
              configFollower
          }
      }
    `,
    { projectId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveRecipe() {
  return useMutation(
    gql`
      mutation saveRecipe($recipeDTO: RecipeInput){
          saveRecipe(recipeDTO: $recipeDTO){
              id
              projectId
              type
              configImplementer
              configFollower
          }
      }
    `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { findByProjectId, saveRecipe };