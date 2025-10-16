import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function deleteCheckListGraphql() {
  return useMutation(
    gql`
          mutation deleteCheckList($checkListId: String) {
              deleteCheckList(checkListId: $checkListId)
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function addCheckListGraphql() {
  return useMutation(
    gql`
          mutation addCheckList($checkListInput: CheckListInput) {
              addCheckList(checkListInput: $checkListInput){
                  id
                  name
                  orderNo
                  deadline
                  isComplete
                  taskId
                  lastModifiedBy
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function completeCheckList() {
  return useMutation(
    gql`
          mutation completeCheckList($checkListId: String) {
              completeCheckList(checkListId: $checkListId){
                  taskId
                  groupId
                  id
                  name
                  completedTime
                  isComplete
                  lastModifiedBy
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function incompleteCheckList() {
  return useMutation(
    gql`
          mutation incompleteCheckList($checkListId: String) {
              incompleteCheckList(checkListId: $checkListId){
                  taskId
                  groupId
                  id
                  name
                  orderNo
                  deadline
                  isComplete
                  lastModifiedBy
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function updateCheckList() {
  return useMutation(
    gql`
          mutation updateCheckList($id:String,$checkListInput: CheckListInput) {
              updateCheckList(id:$id,checkListInput: $checkListInput){
                  id
                  name
                  isComplete
                  deadline
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function updateCheckListName() {
  return useMutation(
    gql`
          mutation updateCheckListName($id:String,$name: String) {
              updateCheckListName(id:$id,name: $name){
                  id
                  name
                  isComplete
                  deadline
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function countAllByTaskId(taskId: string) {
  return useLazyQuery(
    gql`
          query countAllByTaskId($taskId: String!){
              countAllByTaskId(taskId: $taskId){
                  all
                  check
                  uncheck
                  overdue
              }
          }
      `, { taskId: taskId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  addCheckListGraphql,
  completeCheckList,
  countAllByTaskId,
  deleteCheckListGraphql,
  incompleteCheckList,
  updateCheckList,
  updateCheckListName
};