import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchByTaskGroup(data: { keyword?: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable){
          searchByTaskGroup(keyword: $keyword, pageable: $pageable) {
            totalCount
            edges {
              node {
                id
                name
                norder
                status
              }
            }
          }
        }
        `, { ...data },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function mutationTaskGroup() {
  return useMutation(
    gql`
       mutation mutationTaskGroup($payload: TaskGroupInput){
          mutationTaskGroup(payload: $payload) {
            id
            name
            norder
            status
          }
       }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getTaskGroupById(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getTaskGroupById(id: $id) {
                id
                name
                norder
                status
            }
        }
        `, { id },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteTaskGroup() {
  return useMutation(
    gql`
        mutation ($id: String!) {
            deleteTaskGroup(id: $id){
                id
            }
        }`, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllActiveTaskGroup() {
  return useLazyQuery(
    gql`
        query getAllActiveTaskGroup{
          getAllActiveTaskGroup {
                id
                name
                norder
                status
            }
          }
        `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function maxNOrderTaskGroup() {
  return useQuery(
    gql`
            query maxOrderActiveTaskGroup {
                maxOrderActiveTaskGroup
            }
        `, {}, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  deleteTaskGroup,
  getAllActiveTaskGroup,
  getTaskGroupById,
  maxNOrderTaskGroup,
  mutationTaskGroup,
  searchByTaskGroup
};
