import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { BoardType } from '@/apps/work/model/board';
import { type SearchTaskInput, SourceType, type TaskOriginObject } from '@/apps/work/model/task';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

const taskMainColumns = [
  'id',
  'code',
  'name',
  'type',
  'weight',
  'description',
  'startTime',
  'dueTime',
  'completionTime',
  'completionType',
  'assignerId',
  'assignerName',
  'isRepeat',
  'isImportant',
  'assessorId',
  'assessorName',
  'percent',
  'autoProgress',
  'statusId',
  'statusName',
  'parentId',
  'copyFrom',
  'createdTime',
  'createdBy',
  'lastModifiedTime',
  'lastModifiedBy',
  'groupId',
  'assignerId',
  'target',
  'priority',
  'createdDate',
  'projectId'
];

const taskNecessaryColumns = [
  'id',
  'code',
  'name',
  'description',
  'startTime',
  'dueTime',
  'completionTime',
  'assignerId',
  'assignerName',
  'isRepeat',
  'isImportant',
  'assessorId',
  'assessorName',
  'percent',
  'statusId',
  'statusName',
  'parentId',
  'createdTime',
  'createdBy',
  'lastModifiedTime',

  'hasLocation',
  'commentCount',
  'hasAttachment'
];

const participantColumns = [
  'id',
  'taskId',
  'type',
  'participantId',
  'participantName',
  'participantEmail',
  'participantAvatar',
  // 'participantRoleId',
  // 'participantRoleName',
  // 'participantOrgId',
  // 'participantOrgName',
  'percent',
  'orderNo',
  // 'createdTime',
  // 'createdBy',
  // 'lastModifiedTime',
  // 'lastModifiedBy',
];

const checklistColumns = [
  'id',
  'name',
  'taskId',
  'deadline',
  'isComplete',
  'completedTime',
  'orderNo',
  'implementerId',
  'implementerName',
];

const repeatColumns = [
  'id',
  'taskId',
  'type',
  'createTimeConfig',
  'daysOfWeek',
  'daysOfMonth',
  'endRepeatDate',
  'description',
];

const locationColumns = [
  'id',
  'taskId',
  'name',
  'address',
  'longitude',
  'latitude',
  'orderNo'
];

const attachmentColumns = [
  'id',
  'name',
  'extension',
  'path',
  'size',
  'taskId',
  'orderNo',
  'objectType',
  'objectId'
];

const evaluationColumns = [
  'id',
  'taskId',
  'ok',
  'point',
  'description'
];

const taskLabelColumns = [
  'id',
  'taskId',
  'labelId',
  'labelTitle',
  'labelColor'
];

const extendsColumns = [
  'id',
  'fieldName',
  'taskId',
  'type',
  'value'
];

const customersColumns = [
  'id',
  'clientId',
  'taskId',
  'orderNo',
];

function necessaryTaskModel(boardType?: BoardType) {
  switch (boardType) {
  case BoardType.PROJECT:
    return `
      ... on Project {
        id
        admins
        name
        code
        type
        groupId
        parentId
        logo
        implementers
        followers
        numbTask
        description
        sequenceNumber
        progress
        startDate
        endDate
        status
        isDeleted
        createdDate
      }
    `;
  default:
    return `
      ... on Task{
      ${taskNecessaryColumns.join(' ')}
      participants { ${participantColumns.join(' ')} }
      checkListCount { 
        finished
        total
      }
      labels { ${taskLabelColumns.join(' ')} }
    }`;
  }
}

