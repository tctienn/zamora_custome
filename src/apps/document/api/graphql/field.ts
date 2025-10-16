import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchField(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable){
          searchField(keyword: $keyword, pageable: $pageable) {
            totalCount
            edges {
              node {
                id
                name
                code
                status
              }
            }
          }
        }
        `, { ...data },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getFieldById(id: string) {
  return useQuery(
    gql`
            query ($id: String){
                getFieldById(id: $id) {
                    id
                    code
                    name
                    status
                    norder
                  }
            }
        `, { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllField() {
  return useQuery(
    gql`
            query getAllField{
                getAllField {
                    id
                    code
                    name
                    status
                  }
            }
        `, {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveField() {
  return useMutation(
    gql`  
         mutation saveField($field: FieldInput){
            saveField(field: $field) {
                id
                code
                name
                status
                norder
            }
        }
    `, {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteField() {
  return useMutation(
    gql`  
         mutation deleteField($id: String){
            deleteField(id: $id) {
                id
                code
                name
            }
        }
    `, {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function maxNOrderField() {
  return useQuery(
    gql`
            query maxOrderActiveField {
                maxOrderActiveField
            }
        `, {}, {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteField, getAllField, getFieldById, maxNOrderField, saveField, searchField };