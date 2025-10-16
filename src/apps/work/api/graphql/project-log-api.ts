import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { ProjectLogType } from '@/apps/work/model/projectLog';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getProjectLog(projectId: string) {
  return useQuery(
    gql`
            query getProjectLog($projectId: String!){
               getProjectLog(projectId: $projectId){
                   projectId
                   objectId
                   action
                   objectType
                   newValue
                   oldValue
                   createdTime
                   createdBy
               }
            }
        `, { projectId: projectId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getViewsByProjectId(projectId: string) {
  return useQuery(
    gql`
            query getViewsByProjectId($projectId: String!){
                getViewsByProjectId(projectId: $projectId){
                    userId
                    views
                    lastViewTime
                }
            }
        `, { projectId: projectId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findByProjectIdAndObjectType(projectId: string, objectType: ProjectLogType) {
  return useQuery(
    gql`
            query findByProjectIdAndObjectType($projectId: String!, $objectType: ObjectType){
                findByProjectIdAndObjectType(projectId: $projectId, objectType: $objectType){
                   projectId
                   objectId
                   action
                   objectType
                   newValue
                   oldValue
                   createdTime
                   createdBy
                }
            }
        `, {
      projectId: projectId,
      objectType: objectType
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { findByProjectIdAndObjectType, getProjectLog, getViewsByProjectId };
