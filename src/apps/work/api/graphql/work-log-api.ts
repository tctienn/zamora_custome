import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ObjectType } from '@/apps/work/model/logWorkAttachment';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function getActivityByWorkId(workId: string, pageable: Pageable) {
  return useLazyQuery(
    gql`
        query getActivityByWorkId($workId: String!,$pageable:Pageable){
            getActivityByWorkId(workId: $workId,pageable:$pageable){
                edges {
                    node {
                        workId
                        objectId
                        action
                        objectType
                        newValue
                        oldValue
                        createdTime
                        createdBy
                    }
                }
                totalCount
            }
        }
    `, {
      workId: workId,
      pageable: pageable
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getViewsByWorkId(workId: string) {
  return useLazyQuery(
    gql`
        query getViewsByWorkId($workId: String!){
            getViewsByWorkId(workId: $workId){
                userId
                views
                lastViewTime
            }
        }
    `, { workId: workId },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findByWorkIdAndObjectType(projectId: string, objectType: ObjectType) {
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

function readWorkById() {
  return useMutation(
    gql`
        mutation readWorkById($workId: String!){
            readWorkById(id: $workId){
                id
                name
            }
        }
    `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { findByWorkIdAndObjectType, getActivityByWorkId, getViewsByWorkId, readWorkById };
