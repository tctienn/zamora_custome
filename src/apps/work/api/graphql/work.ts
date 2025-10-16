import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { SearchWorkInput } from '@/apps/work/model/work';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function saveWork() {
  return useMutation(
    gql`
          mutation saveWork($workInput: WorkInput){
              saveWork(workInput: $workInput) {
                  id
                  name
                  status
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteWorkById() {
  return useMutation(
    gql`
          mutation deleteWorkById($id: String){
              deleteWorkById(id: $id) {
                  id
                  name
                  status
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getWorkById(id: string) {
  return useLazyQuery(
    gql`
          query getWorkById($id: String){
              getWorkById(id: $id) {
                  id
                  code
                  name
                  projectId
                  groupId
                  nOrder
                  priority
                  startDate
                  endDate
                  assigner
                  implementers
                  followers
                  nOrder
                  parentId
                  description
                  target
                  status
                  createdDate
                  createdBy
                  isAssignWithTime
                  lastModifiedTimeAction
              }
          }
      `, { id: id },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchWorks(searchWorkInput?: SearchWorkInput, page?: Pageable) {
  return useLazyQuery(
    gql`
          query searchWorks($searchWorkInput: SearchWorkInput,$page:Pageable){
              searchWorks(searchWorkInput: $searchWorkInput,page:$page) {
                  edges {
                      __typename
                      node {
                          id
                          name
                          assigner
                          implementers
                          followers
                          startDate
                          endDate
                          priority
                          status
                          nOrder
                          projectId
                          groupId
                          project {
                              name
                              id
                          }
                          lastModifiedTimeAction
                      }
                  }
                  totalCount
              }
          }
      `, {
      searchWorkInput: searchWorkInput,
      page: page
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function countWorks(searchWorkInput?: SearchWorkInput) {
  return useQuery(
    gql`
          query($searchWorkInput:SearchWorkInput) {
              countWorks(searchWorkInput:$searchWorkInput){
                  countStatus{
                      allStatus
                      completed
                      notStarted
                      pending
                      waiting
                      working
                  }
                  countRoleFilter{
                      all
                      assign
                      follow
                      implement
                      myDept
                  }
              }
          }
      `, { searchWorkInput: searchWorkInput },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function countWorksStatus(searchWorkInput?: SearchWorkInput) {
  return useQuery(
    gql`
          query($searchWorkInput:SearchWorkInput) {
              countWorksStatus(searchWorkInput:$searchWorkInput){
                  allStatus
                  completed
                  notStarted
                  pending
                  waiting
                  working
              }
          }
      `, { searchWorkInput: searchWorkInput },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function cloneWork() {
  return useMutation(
    gql`
          mutation cloneWork($id: String){
              cloneWork(id: $id) {
                  id
                  name
                  status
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  cloneWork,
  countWorks,
  countWorksStatus,
  deleteWorkById,
  getWorkById,
  saveWork,
  searchWorks
};