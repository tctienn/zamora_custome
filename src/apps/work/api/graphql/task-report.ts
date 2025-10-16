import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { ReportStatus } from '@/apps/work/model/taskReport';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function getTaskReportsByTaskId(taskId: string, pageable: Pageable) {
  return useLazyQuery(
    gql`
          query getTaskReportsByTaskId($taskId: String,$pageable:Pageable){
              getTaskReportsByTaskId(taskId: $taskId,pageable:$pageable){
                  totalCount
                  edges {
                      node {
                          id
                          taskId
                          weight
                          percent
                          description
                          status
                          attachments {
                              id
                              name
                              extension
                              size
                              path
                          }
                          createdBy
                          createdTime
                          isAssignerSeen
                          taskEvaluation {
                              attachments {
                                  id
                                  name
                                  extension
                                  size
                                  path
                              }
                              description
                              percent
                              starRating
                              evaluationType
                              createdBy
                              createdTime
                          }

                      }
                  }
              }
          }
      `, {
      taskId,
      pageable
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function readTasksReport() {
  return useMutation(
    gql`
          mutation readReport($taskId: String){
              readReport(taskId: $taskId)
          }
      `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function countByTaskIdAndReportStatus(taskId: string, status: ReportStatus) {
  return useQuery(
    gql`
          query countByTaskIdAndReportStatus($taskId: String,$status:ReportStatus){
              countByTaskIdAndReportStatus(taskId: $taskId, status:$status)
          }
      `, {
      taskId: taskId,
      status: status
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { countByTaskIdAndReportStatus, getTaskReportsByTaskId, readTasksReport };