import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { FLOW_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function getTask(id: string) {
  return useQuery(gql`
      query task($id: String!) {
          task(id: $id) {
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
              needChooseAction
              createdTime
              createdBy
              lastModifiedTime
              lastModifiedBy
              objectInfo
              outcomes {
                  name
                  label
                  color
                  disable
              }
              work {
                  id
                  name
                  description
                  priority
                  status
                  startTime
                  deadLine
                  createdBy
              }
          }
      }
  `, { id }, { clientId: FLOW_CLIENT_ID });

}

function getAllTasksByWorkId(id: string) {
  return useQuery(gql`
      query getAllTasksByWorkId($id: String!) {
          getAllTasksByWorkId(id: $id) {
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
              needChooseAction
              createdTime
              createdBy
              lastModifiedTime
              lastModifiedBy
              objectInfo
              outcomes {
                  name
                  label
                  color
                  disable
              }
              work {
                  id
                  name
                  description
                  priority
                  status
                  startTime
                  deadLine
                  createdBy
              }
          }
      }
  `, { id }, { clientId: FLOW_CLIENT_ID });

}

function nextNodes(workId: string, currentNodeId: string) {
  return useLazyQuery(gql`
              query nextNodes($workId: String!, $currentNodeId: String!) {
                  nextNodes(workId: $workId, currentNodeId: $currentNodeId) {
                      id
                      type
                      data
                  }
              }
    `,
  {
    workId,
    currentNodeId
  }
  , { clientId: FLOW_CLIENT_ID });
}

function nextNodesIgnoreStatus(workId: string, currentNodeId: string, result?: string) {
  return useLazyQuery(gql`
              query nextNodesIgnoreStatus($workId: String!, $currentNodeId: String!, $result: String!) {
                  nextNodesIgnoreStatus(workId: $workId, currentNodeId: $currentNodeId, result: $result) {
                      id
                      type
                      data
                  }
              }
    `,
  {
    workId,
    currentNodeId,
    result
  }
  , {
    clientId: FLOW_CLIENT_ID,
    fetchPolicy: 'network-only'
  });
}

function possibleUserIds() {
  return useLazyQuery(
    gql`
        query possibleUserIds($workId: String!, $currentNodeId: String!, $outcome: String!) {
            possibleUserIds(workId: $workId, currentNodeId: $currentNodeId, outcome: $outcome)
        }
    `,
    {}
    , { clientId: FLOW_CLIENT_ID });
}

function activeTasks(pageable: Pageable) {
  return useLazyQuery(gql`
      query activeTasks($pageable: Pageable) {
          activeTasks(pageable: $pageable) {
              totalCount
              edges {
                  node {
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
                      work {
                          id
                          name
                          priority
                      }
                  }
              }
          }
      }
  `, { pageable }, {
    clientId: FLOW_CLIENT_ID,
    fetchPolicy: 'network-only'
  });
}

function completedTasks(pageable: Pageable) {
  return useLazyQuery(gql`
      query completedTasks($pageable: Pageable) {
          completedTasks(pageable: $pageable) {
              totalCount
              edges {
                  node {
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
                      work {
                          id
                          name
                          priority
                      }
                  }
              }
          }
      }
  `, { pageable }, {
    clientId: FLOW_CLIENT_ID,
    fetchPolicy: 'network-only'
  });
}

function completeTask() {
  return useMutation(gql`
      mutation completeTask($id: String!, $result: String!, $comment: String) {
          completeTask(taskId: $id, result: $result, comment: $comment) {
              id
          }
      }
  `, { clientId: FLOW_CLIENT_ID });
}

function getTaskByObjectId(objectId: string) {
  return useQuery(gql`
      query getTaskByObjectId($objectId: String!) {
          getTaskByObjectId(objectId: $objectId) {
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
              needChooseAction
              createdTime
              createdBy
              lastModifiedTime
              lastModifiedBy
              objectInfo
              outcomes {
                  name
                  label
                  color
                  disable
              }
              work {
                  id
                  name
                  description
                  priority
                  status
                  startTime
                  deadLine
                  createdBy
              }
          }
      }
  `, { objectId }, {
    clientId: FLOW_CLIENT_ID,
    fetchPolicy: 'network-only'
  });

}

export {
  activeTasks,
  completedTasks,
  completeTask,
  getAllTasksByWorkId,
  getTask,
  getTaskByObjectId,
  nextNodes,
  nextNodesIgnoreStatus,
  possibleUserIds
};