function getTaskGraphql(id: string) {
  return useQuery(
    gql`
        query ($id: String!){
            task(id: $id){
                ${taskMainColumns.join(' ')}
                participants { ${participantColumns.join(' ')} }
                checkLists { ${checklistColumns.join(' ')} }
                repeatConfig { ${repeatColumns.join(' ')} }
                locations { ${locationColumns.join(' ')} }
                taskAttachments { ${attachmentColumns.join(' ')} }

                extends { ${extendsColumns.join(' ')}}

                children{
                    id
                    name
                }
                parent{
                    id
                    name
                }
                taskCustomers { ${customersColumns.join(' ')} }
                orderNo
                phaseId
            }
        }
    `, { id },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getTaskLazyGraphql(id: string) {
  return useLazyQuery(
    gql`
        query ($id: String!){
            task(id: $id){
                ${taskMainColumns.join(' ')}
                participants { ${participantColumns.join(' ')} }
                labels {
                    id
                    labelColor
                    labelTitle
                    labelId
                }
                createdDate
                children{
                    id
                    name
                    startTime
                    dueTime
                    percent
                }
                project {
                    id
                    name
                }
                parent{
                    id
                    name
                }

                originCreatedType
                originCreatedId
                originData

                taskGroup{
                    id
                    name
                }
            }
        }
    `, { id },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveTaskGraphql() {
  return useMutation(
    gql`
        mutation ($task: TaskInput!, $attachments: [Upload], $otherInfos: [TaskExtendInput]){
            saveTask(task: $task, attachments: $attachments, otherInfos: $otherInfos){
                ${necessaryTaskModel()}
            }
        }
    `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findTaskByUserRangeDateGraphql(data: { fromDate: string, toDate: string }) {
  return useQuery(
    gql`
        query ($fromDate: DateTime, $toDate: DateTime){
            findTaskByUserRangeDate(fromDate: $fromDate,toDate: $toDate){
                ${necessaryTaskModel()}
            }
        }
    `, { ...data },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveTasksGraphql() {
  return useMutation(
    gql`
        mutation ($tasks: [TaskInput]!){
            saveTasks(tasks: $tasks){
                ${necessaryTaskModel()}
                taskCustomers { ${customersColumns.join(' ')} }
            }
        }
    `, { clientId: WORK_CLIENT_ID }
  );
}

function upload() {
  return useMutation(
    gql`
        mutation ($demo: Demo){
            upload(demo: $demo)
        }
    `, { clientId: WORK_CLIENT_ID }
  );
}

function getTaskAsParentGraphql(sourceType: SourceType, keyword: string) {
  return useQuery(
    gql`
        query ($sourceType: SourceType, $keyword: String!){
            taskAsParent(sourceType: $sourceType, keyword: $keyword) {
                id
                code
                name
            }
        }
    `, {
      sourceType: SourceType[sourceType],
      keyword
    }, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteTaskGraphql() {
  return useMutation(
    gql`
        mutation ($taskId: String!) {
            deleteTask(taskId: $taskId)
        }
    `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findTaskByIdGraphql(taskId: string) {
  return useQuery(
    gql`
        query ($taskId: String!) {
            task(id: $taskId){
                id
                code
                name
            }
        }
    `, { taskId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchTasks(searchTaskInput?: SearchTaskInput, page?: Pageable) {
  return useLazyQuery(
    gql`
          query searchTasks($searchTaskInput: SearchTaskInput,$page:Pageable){
              searchTasks(searchTaskInput: $searchTaskInput,page:$page) {
                  edges {
                      node {
                          id
                          code
                          name
                          project {
                              name
                              id
                              startDate
                              endDate
                          }
                          startTime
                          dueTime
                          assignerId
                          assignerName
                          parentId
                          priority
                          target
                          createdDate
                          createdBy

                          percent
                          statusId
                          statusName
                          lastModifiedTime
                          completionTime
                          orderNo
                          groupId
                          phaseId
                          phase{
                              name
                              fromDate
                              toDate
                          }
                          participants {
                              participantId
                              participantName
                              type
                              id
                          }

                          taskAttachments {
                              id
                              name
                          }
                          phaseByProjectId{
                              id
                              name
                              fromDate
                              toDate
                          }
                          commentCount
                          checkLists { ${checklistColumns.join(' ')} }

                          followers{
                              participantId
                          }

                          implementers{
                              participantId
                          }
                      }
                  }
                  totalCount
              }
          }
      `, {
      searchTaskInput: searchTaskInput,
      page: page
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getTasksRelateAndNoParent(currTaskId: string, searchTaskInput?: SearchTaskInput) {
  return useQuery(
    gql`
      query getTasksRelateAndNoParent($currTaskId: String, $searchTaskInput: SearchTaskInput){
        getTasksRelateAndNoParent(currTaskId: $currTaskId, searchTaskInput: $searchTaskInput){
            id
            code
            name
            type
            weight
            description
            startTime
            dueTime
            completionTime
            completionType
            assignerId
            assignerName
            isRepeat
            isImportant
            needEvaluate
            remind
            assessorId
            assessorName
            percent
            autoProgress
            statusId
            statusName
            parentId
            hasAttachment
            hasChecklist
            hasLocation
            hasCustomer
            hasExpense
            hasDynamicField
            isEvaluated
            copyFrom
            createdTime
            createdBy
            lastModifiedTime
            lastModifiedBy
        }
      }
      `, {
      currTaskId: currTaskId,
      searchTaskInput: searchTaskInput
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function countTasksRole(searchTaskInput?: SearchTaskInput) {
  return useQuery(
    gql`
          query countTasksRole($searchTaskInput: SearchTaskInput){
              countTasksRole(searchTaskInput: $searchTaskInput) {
                  all
                  assign
                  follow
                  implement
                  myDept
                  waitingEvaluate
                  deadlineExtension
              }
          }
      `, { searchTaskInput: searchTaskInput, },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function countTasksStatus(searchTaskInput?: SearchTaskInput) {
  return useQuery(
    gql`
          query countTasksStatus($searchTaskInput:SearchTaskInput) {
              countTasksStatus(searchTaskInput:$searchTaskInput){
                  statusId
                  count
                  __typename
              }
          }
      `, { searchTaskInput: searchTaskInput },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function cloneTask() {
  return useMutation(
    gql`
          mutation cloneTask($taskId: String){
              cloneTask(taskId: $taskId) {
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

function getLeafByTaskId(taskId: string) {
  return useLazyQuery(
    gql`
        query getLeafByTaskId($taskId:String){
            getLeafByTaskId(taskId:$taskId){
                groupId
                name
                id
                groupId
                code
                percent
            }
        }
    `, { taskId: taskId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function readTask() {
  return useMutation(
    gql`
          mutation readTask($taskId:String){
              readTask(taskId:$taskId)
          }
      `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function changeTaskDescription() {
  return useMutation(
    gql`
          mutation changeTaskDescription($taskId:String,$description:String,$target:String){
              changeTaskDescription(taskId:$taskId,description:$description,target:$target){
                  __typename
              }
          }
      `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function countMyAssignTask() {
  return useQuery(
    gql`
          query countMyAssignTask{
              countMyAssignTask
          }
      `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getTasksCreatedByOriginObject(originObject: TaskOriginObject) {
  return useQuery(
    gql`
          query getTasksCreatedByOriginObject($originObject:TaskOriginObject){
              getTasksCreatedByOriginObject(originObject:$originObject){
                  name
                  id
                  code
              }
          }
      `, { originObject: originObject },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  changeTaskDescription,
  cloneTask,
  countMyAssignTask,
  countTasksRole,
  countTasksStatus,
  deleteTaskGraphql,
  findTaskByIdGraphql,
  findTaskByUserRangeDateGraphql,
  getLeafByTaskId,
  getTaskAsParentGraphql,
  getTaskGraphql,
  getTaskLazyGraphql,
  getTasksCreatedByOriginObject,
  getTasksRelateAndNoParent,
  necessaryTaskModel,
  readTask,
  saveTaskGraphql,
  saveTasksGraphql,
  searchTasks,
  upload
};
