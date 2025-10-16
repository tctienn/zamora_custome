import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { AttachmentType } from '@/apps/hrm/model/attachment';
import { type EmployeeFilter, type EmployeeFilterSuperAdvanceInput, EmployeeSnapshotStatus } from '@/apps/hrm/model/employee';
import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function employeeSummaryById(employeeId: string) {
  return useQuery(
    gql`
        query employeeSummaryById($employeeId: String!) {
            employeeSummaryById(employeeId: $employeeId) {
                id
                userId
                code
                fullName
                avatar
                jobTitle
                organizationName
                workLocation
                status
            }
        }`,
    { employeeId, },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function searchEmployees(filter: EmployeeFilter, pageable: Pageable) {
  return useLazyQuery(
    gql`
        query searchEmployees($filter: EmployeeFilter, $pageable: Pageable!) {
            searchEmployees(filter: $filter, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        snapshotId
                        userId
                        locked
                        code
                        status
                        fullName
                        birthDay
                        joinDate
                        gender
                        avatar
                        email
                        emailIssuingUnit
                        phoneNumber
                        homeTown
                        currentAddress
                        currentResidence
                        militaryService
                        isMember
                        isParty
                        jobTitle
                        organizationId
                        jobTitleName
                        position
                        positionName
                        organizationName
                        workLocation
                        jobTitleName
                        position
                        positionName
                        foreignLanguageLevel
                        informationTechnologyLevel
                        politicalTheory
                        professionalLevel
                        partyEntryDayOfficial
                        nation
                        seniority
                        isEdit
                    }
                }
            }
        }
    `
    , {
      filter,
      pageable
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function searchEmployeesMinimal(filter: EmployeeFilter, pageable: Pageable) {
  return useQuery(
    gql`
        query searchEmployeesMinimal($filter: EmployeeFilter, $pageable: Pageable!) {
            searchEmployees(filter: $filter, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        code
                        fullName
                        avatar
                        jobTitle
                        organizationId
                        jobTitleName
                        organizationName
                    }
                }
            }
        }
    `
    , {
      filter,
      pageable
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findAllEmployees(keyword: string) {
  return useQuery(
    gql`
        query findAllEmployees($keyword: String!) {
            findAllEmployees(keyword: $keyword) {
                id
                snapshotId
                userId
                locked
                code
                status
                fullName
                birthDay
                joinDate
                gender
                avatar
                email
                emailIssuingUnit
                phoneNumber
                homeTown
                currentAddress
                currentResidence
                militaryService
                isMember
                isParty
                jobTitle
                jobTitleName
                organizationId
                organizationName
                workLocation
                position
                positionName
                foreignLanguageLevel
                informationTechnologyLevel
                politicalTheory
                professionalLevel
                partyEntryDayOfficial
                nation
                employeeType
            }
        }`,
    { keyword, },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function getAllEmployeeHaveInsurance() {
  return useQuery(
    gql`
        query getAllEmployeeHaveInsurance {
            getAllEmployeeHaveInsurance {
                id
                code
                fullName
            }
        }`,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function getEmployeeByUserId(userId: string) {
  return useQuery(
    gql`
        query getEmployeeByUserId($userId: String!) {
            searchEmployees(filter: {userId: $userId}, pageable: {page: 0, size: 1, sort: []}) {
                totalCount
                edges {
                    node {
                        id
                        userId
                        code
                        fullName
                        avatar
                        jobTitle
                        organizationName
                        workLocation
                        status
                    }
                }
            }
        }`,
    { userId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllEmployeeInfo() {
  return useQuery(
    gql`
        query getAllEmployeeInfo{
            getAllEmployeeInfo{
                id
                fullName
                avatar
                code
                employeeId
                organizationId
                organizationName
                position
                jobTitle
                positionName
                jobTitleName
                employeeType
                professionalWork
            }
        }`,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function lockEmployee() {
  return useMutation(
    gql`
        mutation lockEmployee($id: String!) {
            lockEmployee(id: $id)
        }`,
    { clientId: HRM_CLIENT_ID, },);
}

function unlockEmployee() {
  return useMutation(
    gql`
        mutation unlockEmployee($id: String!) {
            unlockEmployee(id: $id)
        }`,
    { clientId: HRM_CLIENT_ID, },);
}

function grantEmployeeToUser() {
  return useMutation(
    gql`
        mutation grantEmployeeToUser($employeeId: String!, $userId: String!) {
            grantEmployeeToUser(employeeId: $employeeId, userId: $userId)
        }`,
    { clientId: HRM_CLIENT_ID, },);
}

function changeEmployeeWorkingStatus() {
  return useMutation(
    gql`
        mutation changeEmployeeWorkingStatus($id: String!, $status: EmployeeWorkingStatus!) {
            changeEmployeeWorkingStatus(id: $id, status: $status)
        }`,
    { clientId: HRM_CLIENT_ID, },);
}

function countEmployeeByFilter(filter: EmployeeFilter) {
  return useQuery(
    gql`
        query countEmployeeByFilter($filter: EmployeeFilter) {
            countEmployeeByFilter(filter: $filter)
        }`,
    { filter, },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function countEmployeeWorkingStatus(snapshotStatus: EmployeeSnapshotStatus | undefined, organization: string | undefined) {
  return useQuery(
    gql`
        query countEmployeeWorkingStatus($snapshotStatus: EmployeeSnapshotStatus, $organization: String) {
            countEmployeeWorkingStatus(snapshotStatus:$snapshotStatus, organization: $organization) {
                status
                count
            }
        }`,
    {
      snapshotStatus,
      organization,
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function countEmployeeSnapshotStatus() {
  return useQuery(
    gql`
        query countEmployeeSnapshotStatus {
            countEmployeeSnapshotStatus {
                status
                count
            }
        }`,
    {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function findRelatedEmployees(employeeId: string) {
  return useQuery(
    gql`
        query findRelatedEmployees($employeeId: String) {
            findRelatedEmployees(employeeId: $employeeId)
        }`,
    { employeeId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function findByEmployeeIdAndType(employeeId: string, types?: AttachmentType[]) {
  return useQuery(
    gql`
        query findByEmployeeIdAndType($employeeId: String, $types: [AttachmentType!]) {
            findByEmployeeIdAndType(employeeId: $employeeId, types: $types) {
                id
                employeeId
                objectId
                type
                name
                extension
                path
                size
            }
        }
    `,
    {
      employeeId,
      ...types ? { types } : {},
    },
    { clientId: HRM_CLIENT_ID, }
  );
}

function getDecisionCommendationAndDisciplineAndStatusApprove(employeeId: string) {
  return useQuery(
    gql`
        query GetDecisionCommendationAndDisciplineAndStatusApprove($employeeId: String!) {
            getDecisionCommendationAndDisciplineAndStatusApprove(employeeId: $employeeId) {
                id
                fullName
                noDecision
                effectStartDate
                effectEndDate
                decisionDate
                decisionType
                status
                decisionMakingLevelId
                decisionMakingLevelName
                placeOfDecision
                employeeId
                reason
                oldDept
                newDept
                oldTitle
                newTitle
                oldPosition
                newPosition
                signerId
                signerName
                welfareAdjustment
                description
                createdTime
                createdBy
                lastModifiedTime
                lastModifiedBy
                contract
                template2c
                commendationObject
                dismissalDate
                files {
                    id
                    employeeId
                    objectId
                    type
                    name
                    extension
                    path
                    size
                }
                employeeCommendations {
                    id
                    decisionId
                    employeeOrganizationId
                    employeeOrganizationName
                    avatar
                    reward
                    typePayment
                    form
                    title
                }
                employeeDisciplines {
                    id
                    decisionId
                    employeeOrganizationId
                    employeeOrganizationName
                    avatar
                    compensationAmount
                    typeExecution
                    form
                    disciplineObject
                }
            }
        }
    `,
    { employeeId, },
    { clientId: HRM_CLIENT_ID, }
  );
}

function getDecisionByEmployeeId(employeeId: string) {
  return useQuery(
    gql`
        query GetDecisionByEmployeeId($employeeId: String!) {
            getDecisionByEmployeeId(employeeId: $employeeId) {
                id
                fullName
                effectStartDate
                effectEndDate
                decisionDate
                decisionType
                status
                decisionMakingLevelId
                decisionMakingLevelName
                placeOfDecision
                employeeId
                signerId
                signerName
                noDecision
                files {
                    id
                    employeeId
                    objectId
                    type
                    name
                    extension
                    path
                    size
                }
            }
        }
    `,
    { employeeId, },
    { clientId: HRM_CLIENT_ID, }
  );
}

function dashboardEduEmployees(organizationId: string | null = null) {
  return useQuery(
    gql`
        query dashboardEduEmployees($organizationId: String) {
            dashboardEduEmployees(organizationId: $organizationId) {
                orderNumber
                levelName
                count
                countMale
                countFemale
            }
        }`,
    { organizationId },
    { clientId: HRM_CLIENT_ID, },);
}

function dashboardAgeEmployees(organizationId: string | null = null) {
  return useQuery(
    gql`
        query dashboardAgeEmployees($organizationId: String) {
            dashboardAgeEmployees(organizationId: $organizationId) {
                count18To24Male
                count18To24Female
                count25To29Male
                count25To29Female
                count30To39Male
                count30To39Female
                count40To49Male
                count40To49Female
                count50Male
                count50Female
            }
        }`,
    { organizationId },
    { clientId: HRM_CLIENT_ID, },);
}

function dashboardGenderEmployees(organizationId: string | null = null) {
  return useQuery(
    gql`
        query dashboardGenderEmployees($organizationId: String) {
            dashboardGenderEmployees(organizationId: $organizationId) {
                totalMale
                totalFemale
                total
            }
        }`,
    { organizationId },
    { clientId: HRM_CLIENT_ID, },);
}

function dashboardOrgEmployees(organizationId: string | null = null) {
  return useQuery(
    gql`
        query dashboardOrgEmployees($organizationId: String) {
            dashboardOrgEmployees(organizationId: $organizationId) {
                orgName
                total
            }
        }`,
    { organizationId },
    { clientId: HRM_CLIENT_ID, },);
}

function dashboardContractEmployees(organizationId: string | null = null) {
  return useQuery(
    gql`
        query dashboardContractEmployees($organizationId: String) {
            dashboardContractEmployees(organizationId: $organizationId) {
                contractType
                total
            }
        }`,
    { organizationId },
    { clientId: HRM_CLIENT_ID });
}

function laborUtilizationReport() {
  return useQuery(
    gql`
        query laborUtilizationReport{
            laborUtilizationReport{
                fullName
                codeBHXH
                birthDay
                gender
                cccdNumber
                currentPosition
                highestLevel
                contractId
                socialInsuranceParticipation
                contractSalary{
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
                }
                contractSalaryBonus{
                    id
                    salaryId
                    type
                    amount
                }
                contract{
                    effectiveDate
                    expiryDate
                }
            }
        }
    `
    , {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function workProgressReport(param: object) {
  return useQuery(
    gql`
        query workProgressReport($payload: AdvanceSearchEmployeeWorkProcessPayload){
            workProgressReport(payload: $payload){
              totalCount
              edges {
                  node {
                    code
                    fullName
                    currentOrganization
                    organization
                    workLocation
                    fromDate
                    toDate
                    jobTitle
                    position
                    description
                    reasonForLeaving
                    salary
                    referencesPerson
                    phone
                  }
              }
            }
        }
    `
    , { ...param },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllPayslipByEmployeeId(employeeId: string | null = null) {
  return useQuery(
    gql`
        query GetAllPayslipByEmployeeId($employeeId: String) {
            getAllPayslipByEmployeeId(employeeId: $employeeId) {
                id
                payslipCode
                payslipName
                employeeId
                month
                year
                employeePayslipValue
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

function getDefaultPayslipInfos() {
  return useQuery(
    gql`
        query GetDefaultPayslipInfos {
            getDefaultPayslipInfos {
                id
                payslipCode
                payslipName
                code
                name
                parentId
                isGroup
                orderNum
                status
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

function employeeByOrganizationReport(param: object) {
  return useQuery(
    gql`
      query employeeByOrganizationReport($param: AdvanceSearchEmployeeByOrgPayload){
          employeeByOrganizationReport(param: $param)
      }
    `
    , { ...param },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function childrenOfficerReport() {
  return useQuery(
    gql`
        query childrenOfficerReport{
            childrenOfficerReport
        }
    `
    , {},
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

const SEARCH_SUPER_ADVANCE_EMPLOYEE = gql`
    query searchSuperAdvanceEmployee(
        $filter: EmployeeFilterSuperAdvanceInput
        $pageable: Pageable
    ) {
        searchSuperAdvanceEmployee(filter: $filter, pageable: $pageable) {
            totalCount
            edges {
                node {
                    id
                    snapshotId
                    userId
                    locked
                    code
                    status
                    fullName
                    birthDay
                    joinDate
                    gender
                    avatar
                    email
                    emailIssuingUnit
                    phoneNumber
                    homeTown
                    currentAddress
                    currentResidence
                    militaryService
                    isMember
                    isParty
                    jobTitle
                }
            }
        }
    }
`;

function useSearchAdvancedEmployee(filter?: EmployeeFilterSuperAdvanceInput, pageable?: Pageable) {
  return useLazyQuery(SEARCH_SUPER_ADVANCE_EMPLOYEE, {
    filter,
    pageable
  }, {
    clientId: HRM_CLIENT_ID,
    fetchPolicy: 'network-only',
  });
}

function getTopSeniorityEmployee(limit: number | null = null, organizationId: string | null = null) {
  return useQuery(
    gql`
        query GetTopSeniorityEmployee($limit: Int, $organizationId: String) {
            getTopSeniorityEmployee(limit: $limit, organizationId: $organizationId) {
                employeeId
                fullName
                totalDate
                avatar
            }
        }
    `,
    {
      limit,
      organizationId
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getWarningDashboard(organizationId: string | null = null) {
  return useQuery(
    gql`
        query getWarningDashboard($organizationId: String){
            getWarningDashboard(organizationId: $organizationId) {
                totalPendingContract
                totalProfileNotComplete
                totalContractExpire
                totalDecisionExpire
                totalMaternityLeaveExpire
            }
        }
    `,
    { organizationId },
    { clientId: HRM_CLIENT_ID, },);
}

function getProfileNotComplete(organizationId: string | null = null) {
  return useQuery(
    gql`
        query getProfileNotComplete($organizationId: String){
            getProfileNotComplete(organizationId: $organizationId) {
                id
                snapshotId
                userId
                locked
                code
                status
                fullName
                birthDay
                joinDate
                gender
                avatar
                jobTitle
                organizationId
                organizationName
                workLocation
                jobTitleName
                position
                positionName

                cccdNumber
                phoneNumber
                birthPlace
                homeTown
                maritalStatus
                currentAddress
                currentResidence
            }
        }
    `,
    { organizationId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },);
}

function getTopNewEmployee(limit: number) {
  return useQuery(
    gql`
        query getTopNewEmployee($limit: Int){
            getTopNewEmployee(limit: $limit) {
                id
                snapshotId
                userId
                locked
                code
                status
                fullName
                birthDay
                joinDate
                gender
                avatar
                organizationName
                positionName
            }
        }
    `
    , { limit },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteProfileAttachmentById() {
  return useMutation(
    gql`
        mutation deleteProfileAttachmentById($id: String) {
            deleteProfileAttachmentById(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  changeEmployeeWorkingStatus,
  childrenOfficerReport,
  countEmployeeByFilter,
  countEmployeeSnapshotStatus,
  countEmployeeWorkingStatus,
  dashboardAgeEmployees,
  dashboardContractEmployees,
  dashboardEduEmployees,
  dashboardGenderEmployees,
  dashboardOrgEmployees,
  deleteProfileAttachmentById,
  employeeByOrganizationReport,
  employeeSummaryById,
  findAllEmployees,
  findByEmployeeIdAndType,
  findRelatedEmployees,
  getAllEmployeeHaveInsurance,
  getAllEmployeeInfo,
  getAllPayslipByEmployeeId,
  getDecisionByEmployeeId,
  getDecisionCommendationAndDisciplineAndStatusApprove,
  getDefaultPayslipInfos,
  getEmployeeByUserId,
  getProfileNotComplete,
  getTopNewEmployee,
  getTopSeniorityEmployee,
  getWarningDashboard,
  grantEmployeeToUser,
  laborUtilizationReport,
  lockEmployee,
  searchEmployees,
  searchEmployeesMinimal,
  unlockEmployee,
  useSearchAdvancedEmployee,
  workProgressReport
};
