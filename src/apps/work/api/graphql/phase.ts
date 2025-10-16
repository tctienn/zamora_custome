import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { SearchPhase } from '@/apps/work/model/phase';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

export function savePhase() {
  return useMutation(
    gql`
      mutation savePhase($phaseInput: PhaseInput){
          savePhase(phaseInput: $phaseInput){
              id
          }
      }
    `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export function findPhaseById(id: string) {
  return useQuery(
    gql`
      query findPhaseById($id: String){
          findPhaseById(id: $id){
              id
              projectId
              name
              fromDate
              toDate
              description
              createdBy
              createdTime
          }
      }
    `, { id },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export function getPhasesByProjectId(projectId: string) {
  return useQuery(
    gql`
      query getPhasesByProjectId($projectId: String){
          getPhasesByProjectId(projectId: $projectId){
              id
              projectId
              name
              fromDate
              toDate
              description
              createdBy
              createdTime
          }
      }
    `, { projectId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export function searchPhase(searchPhase: SearchPhase) {
  return useLazyQuery(
    gql`
          query searchPhase($searchModel: SearchPhaseModel){
              searchPhase(searchModel: $searchModel){
                  id
                  projectId
                  name
                  fromDate
                  toDate
                  description
                  createdBy
                  createdTime
              }
          }
      `, { searchModel: searchPhase },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

