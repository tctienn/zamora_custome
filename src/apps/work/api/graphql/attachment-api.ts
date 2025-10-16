import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAttachmentsMyWorkGraphql() {
  return useQuery(
    gql`
        query {
            getAttachmentsMyWork {
                id
                name
                extension
                path
                size
                taskId
                orderNo
                objectType
                objectId
            }
        }
    `,
    {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchAttachmentsMyWorkGraphql(defaultParam: { searchCondition: string, pageable: object }) {
  return useQuery(
    gql`
        query ($searchCondition: String, $pageable : Pageable) {
            searchAttachmentsMyWork(searchCondition: $searchCondition, pageable : $pageable) {
                edges {
                    node {
                        id
                        name
                        extension
                        path
                        size
                        taskId
                        orderNo
                        objectType
                        objectId
                        taskName
                        createdTime
                        createdBy
                        createdName
                        lastModifiedTime
                        lastModifiedBy
                    }
                }
                totalCount
            }
        }
    `,
    { ...defaultParam }
    , {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getFileByIdGraphql(id: string) {
  return useQuery(
    gql`
        query($id: String) {
            getFileById(id: $id) {
                id
                name
                extension
                path
                size
                taskId
                taskName
                orderNo
                objectType
                objectId
                createdTime
                createdBy
                createdName
                lastModifiedTime
                lastModifiedBy
                lastModifiedName
            }
        }
    `,
    { id },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getFilesByIdsGraphql(ids: string[]) {
  return useQuery(
    gql`
        query($ids: [String]) {
            getFilesByIds(ids: $ids) {
                id
                name
                extension
                path
                size
                taskId
                orderNo
                objectType
                objectId
            }
        }
    `,
    { ids },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getAttachmentsMyWorkGraphql, getFileByIdGraphql, getFilesByIdsGraphql, searchAttachmentsMyWorkGraphql };
