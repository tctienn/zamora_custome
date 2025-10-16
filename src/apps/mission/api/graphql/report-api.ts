import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { MISSION_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

import type { PageableInput } from '../../model/mission/mission';
import type { ISearchMissionReport } from '../../model/report/report';

export function getMissionListToReport(data:{searchMissionReport: ISearchMissionReport, pageable: PageableInput}) {
  return useQuery(
    gql`
      query GetMissionListToReport(
        $searchMissionReport: SearchMissionReportOrExportReq
        $pageable: Pageable
      ) {
        getMissionListToReport(
          searchMissionReportOrExportReq: $searchMissionReport
          pageable: $pageable
        ) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            name
            description
            completedTime
            hostUnit
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

export function getActivityListToReport(data:{searchActivityReport: ISearchMissionReport, pageable: PageableInput}) {
  return useQuery(
    gql`
      query getActivityListToReport(
        $searchActivityReport: SearchActivityReport
        $pageable: Pageable
      ) {
        getActivityListToReport(
          searchActivityReport: $searchActivityReport
          pageable: $pageable
        ) {
          page
          pageSize
          totalRecords
          totalPages
          content {
            activityName
            activityDescription
            completedTime
            hostUnit
            coordinationUnitName
            activityBudget
            jobName
            otherInformation
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

export function getActivityDeploymentListToReport(data:{searchActivityDeploymentReport: ISearchMissionReport, pageable: PageableInput}) {
  return useQuery(
    gql`
      query GetActivityDeploymentListToReport(
        $searchActivityDeploymentReport: SearchActivityDeploymentReport
        $pageable: Pageable
      ) {
        getActivityDeploymentListToReport(
            searchActivityDeploymentReport: $searchActivityDeploymentReport
            pageable: $pageable
        ) {
            page
            pageSize
            totalRecords
            totalPages
            content {
                jobName
                implementationUnit
                jobDesc
                completedTime
                jobBudget
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
};

export function getActivityAssignmentListToReport(data:{searchActivityAssignmentReport: ISearchMissionReport, pageable: PageableInput}) {
  return useQuery(
    gql`
      query GetActivityAssignmentListToReport (
        $searchActivityAssignmentReport: SearchActivityAssignmentReport
        $pageable: Pageable
      ) {
        getActivityAssignmentListToReport (
            searchActivityAssignmentReport: $searchActivityAssignmentReport
            pageable: $pageable
        ) {
            page
            pageSize
            totalRecords
            totalPages
            content {
                jobName
                implementationPerson
                jobDesc
                completedTime
                jobBudget
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
};