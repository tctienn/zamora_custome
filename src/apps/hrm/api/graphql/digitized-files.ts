import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { SearchDigitizedFilePayload } from '@/apps/hrm/model/fileDigitized';
import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function getDigitizedFileData(employeeId: string) {
  return useQuery(
    gql`
        query GetDigitizedFileForEmployee($employeeId: String!) {
            getDigitizedFileForEmployee(employeeId: $employeeId){
                 fileName
                    size
                    extension
                    createdTime
                    createdBy
                    type
                    path
                    employeeId
                    employeeName
                    employeeAvatar
            }
        }`,
    { employeeId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getChartDigitizedFileData() {
  return useQuery(
    gql`
        query getChartDigitizedFile{
            getChartDigitizedFile{
                totalPdf
                totalWord
                totalExcel
                totalImage
                totalOther
                size
                }
            }`,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getHistoryUserLogFile() {
  return useQuery(
    gql`
        query getHistory{
            getHistory{
                userId
                viewed
                downloaded
                recentTimes
                }
            }`,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getDigitizedFileAllData(payload: SearchDigitizedFilePayload, pageable: Pageable) {
  return useQuery(
    gql`
        query getDigitizedFile($payload: SearchDigitizedFilePayload, $pageable: Pageable) {
            getDigitizedFile(payload: $payload, pageable: $pageable) {
                totalCount
                pageInfo{
                    hasPreviousPage
                    hasNextPage
                }
                edges{
                    cursor
                    node{
                        fileName
                        size
                        extension
                        createdTime
                        createdBy
                        type
                        path
                        employeeId
                        employeeName
                        employeeAvatar
                    }
                }
            }
        }`,
    {
      payload,
      pageable
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveHistoryUserLogFile() {
  return useMutation(
    gql`
        mutation saveHistory($userId: String, $viewed: Boolean, $downloaded: Boolean){
            saveHistory(userId: $userId, viewed: $viewed, downloaded: $downloaded) {
                userId
                viewed
                downloaded
                recentTimes
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  getChartDigitizedFileData,
  getDigitizedFileAllData,
  getDigitizedFileData,
  getHistoryUserLogFile,
  saveHistoryUserLogFile
};