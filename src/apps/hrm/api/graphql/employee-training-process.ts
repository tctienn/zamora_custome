import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function deleteTrainingProcess() {
  return useMutation(
    gql`
        mutation deleteTrainingProcess($id: String) {
            deleteTrainingProcess(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getTrainingProcessByIdAndSnapshotId(id: string, snapshotId: string) {
  return useQuery(
    gql`
        query getTrainingProcessByIdAndSnapshotId($id: String, $snapshotId: String) {
            getTrainingProcessByIdAndSnapshotId(id: $id, snapshotId: $snapshotId)
            {
                id
                snapshotId
                fromMonth
                toMonth
                professionalLevel
                major
                issuingPlace
                trainingSystem
                yearGraduation
                classification
                issueDate
                mainDegree
                files {
                    id
                    type
                    name
                    extension
                    path
                    size
                }
            }
        }
    `, {
      id,
      snapshotId
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllTrainingProcessBySnapshotId(snapshotId: string) {
  return useQuery(
    gql`
        query getAllTrainingProcessBySnapshotId($snapshotId: String) {
            getAllTrainingProcessBySnapshotId(snapshotId: $snapshotId)
        }
    `, { snapshotId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteEmployeeCertificate() {
  return useMutation(
    gql`
        mutation deleteEmployeeCertificate($id: String) {
            deleteEmployeeCertificate(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getEmployeeCertificateByIdAndSnapshotId(id: string, snapshotId: string) {
  return useQuery(
    gql`
        query getEmployeeCertificateByIdAndSnapshotId($id: String, $snapshotId: String) {
            getEmployeeCertificateByIdAndSnapshotId(id: $id, snapshotId: $snapshotId) {
                id
                snapshotId
                name
                fromMonth
                toMonth
                trainingField
                trainingForm
                issuingPlace
                result
                certificateType
                fromDate
                toDate
                version
                releaseDate
                files {
                    id
                    type
                    name
                    extension
                    path
                    size
                }
            }
        }
    `, {
      id,
      snapshotId
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllEmployeeCertificateBySnapshotId(snapshotId: string) {
  return useQuery(
    gql`
        query getAllEmployeeCertificateBySnapshotId($snapshotId: String) {
            getAllEmployeeCertificateBySnapshotId(snapshotId: $snapshotId)
        }
    `, { snapshotId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteEmployeeReceivingDoc() {
  return useMutation(
    gql`
        mutation deleteEmployeeReceivingDoc($id: String) {
            deleteEmployeeReceivingDoc(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllEmployeeReceivingDocBySnapshotId(snapshotId: string) {
  return useQuery(
    gql`
        query getAllEmployeeReceivingDocBySnapshotId($snapshotId: String) {
            getAllEmployeeReceivingDocBySnapshotId(snapshotId: $snapshotId) {
                id
                snapshotId
                receivingDocCode
                receivingDocName
                receivingDate
                receiver
                files {
                    id
                    type
                    name
                    extension
                    path
                    size
                }
            }
        }
    `, { snapshotId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findEmployeeEducationReport(payload: object) {
  return useQuery(
    gql`
        query findEmployeeEducationReport($payload: AdvanceSearchEmployeeEduPayload) {
            findEmployeeEducationReport(payload: $payload) {
              totalCount
                edges {
                    node {
                        employeeId
                        snapshotId
                        organizationId
                        organizationName
                        code
                        fullName
                        birthDay
                        professionalLevel
                        generalLevel

                        listTrainingProcess
                        workDescription
                        issuingPlace
                        professionalLevelProcess
                        major
                        classification
                        mainDegree
                        trainingFromDate
                        trainingToDate
                    }
                }
            }
        }
    `, { ...payload },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function searchEmployeesHasResignedReport(data:{employeesHasResignedSearchPayload: object}) {
  return useQuery(
    gql`
      query searchEmployeesHasResignedReport(
        $employeesHasResignedSearchPayload: EmployeesHasResignedSearchPayload
      ) {
        searchEmployeesHasResignedReport(
          employeesHasResignedSearchPayload: $employeesHasResignedSearchPayload
        ) {
            employeeCode
            fullName
            dateOfBirth
            gender
            citizenIdentificationNumber
            issueDate
            issuePlace
            phoneNumber
            email
            professionalLevel
            major
            issuingPlace
            taxCode
            codeBHXH
            contractNumber
            employeeType
            employeePosition
            address
            joinDate
            resignDate
            reason
            organizationId
            organizationName
        }
      }
    `,
    { ...data },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function searchTransferOfLaborContract(data:{transferOfLaborContractSearchPayload: object}) {
  return useQuery(
    gql`
      query searchTransferOfLaborContract(
        $transferOfLaborContractSearchPayload: TransferOfLaborContractSearchPayload
      ) {
        searchTransferOfLaborContract(
          transferOfLaborContractSearchPayload: $transferOfLaborContractSearchPayload
        ) {
            employeeCode
            fullName
            employeeType
            gender
            dateOfBirth
            jobTitleName
            departmentId
            departmentName
            organizationName
            educationLevel
            major
            typeOfLaborContract
            dateTransferContract
            note
        }
      }
    `,
    { ...data },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function searchOrganizationWideHumanResourcesReport(data:{organizationWideHumanResourcesReportSearchPayload: object, pageable: Pageable}) {
  return useQuery(
    gql`
      query searchOrganizationWideHumanResourcesReport(
        $organizationWideHumanResourcesReportSearchPayload: OrganizationWideHumanResourcesReportSearchPayload
        $pageable: Pageable
      ) {
        searchOrganizationWideHumanResourcesReport(
          organizationWideHumanResourcesReportSearchPayload: $organizationWideHumanResourcesReportSearchPayload
          pageable: $pageable
        ) {
            page
            pageSize
            totalRecords
            totalPages
            content {
                employeeCode
                fullName
                dateOfBirth
                gender
                jobTitleName
                issuingPlace
                major
                trainingSystem
                workExperience
                joinDate
                contractType
                salaryCoefficient
                allowance
                homeTown
                phoneNumber
                email
                departmentId
                departmentName
            }
        }
    `,
    { ...data },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function getCertificatesExpiringIn30Days(organizationId: string | null = null) {
  return useQuery(
    gql`
        query getCertificatesExpiringIn30Days($organizationId: String) {
            getCertificatesExpiringIn30Days(organizationId: $organizationId)
        }
    `, { organizationId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteEmployeeCertificate,
  deleteEmployeeReceivingDoc,
  deleteTrainingProcess,
  findEmployeeEducationReport,
  getAllEmployeeCertificateBySnapshotId,
  getAllEmployeeReceivingDocBySnapshotId,
  getAllTrainingProcessBySnapshotId,
  getCertificatesExpiringIn30Days,
  getEmployeeCertificateByIdAndSnapshotId,
  getTrainingProcessByIdAndSnapshotId,
  searchEmployeesHasResignedReport,
  searchOrganizationWideHumanResourcesReport,
  searchTransferOfLaborContract
};