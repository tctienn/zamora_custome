import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query search($keyword: String, $pageable: Pageable){
            search(keyword: $keyword, pageable: $pageable){
                totalCount
                edges{
                    node{
                        id
                        name
                        type
                        description
                        color
                        orderNo
                    }
                }
            }
        }
    `, { ...data },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function allStatus() {
  return useQuery(
    gql`
        {
            allStatus {
                id
                name
                orderNo
                type
                color
            }
        }
    `, {},
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    });
}

function addOrUpdateConfigStatusGraphql() {
  return useMutation(
    gql`
        mutation addOrUpdateConfigStatus($statusInput: StatusInput){
            addOrEditConfigStatus(statusInput: $statusInput){
                id
                color
                description
                name
                type
                orderNo
            }
        }
    `, { clientId: WORK_CLIENT_ID }
  );
}

function deleteConfigStatusGraphql() {
  return useMutation(
    gql`
        mutation deleteConfigStatus($id: String){
            deleteConfigStatus(id: $id)
        }
    `, { clientId: WORK_CLIENT_ID }
  );
}

function findStatusesCountGraphql(data: { fromDate: string, toDate: string }) {
  return useQuery(
    gql`
        query($fromDate: DateTime, $toDate: DateTime) {
            findStatusesCount(fromDate: $fromDate,toDate: $toDate){
                id
                name
                type
                color
                count
            }
        }
    `, { ...data }, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findAllStatusGraphql() {
  return useQuery(
    gql`
        query {
            allStatus {
                id
                name
                type
                color
                description
                orderNo
            }

        }
    `, {}, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { addOrUpdateConfigStatusGraphql, allStatus, deleteConfigStatusGraphql, findAllStatusGraphql, findStatusesCountGraphql, searchGraphql };

