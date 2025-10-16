import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findProjectLabelByProjectId() {
  return useLazyQuery(
    gql`
      query findProjectLabelByProjectId($projectId: String){
          findProjectLabelByProjectId(projectId: $projectId){
              id
              projectId
              labelId
              labelName
              labelColor
          }
      }
    `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveProjectLabels() {
  return useMutation(
    gql`
      mutation saveProjectLabels($projectLabels: [ProjectLabelPayload]){
          saveProjectLabels(projectLabels: $projectLabels)
      }
    `, { clientId: WORK_CLIENT_ID }
  );
}

export { findProjectLabelByProjectId, saveProjectLabels };
