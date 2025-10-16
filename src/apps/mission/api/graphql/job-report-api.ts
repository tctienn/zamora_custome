import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MISSION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

import type { PageableInput } from '../../model/mission/mission';

export function searchJobReportToLeader(
  data?:{reportJobToLeaderSearchInput?: object, pageable?: PageableInput}) {
  return useQuery(
    gql`
      query SearchJobReportToLeader($reportJobToLeaderSearchInput: ReportJobToLeaderSearchInput, $pageable: Pageable) {
        searchJobReportToLeader(reportJobToLeaderSearchInput: $reportJobToLeaderSearchInput, pageable: $pageable) {
            page
            pageSize
            totalRecords
            totalPages
            content {
                id
                jobName
                activityName
                jobCode
                missionName
                processingDeadline
                hostUnit
                createdTime
                jobType
                createdBy
                status
                isCreator
                jobReportStatus
                isLeaderAccepted
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
    { ...data },
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

export function searchListJobReportLeaderSendToSpecificGeneralLeader (
  data?:{searchInput?: object, pageable?: PageableInput}) {
  return useQuery(
    gql`
      query SearchListJobReportLeaderSendToSpecificGeneralLeader ($searchInput: JobReportLeaderSendToSpecificGeneralLeaderSearchInput, $pageable: Pageable) {
        searchListJobReportLeaderSendToSpecificGeneralLeader (searchInput: $searchInput, pageable: $pageable) {
            page
            pageSize
            totalRecords
            totalPages
            content {
                id
                jobName
                jobType
                activityName
                jobCode
                missionName
                processingDeadline
                hostUnit
                createdTime
                createdBy
                status
                isCreator
                isLeaderAccepted
                isEmployeeAccepted
                jobReportStatus
                jobReportLeaderSendToGeneralLeaderStatus
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
    }
  );
}

export function getDetailJobReportToLeaderByJobId(jobId: string) {
  return useQuery(
    gql`
        query GetDetailJobReportToLeaderByJobId ($jobId: String){
            getDetailJobReportToLeaderByJobId (jobId: $jobId){
                  id
                  jobId
                  resultContent
                  isDraft
                  status
                  reportJobAttachments {
                      id
                      quote
                      attachment
                      draftDate
                      size
                      downloadPath
                  }
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

export function getDetailJobReportLeaderSendToGeneralLeaderByJobId(jobId: string) {
  return useQuery(
    gql`
        query GetDetailJobReportLeaderSendToGeneralLeaderByJobId ($jobId: String){
            getDetailJobReportLeaderSendToGeneralLeaderByJobId (jobId: $jobId){
                  id
                  jobId
                  resultContent
                  isDraft
                  status
                  reportJobAttachments {
                      id
                      quote
                      attachment
                      size
                      downloadPath
                  }
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

export function leaderDenyJobReportOfEmployee() {
  return useMutation(
    gql`
      mutation LeaderDenyJobReportOfEmployee($denyJobInput: DenyJobInput) {
        leaderDenyJobReportOfEmployee(denyJobInput: $denyJobInput)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function deleteJobReportToLeaderAttachment() {
  return useMutation(
    gql`
      mutation DeleteJobReportToLeaderAttachment($id: String) {
    deleteJobReportToLeaderAttachment(id: $id)
}
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function leaderApprovedJobReportOfEmployeeAndSendToGeneralLeaderForSignature() {
  return useMutation(
    gql`
      mutation LeaderApprovedJobReportOfEmployeeAndSendToGeneralLeaderForSignature($request: LeaderApprovedJobReportAndSendToGeneralLeaderForSignatureInput) {
        leaderApprovedJobReportOfEmployeeAndSendToGeneralLeaderForSignature(request: $request)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function generalLeaderPerformsSignatureOrRejectForReportSubmittedByLeader() {
  return useMutation(
    gql`
      mutation GeneralLeaderPerformsSignatureOrRejectForReportSubmittedByLeader($request: GeneralLeaderPerformsSignatureOrRejectForReportSubmittedByLeaderInput) {
        generalLeaderPerformsSignatureOrRejectForReportSubmittedByLeader(request: $request)
      }
    `,
    {
      clientId: MISSION_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}