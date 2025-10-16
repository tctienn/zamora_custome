import { useLazyQuery, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findAllHistoryByTaskIdGraphql(taskId: string) {
  return useQuery(
    gql`
        query ($taskId: String!) {
            findAllHistoryByTaskId(taskId: $taskId) {
                id
                taskId
                action
                attribute
                content
                userId
                userName
                time
                createdTime
                objectType
                objectId
                createdBy
                oldValue
                newValue
            }
        }
    `, { taskId }, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getViewsByTaskId(taskId: string) {
  return useLazyQuery(
    gql`
          query getViewsByTaskId($taskId: String!){
              getViewsByTaskId(taskId: $taskId){
                  userId
                  views
                  lastViewTime
              }
          }
      `, { taskId: taskId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { findAllHistoryByTaskIdGraphql, getViewsByTaskId };
