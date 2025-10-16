import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function createClient() {
  return useMutation(
    gql`
          mutation ($data: ClientInput) {
              createClient(data: $data) {
                  id
                  city
                  clientCode
                  clientName
                  address
                  email
                  field
                  foundingDate
                  groupClient
                  home
                  note
                  phone
                  scale
                  taxCode
                  status
                  isDelete
                  contact
                  contactEmail
                  contactPhone
                  position
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function searchClientGraphql(defaultParam: { searchCondition: string, pageable: object }, columns: string[] = []) {
  if (!columns.length) {
    columns = [
      'id',
      'city',
      'clientCode',
      'clientName',
      'address',
      'email',
      'employeeCode',
      'employeeName',
      'field',
      'foundingDate',
      'groupClient',
      'home',
      'note',
      'phone',
      'scale',
      'taxCode',
      'status',
      'isDelete',
      'contact',
      'contactEmail',
      'contactPhone',
      'position'
    ];
  }

  const columnsFilter = columns.join(' ');
  return useQuery(
    gql`
          query ($searchCondition: String, $pageable : Pageable) {
              clients(searchCondition: $searchCondition, pageable : $pageable) {
                  edges {
                      node {
                          ${ columnsFilter },
                      }
                  }
                  totalCount
              }
          }
      `,
    { ...defaultParam }
    , {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteClient() {
  return useMutation(
    gql`
          mutation ($id: String!){
              deleteClient(id : $id){
                  id
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function updateClient() {
  return useMutation(
    gql`
          mutation ($data: ClientInput) {
              updateClient(data: $data) {
                  id
              }
          }
      `, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function updateEmployeeOfClient() {
  return useMutation(
    gql`
          mutation ($data: EmployeeInput, $id: String) {
              updateEmployeeOfClient(data: $data, id : $id) {
                  id
              }
          }
      `,
  );
}

function getAllClientGraphql() {
  return useQuery(
    gql`
          query {
              allClient {
                  id
                  city
                  clientCode
                  clientName
                  employeeCode
                  employeeName
                  address
                  email
                  field
                  foundingDate
                  groupClient
                  home
                  note
                  phone
                  scale
                  taxCode
                  status
                  isDelete
                  contact
                  contactEmail
                  contactPhone
                  position
              }
          }
      `,
    {}
    , {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findClientById(){
  return useLazyQuery(
    gql`
            query ($id: String){
                findClientById(id: $id){
                    id
                    city
                    clientCode
                    clientName
                    address
                    email
                    employeeCode
                    employeeName
                    field
                    foundingDate
                    groupClient
                    home
                    note
                    phone
                    scale
                    taxCode
                    status
                    isDelete
                    contact
                    contactEmail
                    contactPhone
                    position
                }
            }
        `,
    {}, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  createClient,
  deleteClient,
  findClientById,
  getAllClientGraphql,
  searchClientGraphql,
  updateClient,
  updateEmployeeOfClient
};
