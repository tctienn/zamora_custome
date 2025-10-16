import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

const managerColumns = [
  'id',
  'fullName',
  'dateOfBirth',
  'gender',
  'ethnic',
  'religion',
  'manager',
  'personalNumber',
  'placeOfIssue',
  'personalPhone',
  'type',
  'personalEmail',
  'workEmail',
  'taxNumber',
  'permanentResident',
  'residence',
  'accountNumber',
  'bankCode',
  'insuranceNumber',
  'recruitmentDate',
  'permanentRecruitmentDate',
  'offWorkDate',
  'status',
  'maritalStatus',
  'department',
  'positionName',
];

const mainColumns = [
  'id',
  'fullName',
  'dateOfBirth',
  'gender',
  'ethnic',
  'religion',
  'manager',
  'personalNumber',
  'issueDate',
  'placeOfIssue',
  'personalPhone',
  'type',
  'personalEmail',
  'workEmail',
  'taxNumber',
  'permanentResident',
  'residence',
  'accountNumber',
  'bankCode',
  'insuranceNumber',
  'recruitmentDate',
  'permanentRecruitmentDate',
  'offWorkDate',
  'profileImage',
  'status',
  'maritalStatus',
  'department',
  'positionId',
  'positionName',
  'userId'
];

const extendColumns = [
  'fieldName',
  'type',
  'value',
];

const attachmentColumns = [
  'id',
  'extension',
  'name',
  'size',
  'path',
  'objectId',
  'objectType',
];

const employeeDocumentColumns = [
  'documentCode',
  'additionalDate',
  'status',
];

function saveEmployeeGraphql() {
  return useMutation(
    gql`
        mutation ($employeeInput: EmployeeInput!, $attachments: [UploadMultiple], $documents: [EmployeeDocumentInput]){
            saveEmployee(employeeInput: $employeeInput, attachments: $attachments, documents: $documents) {
                id
                fullName
            }
        }
    `, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getListEmployeeGraphql() {
  return useQuery(
    gql`
        query{
            getAllEmployees {
                id
                fullName
            }
        }
    `, {}, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchEmployeesGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable){
            searchEmployees(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        ${ managerColumns.join(' ') }
                    }
                }
            }
        }
    `, { ...data },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteEmployeeGraphql() {
  return useMutation(
    gql`
        mutation ($id: String!){
            deleteEmployee(id: $id)
        }
    `, {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getEmployeeByIdGraphql(id: string) {
  return useQuery(
    gql`
        query ($id: String!) {
            getEmployeeById(id: $id) {
                ${ mainColumns.join(' ') }
                employeeExtends { ${ extendColumns.join(' ') }}
                attachments { ${ attachmentColumns.join(' ') }}
                employeeDocuments {${ employeeDocumentColumns.join(' ') + ' attachments {' + attachmentColumns.join(' ') + '}' }}
            }
        }
    `, { id },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getPersonalInfoGraphql() {
  return useQuery(
    gql`
        query {
            getPersonalInfo {
                ${ mainColumns.join(' ') }
                employeeExtends { ${ extendColumns.join(' ') }}
                attachments { ${ attachmentColumns.join(' ') }}
                employeeDocuments {${ employeeDocumentColumns.join(' ') + ' attachments {' + attachmentColumns.join(' ') + '}' }}
            }
        }
    `, {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteEmployeeGraphql, getEmployeeByIdGraphql, getListEmployeeGraphql, getPersonalInfoGraphql, saveEmployeeGraphql, searchEmployeesGraphql };
