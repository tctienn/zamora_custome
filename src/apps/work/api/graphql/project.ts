import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import {
  FilterType, type SearchProjectPayload,
  type StatusProject,
} from '@/apps/work/views/project/model';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

export function getProjects(pageable: Pageable) {
  return useQuery(
    gql`
      query getProjects($pageable: Pageable) {
        getProjects(pageable: $pageable) {
          edges {
            node {
              id
              name
            }
          }
          totalCount
        }
      }
    `,
    { pageable: pageable },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getProjectGraphql(
  keyword?: string | null,
  projectStatus?: StatusProject | string,
  filterType?: FilterType | string,
  searchProjectPayload?: any
) {
  return useLazyQuery(
    gql`
      query getProjects(
        $keyword: String
        $projectStatus: ProjectStatus
        $filterType: FilterType
        $searchProjectPayload: SearchProjectPayload
      ) {
        getProjects(
          keyword: $keyword
          projectStatus: $projectStatus
          filterType: $filterType
          searchProjectPayload: $searchProjectPayload
        ) {
          totalFilter
          totalAdmin
          totalImplement
          totalFollow
          totalOrganization
          totalUnderConstruction
          totalPrepareForDeployment
          totalProcessing
          totalCompleted
          totalPause
          totalCancel
          totalClose
          projects {
            id
            admins
            name
            code
            type
            typeName
            groupId
            groupName
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
            isDeleted
            createdDate
            totalTask
            createdTime
            lastModifiedTime
            totalMessage
            totalAttachment
            isImportant
            images {
              downloadPath
            }
          }
        }
      }
    `,
    {
      keyword: keyword,
      projectStatus: projectStatus,
      filterType: filterType,
      searchProjectPayload: searchProjectPayload
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getProjectForAdminGraphql(
  keyword?: string | null,
  projectStatus?: StatusProject | string
) {
  return useLazyQuery(
    gql`
      query getProjectsForAdmin(
        $keyword: String
        $projectStatus: ProjectStatus
      ) {
        getProjectsForAdmin(
          keyword: $keyword
          projectStatus: $projectStatus
        ) {
          totalFilter
          totalAdmin
          totalImplement
          totalFollow
          totalOrganization
          totalUnderConstruction
          totalPrepareForDeployment
          totalProcessing
          totalCompleted
          totalPause
          totalCancel
          totalClose
          projects {
            id
            admins
            name
            code
            type
            typeName
            groupId
            groupName
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
            isDeleted
            createdDate
            totalTask
            createdTime
            lastModifiedTime
            totalMessage
            totalAttachment
            isImportant
            images {
              downloadPath
            }
          }
        }
      }
    `,
    {
      keyword: keyword,
      projectStatus: projectStatus
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getSeqNumber() {
  return useQuery(
    gql`
      query getSeqNumber {
        getSeqNumber
      }
    `,
    {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getProjectById(id: string) {
  return useQuery(
    gql`
        query getProjectById($projectId: String!){
            getProjectById(projectId: $projectId){
                ${commonProjectInfo}
                recipe{
                      id
                      projectId
                      type
                      configImplementer
                      configFollower
                }
            }
        }
    `,
    { projectId: id },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getProjectDetail() {
  return useLazyQuery(
    gql`
        query getProjectDetail($id:String!){
            getProjectDetail(id:$id){
                ${commonProjectInfo}
                createdBy
                groupName
                typeName
                parentProjName
                totalTask
                projectImportant{
                  isImportant
                  projectId
                }
                recipe{
                  type
                }
                projectLabel{
                  labelName
                  labelColor
                }
            }
        }
    `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getAllProjects() {
  return useLazyQuery(
    gql`
      query getAllProjects {
        getAllProjects {
          id
          name
        }
      }
    `,
    {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

const commonProjectInfo = `
                    id
                    code
                    name
                    type
                    groupId
                    parentId
                    startDate
                    endDate
                    logo
                    admins
                    implementers
                    followers
                    description
                    status
                    createdDate
                    progress
                    totalValue
                    numberDate
                    createdBy
                    sequenceNumber`;

export function updateStatus() {
  return useMutation(
    gql`
      mutation updateStatus($projectId: String, $status: ProjectStatus) {
        updateStatus(projectId: $projectId, status: $status) {
          id
        }
      }
    `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function copyProject() {
  return useMutation(
    gql`
      mutation copyProject($projectId: String) {
        copyProject(projectId: $projectId)
      }
    `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function deleteProjectById() {
  return useMutation(
    gql`
      mutation deleteProjectById($projectId: String!) {
        deleteProjectById(projectId: $projectId) {
          id
        }
      }
    `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function readProjectById() {
  return useMutation(
    gql`
      mutation readProjectById($projectId: String!) {
        readProjectById(projectId: $projectId) {
          id
        }
      }
    `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getSummaryParticipantProject(projectId: string) {
  return useLazyQuery(
    gql`
      query getSummaryParticipantProject($projectId: String!) {
        getSummaryParticipantProject(projectId: $projectId) {
          participantId
          taskCount
          taskStatusCount {
            completed
            working
            other
          }
        }
      }
    `,
    { projectId: projectId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getSummaryTaskProject(projectId: string) {
  return useLazyQuery(
    gql`
      query getSummaryTaskProject($projectId: String!) {
        getSummaryTaskProject(projectId: $projectId) {
          other
          totalTask
          overdue
          completed {
            total
            beforeTime
            onTime
            overTime
          }
          onGoing {
            total
            beforeTime
            overTime
          }
        }
      }
    `,
    { projectId: projectId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function getProjectsRelateWithId(userId?: string) {
  return useLazyQuery(
    gql`
      query getProjectsRelateWithId($userId: String) {
        getProjectsRelateWithId(userId: $userId) {
          id
          name
          implementers
        }
      }
    `,
    { userId: userId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function updateDescriptionProject() {
  return useMutation(
    gql`
      mutation updateDescriptionProject($projectId: String, $description: String, $implements: [String], $followers: [String]) {
        updateDescriptionProject(projectId: $projectId, description: $description, implements: $implements, followers : $followers) {
          id
        }
      }
    `,
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}
