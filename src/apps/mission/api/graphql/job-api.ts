import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MISSION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

import type { SearchJobInput } from '../../model/job/job';
import type { PageableInput } from '../../model/mission/mission';

function getAllJob() {
  return useQuery(
    gql`
        query GetAllJob{
            getAllJob{
                id
                activityId
                activityName
                missionId
                missionName
                startDate
                endDate
                budget
                hostUnit
                jobName
                jobCode
                jobType
                processingDeadline
                description
                mainHandler
            }
        }`,
    {},
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function searchJobGraphql(
  jobSearchDto?: SearchJobInput,
  pageable?: PageableInput
) {
  return useLazyQuery(
    gql`
        query SearchJob($jobSearchDto: JobSearchDto, $pageable: Pageable) {
            searchJob(jobSearchDto: $jobSearchDto, pageable: $pageable) {
                page
                pageSize
                totalRecords
                totalPages
                content {
                    id
                    jobName
                    jobCode
                    activityName
                    activityId
                    missionId
                    missionName
                    processingDeadline
                    hostUnit
                    createdTime
                    jobType
                    youHasExtensionDeadlineRequest
                    createdBy
                    flag
                    status
                    isCreator
                    jobReportStatus
                    isLeaderAccepted
                    budget
                    description
                    isEmployeeAccepted
                    isJobNeedToApproveByGeneralLeader
                    isAssignForLeaderYourself
                    assignerList {
                        assignId
                        assignType
                    }
                }
            }
        }
    `,
    {
      jobSearchDto,
      pageable,
    },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function getDetailJobById(id: string) {
  return useQuery(
    gql`
        query GetDetailJobById($id: String){
            getDetailJobById(id: $id){
                id
                activityId
                activityName
                missionId
                missionName
                startDate
                endDate
                budget
                hostUnit
                jobName
                jobCode
                jobType
                status
                processingDeadline
                isCreator
                description
                isJobNeedToApproveByGeneralLeader
                isAssignForLeaderYourself
                unitHandlers {
                    jobHandleId
                    jobContent
                    employmentContact
                    handleAttachmentFile {
                        fileId
                        fileName
                        downloadPath
                    }
                    assignList {
                        assignId
                        isMainHandle
                        isFollower
                    }
                }
                personalHandlers {
                    jobHandleId
                    jobContent
                    employmentContact
                    handleAttachmentFile {
                        fileId
                        fileName
                        downloadPath
                    }
                    assignList {
                        assignId
                        isMainHandle
                        isFollower
                    }
                }
                jobAttachments {
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

function deleteJob() {
  return useMutation(
    gql`
        mutation DeleteJob($id: String) {
            deleteJob(id: $id)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function acceptJob() {
  return useMutation(
    gql`
        mutation AcceptJob($id: String) {
            acceptJob(jobId: $id)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function denyJob() {
  return useMutation(
    gql`
        mutation DenyJob($denyJobInput: DenyJobInput) {
            denyJob(denyJobInput: $denyJobInput)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getCountAllJobStatus() {
  return useQuery(
    gql`
        query GetCountAllJobStatus {
            getCountAllJobStatus {
                new
                unProcessed
                inProgress
                completed
                totalAll
                totalReportJobToLeader
                totalReportJobGeneralLeaderApproved
                waitingForApprovalExtensionDeadlineRequest
                waitingForAccept
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

function deleteJobFileAttachment() {
  return useMutation(
    gql`
        mutation deleteJobFileAttachment($id: String!) {
            deleteJobFileAttachment(id: $id)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'no-cache',
    }
  );
}

function deleteJobHandleFileAttachment() {
  return useMutation(
    gql`
        mutation deleteJobHandleFileAttachment($id: String!) {
            deleteJobHandleFileAttachment(id: $id)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'no-cache',
    }
  );
}

function getJobHistoryByJobId(data: { jobId: string | undefined; pageable: object }) {
  return useQuery(
    gql`
        query GetJobHistoryByJobId($jobId: String, $pageable: Pageable) {
            getJobHistoryByJobId(jobId: $jobId, pageable: $pageable) {
                page
                pageSize
                totalRecords
                totalPages
                content {
                    id
                    jobId
                    actionTime
                    sendingUnit
                    userSendId
                    processingUnit
                    userProcessingId
                    status
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

function saveJobDeadlineExtensionRequest() {
  return useMutation(
    gql`
        mutation saveJobDeadlineExtensionRequest($jobDeadlineExtensionInput: JobDeadlineExtensionInput) {
            saveJobDeadlineExtensionRequest(jobDeadlineExtensionInput: $jobDeadlineExtensionInput)
        }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function generalLeaderApproveJobDeadlineExtensionRequest() {
  return useMutation(
    gql`
        mutation generalLeaderApproveJobDeadlineExtensionRequest(
            $jobId: String!
            $isApproved: Boolean!
            $reasonIfReject: String
        ) {
            generalLeaderApproveJobDeadlineExtensionRequest(
                jobId: $jobId
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

function getDetailJobDeadlineExtensionRequest(jobId: string) {
  return useQuery(
    gql`
        query getDetailJobDeadlineExtensionRequest($jobId: String!){
            getDetailJobDeadlineExtensionRequest(jobId: $jobId){
                id
                jobId
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
    { jobId },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllJobDeadlineExtensionRequest(jobId: string) {
  return useQuery(
    gql`
        query getAllJobDeadlineExtensionRequest($jobId: String!){
            getAllJobDeadlineExtensionRequest(jobId: $jobId){
                id
                jobId
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
    { jobId },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findAllJobAttachmentByJobIdIn(jobIds: string[]) {
  return useQuery(
    gql`
        query findAllJobAttachmentByJobIdIn($jobIds: [String]){
            findAllJobAttachmentByJobIdIn(jobIds: $jobIds){
                id
                quote
                attachment
                size
                downloadPath
            }
        }
    `,
    { jobIds },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getJobRelatedToActivity(data: { activityId: string | undefined; pageable: object }) {
  return useQuery(
    gql`
        query getJobRelatedToActivity($activityId: String, $pageable: Pageable) {
            getJobRelatedToActivity(activityId: $activityId, pageable: $pageable) {
                  page
                  pageSize
                  totalRecords
                  totalPages
                  content {
                      id
                      jobName
                      jobCode
                      jobType
                      activityId
                      activityName
                      missionId
                      missionName
                      missionType
                      processingDeadline
                      hostUnit
                      createdTime
                      createdBy
                      status
                      isCreator
                      isLeaderAccepted
                      isEmployeeAccepted
                      jobReportStatus
                      flag
                      youHasExtensionDeadlineRequest
                      assignerList {
                          assignId
                          assignType
                      }
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

function countJobTypeByStatus() {
  return useQuery(
    gql`
        query countJobTypeByStatus  {
            countJobTypeByStatus  {
                jobOnMission {
                    new
                    unProcessed
                    inProgress
                    completed
                    totalAll
                    totalReportJobToLeader
                    totalReportJobGeneralLeaderApproved
                    waitingForApprovalExtensionDeadlineRequest
                    waitingForAccept
                }
                jobOther {
                    new
                    unProcessed
                    inProgress
                    completed
                    totalAll
                    totalReportJobToLeader
                    totalReportJobGeneralLeaderApproved
                    waitingForApprovalExtensionDeadlineRequest
                    waitingForAccept
                }
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

function getJobCountByDepartment() {
  return useQuery(
    gql`
        query getJobCountByDepartment{
            getJobCountByDepartment{
                departmentId
                departmentName
                jobStatusCount {
                    new
                    unProcessed
                    inProgress
                    completed
                    totalAll
                    totalReportJobToLeader
                    totalReportJobGeneralLeaderApproved
                    waitingForAccept
                }
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

export {
  acceptJob,
  countJobTypeByStatus,
  deleteJob,
  deleteJobFileAttachment,
  deleteJobHandleFileAttachment,
  denyJob,
  findAllJobAttachmentByJobIdIn,
  generalLeaderApproveJobDeadlineExtensionRequest,
  getAllJob,
  getAllJobDeadlineExtensionRequest,
  getCountAllJobStatus,
  getDetailJobById,
  getDetailJobDeadlineExtensionRequest,
  getJobCountByDepartment,
  getJobHistoryByJobId,
  getJobRelatedToActivity,
  saveJobDeadlineExtensionRequest,
  searchJobGraphql
};