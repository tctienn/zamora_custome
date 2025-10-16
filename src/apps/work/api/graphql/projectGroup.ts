import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchByProjectGroup(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable){
          searchByProjectGroup(keyword: $keyword, pageable: $pageable) {
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

function mutationProjectGroup() {
  return useMutation(
    gql`
       mutation mutationProjectGroup($payload: ProjectGroupInput){
          mutationProjectGroup(payload: $payload) {
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

function getProjectGroupById(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getProjectGroupById(id: $id) {
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

function deleteProjectGroup() {
  return useMutation(
    gql`
        mutation ($id: String!) {
            deleteProjectGroup(id: $id){
                id
            }
        }`, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllActiveProjectGroup() {
  return useQuery(
    gql`
        query getAllActiveProjectGroup{
          getAllActiveProjectGroup {
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

function maxNOrderProjectGroup() {
  return useQuery(
    gql`
            query maxOrderActiveProjectGroup {
                maxOrderActiveProjectGroup
            }
        `, {}, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteProjectGroup, getAllActiveProjectGroup, getProjectGroupById, maxNOrderProjectGroup, mutationProjectGroup, searchByProjectGroup };
