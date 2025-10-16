import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MISSION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

import type { PageableInput, SearchMissionInput, SearchNoteInput } from '../../model/mission/mission';

function searchMissionsGraphql(
  searchModel?: SearchMissionInput,
  pageable?: PageableInput
) {
  return useLazyQuery(
    gql`
      query SearchMissions($searchModel: SearchModel, $pageable: Pageable) {
        searchMissions(searchModel: $searchModel, pageable: $pageable) {  
          totalCount
          pageInfo {
            startCursor
            endCursor
            hasPreviousPage
            hasNextPage
          }
          edges {
            cursor
            node {
              id
              name
              missionType
              code
              budget
              startDate
              endDate
              hostUnit
              description
              status
              youHasExtensionDeadlineRequested 
              createdTime
              createdBy
            }
          }
        }
      }
    `,
    {
      searchModel,
      pageable,
    },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}
function findAllMission() {
  return useQuery(
    gql`
        query findAllMission {
            findAllMission {
                id
                name
                missionType
                code
                budget
                startDate
                endDate
                hostUnit
                description
                status
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
function deleteMissionById() {
  return useMutation(
    gql`
      mutation deleteMissionById($id: String!) {
        deleteMission(id: $id)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}
function getMissionDetailById(id: string) {
  return useQuery(
    gql`
        query getMissionDetailById($id: String!){
            getMissionDetailById(id: $id){
                id
                name
                missionType
                code
                budget
                startDate
                endDate
                hostUnit
                description
                status
                createdTime
                createdBy
                parentMission {
                    missionParentId
                    missionParentName
                }
                attachments {
                  id
                  quote
                  attachment
                  size
                  downloadPath
              }
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

function getCountAllMissionStatus() {
  return useQuery(
    gql`
      query GetCountAllMissionStatus {
        getCountAllMissionStatus {
          totalAll
          new
          unProcessed
          inProgress
          waitingForApprovalExtensionDeadlineRequest
          completed
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

function deleteMissionFileAttachment() {
  return useMutation(
    gql`
      mutation deleteMissionFileAttachment($id: String!) {
        deleteMissionFileAttachment(id: $id)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'no-cache', // hoặc 'network-only' tùy trường hợp
    }
  );
}

function getJobEvaluationListGraphql(
  jobEvaluationSearchInput?: SearchNoteInput,
  pageable?: PageableInput
) {
  return useLazyQuery(
    gql`
      query GetJobEvaluationList(
        $jobEvaluationSearchInput: JobEvaluationSearchInput
        $pageable: Pageable
      ) {
        getJobEvaluationList(
          jobEvaluationSearchInput: $jobEvaluationSearchInput
          pageable: $pageable
        ) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            handlerName
            grade
            handlerOrganizationName
            flagSummary {
                totalYellowFlag
                totalRedFlag
                totalGreenFlag
            }
            jobOnMissionCount {
              totalJobByMission
              totalJobOnMissionCompletedAheadOfSchedule
              totalJobOnMissionCompletedOnTime
              totalJobOnMissionCompletedLateOnTime
              totalJobOnMissionInProgress
              totalJobOnMissionUnprocessed
              totalJobOnMissionNew
            }
            jobOtherCount {
              totalJobOnOther
              totalJobOtherCompletedAheadOfSchedule
              totalJobOtherCompletedOnTime
              totalJobOtherCompletedLateOnTime
              totalJobOtherInProgress
              totalJobOtherUnprocessed
              totalJobOtherNew
            }
          }
        }
      }
    `,
    {
      jobEvaluationSearchInput,
      pageable,
    },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function getMissionHistoryById(data: { missionId: string | undefined; pageable: object }) {
  return useQuery(
    gql`
      query GetMissionHistoryById($missionId: String, $pageable: Pageable) {
        getMissionHistoryById(missionId: $missionId, pageable: $pageable) {
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
function saveMissionDeadlineExtensionRequest() {
  return useMutation(
    gql`
      mutation saveMissionDeadlineExtensionRequest($missionDeadlineExtensionInput: MissionDeadlineExtensionInput) {
        saveMissionDeadlineExtensionRequest(missionDeadlineExtensionInput: $missionDeadlineExtensionInput)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function generalLeaderApproveMissionDeadlineExtensionRequest() {
  return useMutation(
    gql`
      mutation GeneralLeaderApproveMissionDeadlineExtensionRequest(
        $missionId: String!
        $isApproved: Boolean!
        $reasonIfReject: String
      ) {
        generalLeaderApproveMissionDeadlineExtensionRequest(
          missionId: $missionId
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

function getAllMissionDeadlineExtensionRequest(missionId: string) {
  return useQuery(
    gql`
        query getAllMissionDeadlineExtensionRequest($missionId: String!){
            getAllMissionDeadlineExtensionRequest(missionId: $missionId){
                id
                missionId
                currentStartDeadline
                currentEndDeadline
                newStartDeadline
                newEndDeadline
                reasonWhyExtension
                generalLeaderId
                approveByGeneralLeaderStatus
                reasonIfReject
                createdBy
                createdTime
                }
            }
    `,
    { missionId },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getDetailMissionDeadlineExtensionRequest(missionId: string) {
  return useQuery(
    gql`
        query getDetailMissionDeadlineExtensionRequest($missionId: String!){
            getDetailMissionDeadlineExtensionRequest(missionId: $missionId){
                id
                missionId
                currentStartDeadline
                currentEndDeadline
                newStartDeadline
                newEndDeadline
                reasonWhyExtension
                generalLeaderId
                approveByGeneralLeaderStatus
                reasonIfReject
                createdBy
                createdTime
                }
            }
    `,
    { missionId },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getMissionActivityJobProgress(missionId: string) {
  return useQuery(
    gql`
        query getMissionActivityJobProgress($missionId: String!){
            getMissionActivityJobProgress(missionId: $missionId){
                missionId
                missionCode
                missionName
                missionStatus
                startDate
                endDate
                level
                activityProgress {
                    activityId
                    activityCode
                    activityName
                    activityStatus
                    startDate
                    endDate
                    level
                    jobProgress {
                        jobId
                        jobCode
                        jobName
                        jobStatus
                        startDate
                        endDate
                        handlerName
                        handlerDepartmentName
                        level
                    }
                }
                }
            }
    `,
    { missionId },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteMissionById,
  deleteMissionFileAttachment,
  findAllMission,
  generalLeaderApproveMissionDeadlineExtensionRequest,
  getAllMissionDeadlineExtensionRequest,
  getCountAllMissionStatus,
  getDetailMissionDeadlineExtensionRequest,
  getJobEvaluationListGraphql,
  getMissionActivityJobProgress,
  getMissionDetailById,
  getMissionHistoryById,
  saveMissionDeadlineExtensionRequest,
  searchMissionsGraphql
};