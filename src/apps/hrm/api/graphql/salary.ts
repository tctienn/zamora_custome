import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { TemplateColumn as SalaryTemplateColumn, TemplateForm as SalaryTemplate } from '@/apps/hrm/model/salary';
import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveSalaryTemplate() {
  return useMutation(
    gql`
        mutation SaveTemplate($payload: PayrollTemplatePayload!) {
            saveTemplate(payload: $payload) {
                id
                name
                description
                status
                type
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteSalaryTemplate() {
  return useMutation(
    gql`
        mutation DeleteTemplateById($id: String!) {
            deleteTemplateById(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

// Updated to use JSON type to avoid unknown type errors, field name matches backend
// This approach will accept the payload and the analyticFunction field will be handled according to backend schema
function addColumnTemplate() {
  return useMutation(
    gql`
        mutation AddColumnTemplate($payload: ColumnTemplatePayload!) {
            addColumnTemplate(payload: $payload) {
                id
                code
                templateId
                name
                dataType
                analyticFunction
                orderNumber
                status
                subColumns
                columnType
                formula
                columnDataSystem
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteColumnTemplate() {
  return useMutation(
    gql`
        mutation DeleteColumnTemplate($id: String!) {
            deleteColumnTemplate(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

// Queries
function getAllSalaryTemplates() {
  return useQuery(
    gql`
        query FindTemplate {
            findTemplate {
                id
                name
                description
                status
                type
                columns {
                    id
                    code
                    templateId
                    name
                    dataType
                    analyticFunction
                    orderNumber
                    status
                    subColumns
                    columnType
                    formula
                    columnDataSystem
                    isInitData
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

function getSalaryTemplateById(id: string) {
  return useQuery(
    gql`
        query findTemplatesById($id: String!) {
            findTemplatesById(id: $id) {
                id
                name
                description
                status
                type
                columns {
                    id
                    code
                    templateId
                    name
                    dataType
                    columnType
                    analyticFunction
                    columnDataSystem
                    orderNumber
                    status
                    subColumns
                    formula
                    isInitData
                }
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

function getColumnTemplateById(id: string) {
  return useQuery(
    gql`
        query FindColumnTemplateById($id: String!) {
            findColumnTemplateById(id: $id) {
                id
                code
                templateId
                name
                dataType
                analyticFunction
                orderNumber
                status
                subColumns
                columnType
                formula
                columnDataSystem
                isInitData
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

function searchSalaryTemplates() {
  return useLazyQuery(
    gql`
        query searchSalaryTemplates($search: SearchSalaryTemplate, $pageable: Pageable) {
            searchSalaryTemplates(search: $search, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        name
                        description
                        status
                        type
                        columns {
                            id
                            code
                            templateId
                            name
                            dataType
                            analyticFunction
                            columnDataSystem
                            orderNumber
                            status
                            columnType
                            formula
                            subColumns
                        }
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

function getAllSalaryProcessByEmployeeId(employeeId: string) {
  return useQuery(
    gql`
        query getAllSalaryProcessByEmployeeId($employeeId: String) {
            getAllSalaryProcessByEmployeeId(employeeId: $employeeId) {
                id
                employeeId
                createdMonth
                createdYear
                salaryProcessForm
                salaryScale
                salaryLevel
                salaryCoefficient
                salary
                regionalMinimumWage
                totalSalary
                note
                status
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

function getSalaryProcessById(id: string) {
  return useQuery(
    gql`
        query getSalaryProcessById($id: String) {
            getSalaryProcessById(id: $id) {
                id
                employeeId
                createdMonth
                createdYear
                salaryProcessForm
                salaryScale
                salaryLevel
                salaryCoefficient
                salary
                regionalMinimumWage
                totalSalary
                note
                status
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

function saveSalaryProcess() {
  return useMutation(
    gql`
        mutation saveSalaryProcess($salaryProcess: SalaryProcessInput) {
            saveSalaryProcess(salaryProcess: $salaryProcess)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteSalaryProcess() {
  return useMutation(
    gql`
        mutation deleteSalaryProcess($id: String!) {
            deleteSalaryProcess(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function createPayslip() {
  return useMutation(
    gql`
        mutation CreatePayslip($payslipPayload: PayslipPayload!) {
            createPayslip(payslipPayload: $payslipPayload) {
                id
                name
                type
                month
                year
                location
                createdDate
                createdBy
                organizationIds
                status
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deletePayslip() {
  return useMutation(
    gql`
        mutation DeletePayslip($id: String!) {
            deletePayslip(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function updateStatus() {
  return useMutation(
    gql`
        mutation UpdateStatus($id: String, $status: PayslipStatus) {
            updateStatus(id: $id, status: $status) {
                id
                name
                type
                month
                year
                location
                createdDate
                createdBy
                organizationIds
                status
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

// change api query from getAllPayslips to findMyPayslips but keep the function name
function getAllPayslip(status: string | null = null) {
  return useQuery(
    gql`
        query FindMyPayslips($status: [PayslipStatus]!) {
            findMyPayslips(status: $status) {
                id
                name
                type
                month
                year
                location
                createdDate
                createdBy
                organizationIds
                status
            }
        }
    `,
    { status },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findPayslipById(id: string) {
  return useQuery(
    gql`
        query FindPayslipById($id: String!) {
            findPayslipById(id: $id) {
                id
                name
                type
                month
                year
                location
                createdDate
                createdBy
                organizationIds
                columns {
                    id
                    code
                    templateId
                    name
                    dataType
                    analyticFunction
                    orderNumber
                    status
                    columnType
                    columnDataSystem
                    formula
                    isInitData
                    subColumns {
                        id
                        code
                        templateId
                        name
                        dataType
                        analyticFunction
                        orderNumber
                        status
                        columnType
                        columnDataSystem
                        formula
                        isInitData
                    }
                }
                employees {
                    employeeId
                    value
                    organizationId
                    organizationName
                    orderNumber
                }
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

function updateStatusTemplate() {
  return useMutation(
    gql`
        mutation UpdateStatusTemplate($id: String!, $status: PayrollTemplateStatus!) {
            updateStatusTemplate(id: $id, status: $status) {
                id
                name
                description
                status
                type
                columns {
                    id
                    code
                    templateId
                    name
                    dataType
                    analyticFunction
                    orderNumber
                    columnDataSystem
                    status
                    subColumns
                    columnType
                    formula
                }
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function updateStatusColumn() {
  return useMutation(
    gql`
        mutation UpdateStatusColumn($id: String!, $status: PayrollTemplateStatus!) {
            updateStatusColumn(id: $id, status: $status) {
                id
                code
                templateId
                name
                dataType
                analyticFunction
                orderNumber
                status
                subColumns
                columnType
                formula
                columnDataSystem
            }
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deletePayslipInfo() {
  return useMutation(
    gql`
        mutation deletePayslipInfo($id: String) {
            deletePayslipInfo(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function savePayslipInfo() {
  return useMutation(
    gql`
        mutation savePayslipInfo($payslipInfo: PayslipInfoInput) {
            savePayslipInfo(payslipInfo: $payslipInfo)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllPayslipInfo(payslipCode: string) {
  return useQuery(
    gql`
        query GetAllPayslipInfo($payslipCode: String) {
            getAllPayslipInfo(payslipCode: $payslipCode) {
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
    { payslipCode },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getPayslipInfo(id: string) {
  return useQuery(
    gql`
        query getPayslipInfo($id: String) {
            getPayslipInfo(id: $id) {
                id
                payslipCode
                payslipName
                code
                name
                parentId
                orderNum
                status
                isGroup
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

function getEmployeePayslip(id: string) {
  return useQuery(
    gql`
        query getEmployeePayslip($id: String) {
            getEmployeePayslip(id: $id) {
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
    { id },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getMaxOrderNumPayslipInfo(parentId: string, payslipCode: string) {
  return useQuery(
    gql`
        query getMaxOrderNumPayslipInfo($parentId: String, $payslipCode: String) {
            getMaxOrderNumPayslipInfo(parentId: $parentId, payslipCode: $payslipCode)
        }
    `,
    {
      parentId,
      payslipCode
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getDefaultPayslipInfos() {
  return useQuery(
    gql`
        query getDefaultPayslipInfos {
            getDefaultPayslipInfos {
                id
                payslipCode
                payslipName
                code
                name
                parentId
                orderNum
                status
                isGroup
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

function saveEmployeePayslip() {
  return useMutation(
    gql`
        mutation saveEmployeePayslip($employeePayslip: EmployeePayslipInput) {
            saveEmployeePayslip(employeePayslip: $employeePayslip)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function searchEmployeePayslip() {
  return useQuery(
    gql`
        query searchEmployeePayslip($filter: EmployeeFilter,
            $pageable: Pageable,) {
            searchEmployeePayslip(filter: $filter, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        employeeId
                        userId
                        locked
                        code
                        status
                        fullName
                        gender
                        avatar

                        jobTitle
                        organizationId
                        organizationName
                        workLocation

                        jobTitleName
                        position
                        positionName

                        payslipCode
                        payslipName
                        month
                        year
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

function deleteEmployeePayslip() {
  return useMutation(
    gql`
        mutation deleteEmployeePayslip($id: String) {
            deleteEmployeePayslip(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveRecordValues() {
  return useMutation(
    gql`
        mutation SaveRecordValues($payslipId: String!, $records: [EmployeeData]) {
            saveRecordValues(payslipId: $payslipId, records: $records)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function calculatePayslip() {
  return useMutation(
    gql`
        mutation CalculatePayslip($payslipId: String!) {
            calculatePayslip(payslipId: $payslipId) {
                employeeId
                value
                organizationId
                organizationName
                orderNumber
            }
        }
    `,
    { 
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getPayslipByMonthYear(employeeId: string, month: number, year: number) {
  return useQuery(
    gql`
        query GetPayslipByMonthYear($employeeId: String, $month: Int, $year: Int) {
            getPayslipByMonthYear(employeeId: $employeeId, month: $month, year: $year) {
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
    {
      employeeId,
      month,
      year
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getPayslipNode(code: string) {
  return useQuery(
    gql`
        query getPayslipNode($code: String) {
            getPayslipNode(code: $code) {
                id
                payslipCode
                payslipName
                note
            }
        }
    `,
    { code },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function savePayslipNote() {
  return useMutation(
    gql`
        mutation savePayslipNote($payslipNote: PayslipInput) {
            savePayslipNote(payslipNote: $payslipNote)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getSalaryProcessByEmployeeIdAndStatus() {
  return useLazyQuery(
    gql`
      query getSalaryProcessByEmployeeIdAndStatus($employeeId: String, $status: Boolean){
        getSalaryProcessByEmployeeIdAndStatus(employeeId: $employeeId, status: $status) {
          id
          employeeId
          createdMonth
          createdYear
          salaryProcessForm
          salaryScale
          salaryLevel
          salaryCoefficient
          salary
          regionalMinimumWage
          totalSalary
          note
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

export {
  addColumnTemplate,
  calculatePayslip,
  createPayslip,
  deleteColumnTemplate,
  deleteEmployeePayslip,
  deletePayslip,
  deletePayslipInfo,
  deleteSalaryProcess,
  deleteSalaryTemplate,
  findPayslipById,
  getAllPayslip,
  getAllPayslipInfo,
  getAllSalaryProcessByEmployeeId,
  getAllSalaryTemplates,
  getColumnTemplateById,
  getDefaultPayslipInfos,
  getEmployeePayslip,
  getMaxOrderNumPayslipInfo,
  getPayslipByMonthYear,
  getPayslipInfo,
  getPayslipNode,
  getSalaryProcessByEmployeeIdAndStatus,
  getSalaryProcessById,
  getSalaryTemplateById,
  type SalaryTemplate,
  type SalaryTemplateColumn,
  saveEmployeePayslip,
  savePayslipInfo,
  savePayslipNote,
  saveRecordValues,
  saveSalaryProcess,
  saveSalaryTemplate,
  searchEmployeePayslip,
  searchSalaryTemplates,
  updateStatus,
  updateStatusColumn,
  updateStatusTemplate
};