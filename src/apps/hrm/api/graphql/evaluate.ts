import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveEvaluateEmployeeReport() {
  return useMutation(
    gql`
      mutation saveEvaluateEmployeeReport($saveEvaluateEmployeeReportInput: SaveEvaluateEmployeeReportInput!) {
        saveEvaluateEmployeeReport(saveEvaluateEmployeeReportInput: $saveEvaluateEmployeeReportInput)
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getEvaluateEmployeeReportList () {
  return useQuery(
    gql`
      query getEvaluateEmployeeReportList {
        getEvaluateEmployeeReportList {
          year
          records {
              id
              evaluateName
              reportOfOrganizationId
              reportOfOrganizationName
              monthReport
              reportPlace
              evaluateStatus
              createdBy
              createdTime
          }
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

function getEvaluateEmployeeReportOfSynthesizer() {
  return useQuery(
    gql`
      query getEvaluateEmployeeReportOfSynthesizer  {
        getEvaluateEmployeeReportOfSynthesizer  {
          year
          countEvaluateEmployeeReportNotSynthesized
          months {
              month
              reports {
                  id
                  evaluateName
                  reportOfOrganizationId
                  reportOfOrganizationName
                  monthReport
                  isRead
                  reportPlace
                  evaluateStatus
                  createdBy
                  createdTime
              }
          }
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

function getEvaluateEmployeeReportDetail(reportId: string) {
  return useQuery(
    gql`
      query getEvaluateEmployeeReportDetail($reportId: String) {
        getEvaluateEmployeeReportDetail(reportId: $reportId) {
            report {
            id
            evaluateName
            reportOfOrganizationId
            reportOfOrganizationName
            monthReport
            reportPlace
            evaluateStatus
            note
            createdBy
            createdTime
            }
            employees {
                employeeId
                employeeName
                employeeOrganizationId
                employeeOrganizationName
                jobPositionCode
                jobPositionName
                selectedEmployee
                score
            }
          }
        }
    `,
    { reportId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only', 
    },
  );
}

function saveEvaluateEmployeeScoreInReport() {
  return useMutation(
    gql`
      mutation saveEvaluateEmployeeScoreInReport($input: SaveEvaluateEmployeeScoreInReportInput!) {
        saveEvaluateEmployeeScoreInReport(saveEvaluateEmployeeScoreInReportInput: $input)
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteEvaluateEmployeeReport() {
  return useMutation(
    gql`
        mutation deleteEvaluateEmployeeReport($reportId: String!) {
            deleteEvaluateEmployeeReport(reportId: $reportId)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function sendEvaluateEmployeeReportToSynthesizer () {
  return useMutation(
    gql`
        mutation sendEvaluateEmployeeReportToSynthesizer($sendEvaluateEmployeeReportToSynthesizerInput : SendEvaluateEmployeeReportToSynthesizerInput!) {
            sendEvaluateEmployeeReportToSynthesizer(sendEvaluateEmployeeReportToSynthesizerInput: $sendEvaluateEmployeeReportToSynthesizerInput)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

// Chờ tổng hợp

function getEvaluateSummaryReports() {
  return useQuery(
    gql`
      query getEvaluateSummaryReports  {
        getEvaluateSummaryReports  {
          id
          summaryReportName
          summaryReportCode
          createdBy
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

function getAllTitleOfSignatureOfTheSummaryReport(evaluateSummaryReportId: string) {
  return useQuery(
    gql`
      query getAllTitleOfSignatureOfTheSummaryReport($evaluateSummaryReportId: String) {
        getAllTitleOfSignatureOfTheSummaryReport(evaluateSummaryReportId: $evaluateSummaryReportId) {
            id
            titleOfSignatoryId
            titleOfSignatoryName
            orderNumber
            isActive
            createdBy
            createdTime
          }
        }
    `,
    { evaluateSummaryReportId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only', 
    },
  );
}

function saveTitleOfSignatory() {
  return useMutation(
    gql`
      mutation saveTitleOfSignatory($saveTitleOfSignatoryInput: SaveTitleOfSignatoryInput!) {
        saveTitleOfSignatory(saveTitleOfSignatoryInput: $saveTitleOfSignatoryInput)
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveEvaluateEmployeeSummaryReport() {
  return useMutation(
    gql`
      mutation saveEvaluateEmployeeSummaryReport($saveEvaluateEmployeeSummaryReportInput: SaveEvaluateEmployeeSummaryReportInput!) {
        saveEvaluateEmployeeSummaryReport(saveEvaluateEmployeeSummaryReportInput: $saveEvaluateEmployeeSummaryReportInput)
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function markReportAsRead() {
  return useMutation(
    gql`
        mutation markReportAsRead($reportId: String!) {
            markReportAsRead(reportId: $reportId)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

// Tổng hợp

function getEvaluateEmployeeSummaryReportList() {
  return useQuery(
    gql`
      query getEvaluateEmployeeSummaryReportList {
        getEvaluateEmployeeSummaryReportList {
          year
          countEvaluateEmployeeSummaryReportStatusDraft
        months {
            month
            reports {
                id
                organizationCreateId
                organizationCreateName
                evaluateSummaryReportId
                evaluateSummaryReportName
                monthReport
                reportPlace
                evaluateEmployeeSummaryReportStatus
                createdBy
                createdTime
                lastModifiedBy
                lastModifiedTime
            }
        }
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

function getEvaluateEmployeeSummaryReportDetailById(reportId: string) {
  return useQuery(
    gql`
      query getEvaluateEmployeeSummaryReportDetailById($reportId: String) {
        getEvaluateEmployeeSummaryReportDetailById(reportId: $reportId) {
            summaryReport {
              id
              evaluateSummaryReportId
              evaluateSummaryReportName
              flowId
              evaluateSummaryReportCode
              organizationCreateId
              organizationCreateName
              createdBy
              createdTime
              monthReport
              totalOrganization
              totalEmployee
              evaluateEmployeeSummaryReportStatus
              listOfEvaluateEmployeeReportOnEachOrganization {
                evaluateEmployeeReportId
                evaluateEmployeeReportName
                reportOfOrganizationId
                reportOfOrganizationName
                aggregateByPositionCode
                aggregateByPositionName
                selected
            }
            }
            detailReport
          }
        }
    `,
    { reportId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only', 
    },
  );
}

function saveEvaluateEmployeeSummaryReportScore() {
  return useMutation(
    gql`
      mutation saveEvaluateEmployeeSummaryReportScore($saveEvaluateEmployeeSummaryReportScoreInput: SaveEvaluateEmployeeSummaryReportScoreInput!) {
        saveEvaluateEmployeeSummaryReportScore(saveEvaluateEmployeeSummaryReportScoreInput: $saveEvaluateEmployeeSummaryReportScoreInput)
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getHandlerOfEvaluateEmployeeSummaryReportHistory(evaluateEmployeeSummaryReportId: string) {
  return useQuery(
    gql`
      query getHandlerOfEvaluateEmployeeSummaryReportHistory($evaluateEmployeeSummaryReportId: String) {
        getHandlerOfEvaluateEmployeeSummaryReportHistory(evaluateEmployeeSummaryReportId: $evaluateEmployeeSummaryReportId) {
            id
            handlerId
            handlerName
            handlerOrganizationId
            handlerOrganizationName
            handlerOrganizationCode
            content
            evaluateEmployeeSummaryReportStatus
            createdBy
            createdTime
          }
        }
    `,
    { evaluateEmployeeSummaryReportId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only', 
    },
  );
}

function transferProcessingEvaluateEmployeeSummaryReport() {
  return useMutation(
    gql`
      mutation transferProcessingEvaluateEmployeeSummaryReport($transferProcessingEvaluateEmployeeSummaryReportInput: TransferProcessingEvaluateEmployeeSummaryReportInput!) {
        transferProcessingEvaluateEmployeeSummaryReport(transferProcessingEvaluateEmployeeSummaryReportInput: $transferProcessingEvaluateEmployeeSummaryReportInput)
      }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteEvaluateEmployeeSummaryReport() {
  return useMutation(
    gql`
        mutation deleteEvaluateEmployeeSummaryReport($reportId: String!) {
            deleteEvaluateEmployeeSummaryReport(reportId: $reportId)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteEvaluateEmployeeReport,
  deleteEvaluateEmployeeSummaryReport,
  getAllTitleOfSignatureOfTheSummaryReport,
  getEvaluateEmployeeReportDetail,
  getEvaluateEmployeeReportList,
  getEvaluateEmployeeReportOfSynthesizer,
  getEvaluateEmployeeSummaryReportDetailById,
  getEvaluateEmployeeSummaryReportList,
  getEvaluateSummaryReports,
  getHandlerOfEvaluateEmployeeSummaryReportHistory,
  markReportAsRead,
  saveEvaluateEmployeeReport,
  saveEvaluateEmployeeScoreInReport,
  saveEvaluateEmployeeSummaryReport,
  saveEvaluateEmployeeSummaryReportScore,
  saveTitleOfSignatory,
  sendEvaluateEmployeeReportToSynthesizer,
  transferProcessingEvaluateEmployeeSummaryReport
};