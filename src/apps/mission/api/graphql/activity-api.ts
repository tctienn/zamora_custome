import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MISSION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

import type { SearchActivityInput } from '../../model/activity/activity';
import type { PageableInput } from '../../model/mission/mission';

function findAllActivity() {
  return useQuery(
    gql`
        query FindAllActivity  {
            findAllActivity {
            id
            missionId
            missionName
            activityName
            expectedTime
            endTime
            activityCode
            budget
            hostUnit
            description
            status
            coordinationUnitName
            createdBy
            createdTime
          }
        }`,
    {},
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function searchActivitiesGraphql(
  searchPayload?: SearchActivityInput,
  pageable?: PageableInput
) {
  return useLazyQuery(
    gql`
      query SearchActivities($searchPayload: SearchPayload, $pageable: Pageable) {
        searchActivities(searchPayload: $searchPayload, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            id
            missionId
            missionName
            activityName
            expectedTime
            endTime
            activityCode
            budget
            youHasExtensionDeadlineRequest 
            hostUnit
            description
            status
            coordinationUnitName
            youHaveSubmitActivityRequest
            createdBy
            createdTime
          }
        }
      }
    `,
    {
      searchPayload,
      pageable,
    },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function getDetailActivityById(id: string) {
  return useQuery(
    gql`
        query GetDetailActivityById($id: String){
            getDetailActivityById(id: $id){
                id
                missionId
                missionName
                activityName
                expectedTime
                endTime
                activityCode
                budget
                hostUnit
                description
                 parentActivity {
                    activityParentId
                    activityParentName
                }
                activityAttachments {
                    id
                    quote
                    attachment
                    size
                    downloadPath
                }
                requiredGeneralLeaderIdToApprove
                status
                coordinationUnitName
                coordinationUnitId
                createdBy
                createdTime
                }
            }
    `,
    { id },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteActivityById() {
  return useMutation(
    gql`
      mutation deleteActivityById($id: String!) {
        deleteActivity(id: $id)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getCountAllActivityStatus() {
  return useQuery(
    gql`
      query GetCountAllActivityStatus {
        getCountAllActivityStatus {
          totalAll
          new
          unProcessed
          inProgress
          completed
          waitingForGeneralLeaderApproveActivity
          waitingForApprovalExtensionDeadlineRequest
          generalLeaderRejectedActivity
        }
      }
    `,
    {},
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function getActivityHistoryById(data: { activityId: string | undefined; pageable: object }) {
  return useQuery(
    gql`
      query GetActivityHistoryById($activityId: String, $pageable: Pageable) {
        getActivityHistoryById(activityId: $activityId, pageable: $pageable) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            userEdit
            userEditTime
            note
          }
        }
      }
    `,
    { ...data },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only', 
    },
  );
}

function saveActivityDeadlineExtensionRequest() {
  return useMutation(
    gql`
      mutation saveActivityDeadlineExtensionRequest($activityDeadlineExtensionInput: ActivityDeadlineExtensionInput) {
        saveActivityDeadlineExtensionRequest(activityDeadlineExtensionInput: $activityDeadlineExtensionInput)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function generalLeaderApproveActivityDeadlineExtensionRequest() {
  return useMutation(
    gql`
      mutation generalLeaderApproveActivityDeadlineExtensionRequest(
        $activityId: String!
        $isApproved: Boolean!
        $reasonIfReject: String
      ) {
        generalLeaderApproveActivityDeadlineExtensionRequest(
          activityId: $activityId
          isApproved: $isApproved
          reasonIfReject: $reasonIfReject
        )
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllActivityDeadlineExtensionRequest(activityId: string) {
  return useQuery(
    gql`
        query getAllActivityDeadlineExtensionRequest($activityId: String!){
            getAllActivityDeadlineExtensionRequest(activityId: $activityId){
                 id
                  activityId
                  oldEndDeadline
                  newEndDeadline
                  generalLeaderId
                  reasonWhyExtension
                  approveByGeneralLeaderStatus
                  reasonIfReject
                  createdBy
                  createdTime
                }
            }
    `,
    { activityId },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getDetailActivityDeadlineExtensionRequest(activityId: string) {
  return useQuery(
    gql`
        query getDetailActivityDeadlineExtensionRequest($activityId: String!){
            getDetailActivityDeadlineExtensionRequest(activityId: $activityId){
                id
                activityId
                oldEndDeadline
                newEndDeadline
                generalLeaderId
                reasonWhyExtension
                approveByGeneralLeaderStatus
                reasonIfReject
                createdBy
                createdTime
                }
            }
    `,
    { activityId },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getActivityRelatedToMission(data: { missionId: string | undefined; pageable: object }) {
  return useQuery(
    gql`
        query getActivityRelatedToMission($missionId: String, $pageable: Pageable) {
            getActivityRelatedToMission(missionId: $missionId, pageable: $pageable) {
                page
                pageSize
                totalRecords
                totalPages
                content {
                    id
                    missionId
                    missionName
                    missionType
                    activityName
                    expectedTime
                    endTime
                    activityCode
                    budget
                    hostUnit
                    description
                    status
                    coordinationUnitName
                    createdBy
                    createdTime
                    youHasExtensionDeadlineRequest
                }
            }
        }
    `,
    { ...data },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function generalLeaderSubmitActivity() {
  return useMutation(
    gql`
      mutation generalLeaderSubmitActivity($generaLeaderSubmitActivityInput: GeneraLeaderSubmitActivityInput) {
        generalLeaderSubmitActivity(generaLeaderSubmitActivityInput: $generaLeaderSubmitActivityInput)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteActivityById,
  findAllActivity,
  generalLeaderApproveActivityDeadlineExtensionRequest,
  generalLeaderSubmitActivity,
  getActivityHistoryById,
  getActivityRelatedToMission,
  getAllActivityDeadlineExtensionRequest,
  getCountAllActivityStatus,
  getDetailActivityById,
  getDetailActivityDeadlineExtensionRequest,
  saveActivityDeadlineExtensionRequest,
  searchActivitiesGraphql
};