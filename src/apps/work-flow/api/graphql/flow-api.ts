import { useLazyQuery, useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { FLOW_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function createFlow() {
  return useMutation(
    gql`
      mutation createFlow(
        $flowEntityInput: FlowEntityInput
      ) {
        createFlow(
          flowEntityInput: $flowEntityInput
        ) {
          id
          name
          description
          type
          status
        }
      }
    `,
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function updateFlow() {
  return useMutation(
    gql`
      mutation updateFlow($id: String!, $flowEntityInput: FlowEntityInput!) {
        updateFlow(id: $id, flowEntityInput: $flowEntityInput) {
          id
          name
          description
          type
          status
        }
      }
    `,
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function updateFlowStatus() {
  return useMutation(
    gql`
      mutation updateStatusFlow($id: String!, $status: FlowStatus!) {
        updateStatusFlow(id: $id, status: $status) {
          id
          name
          description
          type
          status
        }
      }
    `,
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function updateNameFlow() {
  return useMutation(
    gql`
      mutation updateNameFlow($id: String!, $name: String!) {
        updateNameFlow(id: $id, name: $name) {
          id
          name
          description
          type
        }
      }
    `,
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteFlow() {
  return useMutation(
    gql`
      mutation deleteFlow($id: ID!) {
        deleteFlow(id: $id)
      }
    `,
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function loadFlow(id: string) {
  return useQuery(
    gql`
      query loadFlow($id: ID!) {
        loadFlow(id: $id) {
          name
          type
          orgType
          edges {
            id
            data
            source
            sourceX
            sourceY
            target
            targetX
            targetY
            sourceHandle
            targetHandle
          }
          nodes {
            id
            data
            type
            position
            dimensions
          }
        }
      }
    `,
    { id: id },
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function firstBasicNodes() {
  return useLazyQuery(
    gql`
      query firstBasicNodes($id: ID!, $hint: String) {
        firstBasicNodes(id: $id, hint: $hint) {
          id
          type
          data
          orgType
        }
      }
    `,
    {},
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function loadFlowInstance(id: string) {
  return useQuery(
    gql`
          query loadFlowInstance($id: ID!) {
              loadFlowInstance(id: $id) {
                  name
                  type
                  orgType
                  edges {
                      id
                      data
                      source
                      sourceX
                      sourceY
                      target
                      targetX
                      targetY
                      sourceHandle
                      targetHandle
                  }
                  nodes {
                      id
                      data
                      type
                      position
                      dimensions
                  }
              }
          }
      `,
    { id: id },
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveFlowConfig() {
  return useMutation(
    gql`
      mutation saveFlowConfig($id: ID!, $flow: FlowInput) {
        saveFlowConfig(id: $id, flow: $flow)
      }
    `,
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function flowsByType() {
  return useLazyQuery(
    gql`
      query flowsByType($type: String!) {
        flowsByType(type: $type) {
          id
          name
          description
          type
        }
      }
    `,
    {},
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllFlows(pageable: Pageable) {
  return useQuery(
    gql`
      query getAllFlows($pageable: Pageable) {
        getAllFlows(pageable: $pageable) {
          edges {
            node {
              type
              id
              description
              name
            }
          }
          totalCount
        }
      }
    `,
    { pageable: pageable },
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function search(keyword: string | null, pageable: Pageable) {
  return useQuery(
    gql`
      query search($keyword: String, $pageable: Pageable) {
        search(keyword: $keyword, pageable: $pageable) {
          edges {
            node {
              type
              id
              description
              name
              status
              orgType
                app
            }
          }
          totalCount
        }
      }
    `,
    {
      keyword: keyword,
      pageable: pageable,
    },
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getFlowEntity(id: string) {
  return useQuery(
    gql`
      query getFlowEntity($id: String) {
        getFlowEntity(id: $id) {
          id
          name
          description
          type
          orgType
          status
          orgIds
            isTemp
            app
        }
      }
    `,
    { id: id },
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findFlowByOrganizationIds(
  orgType: string | undefined,
  orgIds: string | undefined,
) {
  return useLazyQuery(
    gql`
      query findFlowByOrganizationIds(
        $orgType: OrganizationType
        $orgIds: String
      ) {
        findFlowByOrganizationIds(orgType: $orgType, orgIds: $orgIds) {
          id
          name
        }
      }
    `,
    {
      orgType,
      orgIds,
    },
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findByOrgTypeAndOrgIdsContainingAndType(
  orgType: string | undefined,
  orgIds: string | undefined,
  type: string,
) {
  return useLazyQuery(
    gql`
      query findByOrgTypeAndOrgIdsContainingAndType(
        $orgType: OrganizationType
        $orgIds: String
        $type: String
      ) {
        findByOrgTypeAndOrgIdsContainingAndType(
          orgType: $orgType
          orgIds: $orgIds
          type: $type
        ) {
          id
          name
        }
      }
    `,
    {
      orgType,
      orgIds,
      type,
    },
    {
      clientId: FLOW_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  createFlow,
  deleteFlow,
  findByOrgTypeAndOrgIdsContainingAndType,
  findFlowByOrganizationIds,
  firstBasicNodes,
  flowsByType,
  getAllFlows,
  getFlowEntity,
  loadFlow,
  loadFlowInstance,
  saveFlowConfig,
  search,
  updateFlow,
  updateFlowStatus,
  updateNameFlow
};
