import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { CheckListFilter } from '@/apps/work/model/checklist';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function deleteCheckListGroupById() {
  return useMutation(
    gql`
          mutation deleteCheckListGroupById($id: String) {
              deleteCheckListGroupById(id: $id)
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveCheckListGroup() {
  return useMutation(
    gql`
          mutation saveCheckListGroup($checkListGroupInput: CheckListGroupInput) {
              saveCheckListGroup(checkListGroupInput: $checkListGroupInput){
                  id
                  name
                  orderNo
                  taskId
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function updateCheckListGroup() {
  return useMutation(
    gql`
          mutation updateCheckListGroup($id:String,$checkListGroupInput: CheckListGroupInput) {
              updateCheckListGroup(id:$id,checkListGroupInput: $checkListGroupInput){
                  id
                  name
                  orderNo
                  taskId
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function updateCheckListGroupName() {
  return useMutation(
    gql`
          mutation updateCheckListGroupName($id:String,$name: String) {
              updateCheckListGroupName(id:$id,name: $name){
                  id
                  name
                  orderNo
                  taskId
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function listCheckListGroup(taskId: string, filter?:CheckListFilter) {
  return useLazyQuery(
    gql`
        query listCheckListGroup($taskId: String $filter:CheckListFilter) {
            listCheckListGroup(taskId: $taskId,filter:$filter ){
                id
                name
                orderNo
                taskId
                checkLists {
                    taskId
                    groupId
                    name
                    id
                    isComplete
                    completedTime
                    lastModifiedBy
                    createdBy
                    startTime
                    endTime
                }
            }
        }
    `, {
      taskId: taskId,
      filter: filter 
    }, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  deleteCheckListGroupById,
  listCheckListGroup,
  saveCheckListGroup,
  updateCheckListGroup,
  updateCheckListGroupName
};