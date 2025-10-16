import { provideApolloClients, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { ReportProjectModel } from '@/apps/work/model/project';
import type { ReportMyTaskSearchModel } from '@/apps/work/model/task';
import apolloClients, { WORK_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

provideApolloClients(apolloClients);

function searchMyTasks(data: {
  searchModel: ReportMyTaskSearchModel;
  pageable: object;
}) {
  return useQuery(
    gql`
        query searchMyTasks(
            $searchModel: ReportMyTaskSearchModel
            $pageable: Pageable
        ) {
            searchMyTasks(searchModel: $searchModel, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        taskId
                        name
                        projectId
                        projectName
                        groupId
                        assignerId
                        assignerName
                        description
                        target
                        startTime
                        dueTime
                        percent
                        statusName
                        follower
                        createdTime
                    }
                }
            }
        }
    `,
    { ...data },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findAllTaskOfUsers(data: {
  pageable: object;
}) {
  return useQuery(
    gql`
        query findAllTaskOfUsers(
            $pageable: Pageable
        ) {
            findAllTaskOfUsers(pageable: $pageable) {
                totalCount
                edges {
                    node {
                        taskId
                        name
                        projectId
                        projectName
                        groupId
                        assignerId
                        assignerName
                        description
                        target
                        startTime
                        dueTime
                        percent
                        statusName
                        follower
                        createdTime
                        participantId
                        participantName
                    }
                }
            }
        }
    `,
    { ...data },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findAllTaskWithGroupType(data: {
  pageable: object;
}) {
  return useQuery(
    gql`
        query findAllTaskWithGroupType(
            $pageable: Pageable
        ) {
            findAllTaskWithGroupType(pageable: $pageable) {
                totalCount
                edges {
                    node {
                        taskId
                        name
                        projectId
                        projectName
                        groupId
                        assignerId
                        assignerName
                        description
                        target
                        startTime
                        dueTime
                        percent
                        statusName
                        follower
                        createdTime
                        participantId
                        participantName
                        groupName
                    }
                }
            }
        }
    `,
    { ...data },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function searchReportProject(data: {
  searchModel: ReportProjectModel;
  pageable: object;
}) {
  return useQuery(
    gql`
        query searchReportProject(
            $searchModel: ReportProjectModel
            $pageable: Pageable
        ) {
            searchReportProject(searchModel: $searchModel, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        admins
                        name
                        code
                        type
                        groupId
                        parentId
                        logo
                        implementers
                        followers
                        numbTask
                        description
                        sequenceNumber
                        progress
                        startDate
                        endDate
                        status
                        createdDate
                        typeName
                        groupName
                        parentProjName
                        totalTask
                        totalDoingTask
                        totalDoneTask
                        notOverdueTask
                        overdueTask
                        completedOnTime
                        completedLate
                        createdTime
                    }
                }
            }
        }
    `,
    { ...data },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getDeptTaskReport(data: { searchModel: ReportMyTaskSearchModel }) {
  return useQuery(
    gql`
        query getDeptTaskReport($searchModel: ReportMyTaskSearchModel) {
            getDeptTaskReport(searchModel: $searchModel) {
                organizationId
                organizationName
                totalTasks
                dueTasks
                overdueTasks
                totalDoingTasks
                stillDueDoingTasks
                overdueDoingTasks
                totalDoneTasks
                stillDueDoneTasks
                overdueDoneTasks
            }
        }
    `,
    { ...data },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getProjectManagementSummary() {
  return useQuery(
    gql`
        query getProjectManagementSummary {
            getProjectManagementSummary
        }
    `,
    {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { findAllTaskOfUsers, findAllTaskWithGroupType, getDeptTaskReport, getProjectManagementSummary, searchMyTasks, searchReportProject };
