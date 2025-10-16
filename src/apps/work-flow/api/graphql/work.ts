import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { FLOW_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function createWork() {
  return useMutation(gql`
      mutation createWork($input: WorkInput!) {
          createWork(work: $input) {
              id
              name
              description
              priority
              status
              startTime
              deadLine
          }
      }
  `, { clientId: FLOW_CLIENT_ID, });
}

function createWorkAndSendToFirstNodes() {
  return useMutation(gql`
      mutation createWorkAndSendToFirstNodes($work: WorkInput!, $assigns: [StartWorkAssigned]!, $comment: String) {
          createWorkAndSendToFirstNodes(work: $work, assigns: $assigns, comment: $comment) {
              id
              name
              description
              priority
              status
              startTime
              deadLine
          }
      }
  `, { clientId: FLOW_CLIENT_ID });
}

function createWorksAndSendToFirstNodes() {
  return useMutation(gql`
      mutation createWorksAndSendToFirstNodes($payload: [CreateWorksPayload]) {
          createWorksAndSendToFirstNodes(payload: $payload)
      }
  `, { clientId: FLOW_CLIENT_ID });
}

function completeTasksAndCreateNextTasks() {
  return useMutation(gql`
      mutation completeTasksAndCreateNextTasks($objectIds: [String]) {
          completeTasksAndCreateNextTasks(objectIds: $objectIds)
      }
  `, { clientId: FLOW_CLIENT_ID });
}

function startWork() {
  return useMutation(gql`
      mutation startWork($id: String!) {
          startWork(workId: $id) {
              id
              name
              description
              priority
              status
              startTime
              deadLine
          }
      }
  `, { clientId: FLOW_CLIENT_ID });
}

function deleteWork() {
  return useMutation(gql`
      mutation deleteWork($id: String!) {
          deleteWork(workId: $id)
      }
  `, { clientId: FLOW_CLIENT_ID });
}

function cancelWork() {
  return useMutation(gql`
      mutation cancelWork($id: String!) {
          cancelWork(workId: $id){
              id
          }
      }
  `, { clientId: FLOW_CLIENT_ID });
}

function resumeWork() {
  return useMutation(gql`
      mutation resumeWork($id: String!) {
          resumeWork(workId: $id){
              id
          }
      }
  `, { clientId: FLOW_CLIENT_ID });
}

function activeWorks(pageable: Pageable) {
  return useLazyQuery(gql`
              query activeWorks($pageable: Pageable) {
                  activeWorks(pageable: $pageable) {
                      totalCount
                      edges {
                          node {
                              id
                              name
                              description
                              priority
                              status
                              startTime
                              deadLine
                          }
                      }
                  }
              }
    `,
  { pageable },
  {
    clientId: FLOW_CLIENT_ID,
    fetchPolicy: 'network-only'
  });
}

function completedWorks(pageable: Pageable) {
  return useLazyQuery(gql`
              query completedWorks($pageable: Pageable) {
                  completedWorks(pageable: $pageable) {
                      totalCount
                      edges {
                          node {
                              id
                              name
                              description
                              priority
                              status
                              startTime
                              deadLine
                          }
                      }
                  }
              }
    `,
  { pageable },
  {
    clientId: FLOW_CLIENT_ID,
    fetchPolicy: 'network-only'
  });

}

function getWork(id: string) {
  return useQuery(gql`
      query work($id: String!) {
          work(id: $id) {
              id
              name
              description
              priority
              status
              startTime
              deadLine
              endTime

              createdTime
              createdBy

              currentTasks {
                  id
                  workId
                  name
                  nodeId
                  assignedId
                  startTime
                  endTime
                  status
                  result
                  comment
                  needChooseAction
              }
              objectInfo
              stepHistories {
                  id
                  workId
                  nodeId
                  nodeName
                  taskIds

                  tasks {
                      id
                      workId
                      name
                      nodeId
                      assignedId
                      startTime
                      endTime
                      status
                      result
                      resultLabel
                      comment
                  }
              }
          }
      }
  `, { id }, {
    clientId: FLOW_CLIENT_ID,
    fetchPolicy: 'network-only'
  });

}

function createNextTasks() {
  return useMutation(gql`
              mutation createNextTasks($workId: String!, $currentTaskId: String!, $assignedIds: [String]!, $currentNodeId: String!, $nextNodeId: String!) {
                  createNextTasks(workId: $workId, currentTaskId: $currentTaskId, assignedIds: $assignedIds, currentNodeId: $currentNodeId, nextNodeId: $nextNodeId)
              }
    `,
  { clientId: FLOW_CLIENT_ID });
}

export {
  activeWorks,
  cancelWork,
  completedWorks,
  completeTasksAndCreateNextTasks,
  createNextTasks,
  createWork,
  createWorkAndSendToFirstNodes,
  createWorksAndSendToFirstNodes,
  deleteWork,
  getWork,
  resumeWork,
  startWork
};
