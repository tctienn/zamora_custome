import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { type ContractFilter } from '@/apps/hrm/model/contract';
import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function searchContracts(filter: ContractFilter, pageable: Pageable) {
  return useLazyQuery(
    gql`
        query searchContracts($filter: ContractFilter, $pageable: Pageable) {
            searchContracts(filter: $filter, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        employeeId
                        employee {
                            fullName
                            avatar
                        }
                        code
                        type
                        workType
                        organization
                        organizationName
                        effectiveDate
                        expiryDate
                        signedDate
                        status
                        createdTime
                        isContractConcurrent
                        attachments{
                            id
                            objectId
                            name
                            extension
                            path
                            size
                            type
                            fileName
                        }
                        hdTemplate
                        hasContractAppendix
                    }
                }
            }
        }
    `,
    {
      filter,
      pageable,
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countContracts(filter: ContractFilter) {
  return useQuery(
    gql`
        query countContracts($filter: ContractFilter) {
            countContracts(filter: $filter)
        }
    `,
    { filter, },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countStatusContracts(organization?: string) {
  return useQuery(
    gql`
        query countStatusContracts($organization: String) {
            countStatusContracts(organization: $organization) {
                status
                count
            }
        }
    `,
    { organization },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function findContractById(id: string) {
  return useQuery(
    gql`
        query findContractById($id: String!) {
            findContractById(id: $id) {
                id
                employeeId
                code
                type
                organization
                organizationName
                jobTitle
                position
                jobTitleName
                positionName
                rank
                workType
                workLocation
                workingHoursPerWeek
                workDescription
                managerId
                employeeType
                employeeRank
                effectiveDate
                expiryDate
                signedDate
                signatory
                status
                orderNumber
                createdTime
                haveInsurance
                professionalWork
                salary {
                    id
                    type
                    jobTitle
                    rank
                    grade
                    scale
                    coefficient
                    coefficientSalary
                    regionalMinimum
                    agreementSalary
                    totalSalary

                    bonuses {
                        id
                        salaryId
                        type
                        amount
                    }
                }

                attachments{
                    id
                    objectId
                    name
                    extension
                    path
                    size
                    type
                    fileName
                }
                hasContractAppendix
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

function setContractStatus() {
  return useMutation(
    gql`
        mutation setContractStatus($id: String!, $status: ContractStatus!) {
            setContractStatus(id: $id, status: $status)
        }
    `,
    { clientId: HRM_CLIENT_ID, },
  );
}

function findContractByEmployeeIdAndStatus() {
  return useLazyQuery(
    gql`
        query findContractByEmployeeIdAndStatus($employeeId: String, $contractStatus: ContractStatus){
            findContractByEmployeeIdAndStatus(employeeId: $employeeId, contractStatus: $contractStatus){
                id
                employeeId
                code
                type
                organization
                organizationName
                jobTitle
                position
                jobTitleName
                positionName
                rank
                workType
                workLocation
                workingHoursPerWeek
                workDescription
                managerId
                employeeType
                employeeRank
                effectiveDate
                expiryDate
                signedDate
                signatory
                status
                orderNumber
                createdTime

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

function findContractByEmployeeId(employeeId: string) {
  return useQuery(
    gql`
        query findContractByEmployeeId($employeeId: String){
            findContractByEmployeeId(employeeId: $employeeId){
                id
                employeeId
                code
                type
                organization
                organizationName
                jobTitle
                position
                jobTitleName
                positionName
                rank
                workType
                workLocation
                workingHoursPerWeek
                workDescription
                managerId
                employeeType
                employeeRank
                effectiveDate
                expiryDate
                signedDate
                signatory
                status
                orderNumber
                createdTime

            }
        }
    `,
    { employeeId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countEmployeeInOrganization(organizationId: string | null = null) {
  return useQuery(
    gql`
        query countEmployeeInOrganization($organizationId: String) {
            countEmployeeInOrganization(organizationId: $organizationId) {
                organizationId
                organizationName
                totalEmp
                isRoot
            }
        }
    `,
    { organizationId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function dashboardWorkStatus(organizationId: string | null = null) {
  return useQuery(
    gql`
        query DashboardWorkStatus($organizationId: String) {
            dashboardWorkStatus(organizationId: $organizationId) {
                partyCount
                totalContractDashboard {
                    totalAll
                    totalValid
                    totalExpired
                }
                employeeWorkingStatusCount {
                    status
                    count
                }
            }
        }
    `,
    { organizationId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function listHdTemplates() {
  return useQuery(
    gql`
        query listHdTemplates{
            listHdTemplates
        }
    `,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getEmployeeContractReport(pageable: Pageable) {
  return useQuery(
    gql`
        query getEmployeeContractReport($pageable: Pageable) {
            getEmployeeContractReport(pageable: $pageable) {
                edges {
                    node {
                        employeeId
                        snapshotId
                        organizationId
                        organizationName
                        code
                        fullName
                        birthDay
                        position
                        jobTitle
                        joinDate

                        contract {
                            id
                            employeeId
                            code
                            type
                            organization
                            organizationName
                            jobTitle
                            position
                            jobTitleName
                            positionName
                            rank
                            workType
                            workLocation
                            workingHoursPerWeek
                            workDescription
                            managerId
                            employeeType
                            employeeRank
                            effectiveDate
                            expiryDate
                            signedDate
                            signatory
                            status
                            orderNumber
                            createdTime
                        }

                        contractSalary{
                            jobTitle
                            rank
                            type
                            grade
                            scale
                            coefficient
                            coefficientSalary
                            regionalMinimum
                            agreementSalary
                            totalSalary
                        }

                        contractSalaryBonus{
                            type
                            amount
                        }
                        hasContractAppendix
                    }
                }
            }

        }
    `,
    { pageable },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function professionalSkillsReport() {
  return useQuery(
    gql`
        query professionalSkillsReport{
            professionalSkillsReport{
                code
                fullName
                organizationName
                gender
                age
                nation
                listProfessionalSkills
                generalLevel
                professionalLevel
                fromDate
                isParty
                position
                jobTitle
                address
                birthDay
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

function getAllContractAppendix(contractId: string) {
  return useQuery(
    gql`
        query getAllContractAppendix($contractId: String) {
            getAllContractAppendix(contractId: $contractId) {
                id
                contractId
                employeeId
                numContractAppendix
                signDate
                effectiveDate
                signatory
                content
                status
            }
        }
    `,
    { contractId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllContractAppendixInContracts(contractIds: string[]) {
  return useQuery(
    gql`
        query getAllContractAppendixInContracts($contractIds: [String]) {
            getAllContractAppendixInContracts(contractIds: $contractIds) {
                id
                contractId
                employeeId
                numContractAppendix
                signDate
                effectiveDate
                signatory
                content
                status
            }
        }
    `,
    { contractIds },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteContractAppendix() {
  return useMutation(
    gql`
        mutation deleteContractAppendix($id: String!) {
            deleteContractAppendix(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getContractExpire(organizationId: string | null = null) {
  return useQuery(
    gql`
        query getContractExpire($organizationId: String){
            getContractExpire(organizationId: $organizationId) {
                id
                employeeId
                code
                type
                organization
                organizationName
                jobTitle
                position
                jobTitleName
                positionName
                rank
                workType
                workLocation
                workingHoursPerWeek
                workDescription
                managerId
                employeeType
                employeeRank
                effectiveDate
                expiryDate
                signedDate
                signatory
                status
                orderNumber
                createdTime
                haveInsurance
                professionalWork
            }
        }
    `,
    { organizationId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

export {
  countContracts,
  countEmployeeInOrganization,
  countStatusContracts,
  dashboardWorkStatus,
  deleteContractAppendix,
  findContractByEmployeeId,
  findContractByEmployeeIdAndStatus,
  findContractById,
  getAllContractAppendix,
  getAllContractAppendixInContracts,
  getContractExpire,
  getEmployeeContractReport,
  listHdTemplates,
  professionalSkillsReport,
  searchContracts,
  setContractStatus
};
