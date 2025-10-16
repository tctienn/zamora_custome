import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchByProjectType(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable){
          searchByProjectType(keyword: $keyword, pageable: $pageable) {
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

function mutationProjectType() {
  return useMutation(
    gql`
       mutation mutationProjectType($payload: ProjectTypeInput){
          mutationProjectType(payload: $payload) {
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

function getProjectTypeById(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getProjectTypeById(id: $id) {
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

function deleteProjectType() {
  return useMutation(
    gql`
        mutation ($id: String!) {
            deleteProjectType(id: $id) {
                id
            }
        }`, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllActiveProjectType() {
  return useQuery(
    gql`
        query getAllActiveProjectType{
          getAllActiveProjectType {
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

function maxNOrderProjectType() {
  return useQuery(
    gql`
            query maxOrderActiveProjectType {
                maxOrderActiveProjectType
            }
        `, {}, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteProjectType, getAllActiveProjectType, getProjectTypeById, maxNOrderProjectType, mutationProjectType, searchByProjectType };
