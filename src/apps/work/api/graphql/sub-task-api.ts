import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { type SearchTaskInput } from '@/apps/work/model/task';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getTasksNoParent(currTaskId: string) {
  return useLazyQuery(
    gql`
          query getTasksNoParent($currTaskId:String){
              getTasksNoParent(currTaskId:$currTaskId){
                  id
                  name
                  percent
                  startTime
                  dueTime

              }
          }
      `, { currTaskId: currTaskId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getChildrenTaskByTaskId(taskId: string) {
  return useLazyQuery(
    gql`
          query getChildrenTaskByTaskId($taskId:String){
              getChildrenTaskByTaskId(taskId:$taskId){
                  id
                  name
                  percent
                  startTime
                  dueTime
                  weight
                  statusId
              }
          }
      `, { taskId: taskId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteChildrenTask() {
  return useMutation(
    gql`
          mutation deleteChildrenTask($childrenTaskIds: [String]){
              deleteChildrenTask(childrenTaskIds: $childrenTaskIds) {
                  id
                  name
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveChildrenTask() {
  return useMutation(
    gql`
          mutation saveChildrenTask($taskId:String,$childrenTaskIds:[String]){
              saveChildrenTask(taskId: $taskId,childrenTaskIds: $childrenTaskIds) {
                  id
                  name
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteChildrenTask, getChildrenTaskByTaskId, getTasksNoParent, saveChildrenTask };
