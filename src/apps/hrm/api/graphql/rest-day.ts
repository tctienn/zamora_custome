import { useLazyQuery, useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function searchRestDay(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable) {
            searchRestDay(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        restDayName
                        note
                        fromDate
                        toDate
                        year
                    }
                }
            }
        }
    `,
    { ...data },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getRestDayById(id: string) {
  return useQuery(
    gql`
        query ($id: String) {
            getRestDayById(id: $id) {
                id
                restDayName
                note
                fromDate
                toDate
                year
            }
        }
    `,
    { id },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllRestDay() {
  return useQuery(
    gql`
        query getAllRestDay {
            getAllRestDay {
                id
                restDayName
                note
                fromDate
                toDate
                year
            }
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveRestDay() {
  return useMutation(
    gql`
        mutation saveRestDay($restDay: RestDayModel) {
            saveRestDay(restDay: $restDay) {
                id
                restDayName
                note
                fromDate
                toDate
                year
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function duplicateRestDay() {
  return useMutation(
    gql`
        mutation duplicateRestDay($ids: String) {
            duplicateRestDay(ids: $ids)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteRestDay() {
  return useMutation(
    gql`
        mutation deleteRestDay($id: String) {
            deleteRestDay(id: $id) {
                id
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getNumberDay() {
  return useLazyQuery(
    gql`
        query getNumberDay($dateA: Date, $dateB: Date) {
            getNumberDay(dateA: $dateA, dateB: $dateB)
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getRestDayInWeek() {
  return useQuery(
    gql`
        query getRestDayInWeek {
            getRestDayInWeek {
                restOnWeek
            }
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveRestDayInWeek() {
  return useMutation(
    gql`
        mutation saveRestDayInWeek($restDayInWeek: RestDayInWeekModel) {
            saveRestDayInWeek(restDayInWeek: $restDayInWeek)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteRestDay,
  duplicateRestDay,
  getAllRestDay,
  getNumberDay,
  getRestDayById,
  getRestDayInWeek,
  saveRestDay,
  saveRestDayInWeek,
  searchRestDay,
};
