import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function deleteInsurance() {
  return useMutation(
    gql`
        mutation deleteInsurance($id: String!) {
            deleteInsurance(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function createInsuranceIfNotExist() {
  return useMutation(
    gql`
        mutation createInsuranceIfNotExist {
            createInsuranceIfNotExist
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getInsuranceById(id: string) {
  return useQuery(
    gql`
        query getInsuranceById($id: String!) {
            getInsuranceById(id: $id) {
                employeeId
                codeBHXH
                bookNumBHXH
                organizationId
                socialInsuranceProvinceCode
                cardNumBHYT
                medicalExaminationCode
                hospitalCode
                socialInsuranceParticipation
            }
        }
    `, { id },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getInsuranceByMonthAndId(id: string) {
  return useQuery(
    gql`
        query getInsuranceByMonthAndId($id: String) {
            getInsuranceByMonthAndId(id: $id)
        }
    `, { id },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllInsurance() {
  return useQuery(
    gql`
        query getAllInsurance {
            getAllInsurance {
                employeeId
                codeBHXH
                bookNumBHXH
                organizationId
                socialInsuranceProvinceCode
                cardNumBHYT
                medicalExaminationCode
                hospitalCode
                socialInsuranceParticipation
                files {
                    id
                    type
                    name
                    extension
                    path
                    size
                }
                employee {
                    jobTitle
                    fullName
                    avatar
                    positionName
                    joinDate
                }
            }
        }
    `, {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getInsuranceByMonth() {
  return useLazyQuery(
    gql`
        query getInsuranceByMonth($searchInsurance: SearchInsurance, $month: Int, $year: Int, $pageable: Pageable) {
            getInsuranceByMonth(searchInsurance: $searchInsurance, month: $month, year: $year, pageable: $pageable)
        }
    `, {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getFormInsuranceByMonth(data: { month: number, year: number, pageable: Pageable }) {
  return useQuery(
    gql`
        query getFormInsuranceByMonth($month: Int, $year: Int, $pageable: Pageable) {
            getFormInsuranceByMonth(month: $month, year: $year, pageable: $pageable)
        }
    `, { ...data },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function generateInsuranceInfoByMonth() {
  return useMutation(
    gql`
        mutation generateInsuranceInfoByMonth {
            generateInsuranceInfoByMonth
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveInsuranceByMonth() {
  return useMutation(
    gql`
        mutation saveInsuranceByMonth($input: InsuranceByMonthList) {
            saveInsuranceByMonth(input: $input)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function searchInsurance() {
  return useLazyQuery(
    gql`
        query searchInsurance($searchInsurance: SearchInsurance, $pageable: Pageable) {
            searchInsurance(searchInsurance: $searchInsurance, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        employeeId
                        codeBHXH
                        bookNumBHXH
                        organizationId
                        socialInsuranceProvinceCode
                        cardNumBHYT
                        medicalExaminationCode
                        hospitalCode
                        socialInsuranceParticipation
                        createdBy
                        createdTime
                        status
                        employee {
                            joinDate
                            fullName
                            avatar
                            jobTitle
                            code
                            positionName
                        }
                    }
                }
            }
        }
    `, {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllWorkProcessInternalByEmployeeId(employeeId: string) {
  return useQuery(
    gql`
        query getAllWorkProcessInternalByEmployeeId($employeeId: String) {
            getAllWorkProcessInternalByEmployeeId(employeeId: $employeeId)
        }
    `, { employeeId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getInsuranceDataByEmployeeId(employeeId: string) {
  return useQuery(
    gql`
        query GetInsuranceByEmployeeId($employeeId: String) {
            getInsuranceByEmployeeId(employeeId: $employeeId) {
                employeeId
                codeBHXH
                bookNumBHXH
                organizationId
                socialInsuranceProvinceCode
                cardNumBHYT
                medicalExaminationCode
                hospitalCode
                status
                socialInsuranceParticipation
                createdBy
                createdTime
            }
        }
    `, { employeeId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getTotalInsuranceByMonth(data: { searchInsurance: any, month: number, year: number }) {
  return useQuery(
    gql`
        query getTotalInsuranceByMonth($searchInsurance: SearchInsurance, $month: Int, $year: Int) {
            getTotalInsuranceByMonth(searchInsurance: $searchInsurance, month: $month, year: $year)
        }
    `, { ...data },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getInsuranceGroupedByYear(employeeId: string) {
  return useQuery(
    gql`
        query GetInsuranceGroupedByYear($employeeId: String){
            getInsuranceGroupedByYear(employeeId: $employeeId)
        }
    `,
    { employeeId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  createInsuranceIfNotExist,
  deleteInsurance,
  generateInsuranceInfoByMonth,
  getAllInsurance,
  getAllWorkProcessInternalByEmployeeId,
  getFormInsuranceByMonth,
  getInsuranceById, getInsuranceByMonth,
  getInsuranceByMonthAndId,
  getInsuranceDataByEmployeeId,
  getInsuranceGroupedByYear,
  getTotalInsuranceByMonth,
  saveInsuranceByMonth,
  searchInsurance
};