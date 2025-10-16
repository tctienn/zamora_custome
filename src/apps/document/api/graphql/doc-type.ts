import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchDocType(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable){
          searchDocType(keyword: $keyword, pageable: $pageable) {
            totalCount
            edges {
              node {
                id
                name
                code
                status
                numberOfProcessingDays
                signDefault
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

function getDocTypeById(id: string) {
  return useQuery(
    gql`
            query ($id: String){
                getDocTypeById(id: $id) {
                    id
                    code
                    name
                    status
                    norder
                    numberOfProcessingDays
                    signDefault
                  }
            }
        `, { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllDocType() {
  return useQuery(
    gql`
            query getAllDocType{
                getAllDocType {
                    id
                    code
                    name
                    status
                    numberOfProcessingDays
                    signDefault
                  }
            }
        `, {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveDocType() {
  return useMutation(
    gql`  
         mutation saveDocType($docType: DocTypeInput){
            saveDocType(docType: $docType) {
                id
                code
                name
                status
                norder
                numberOfProcessingDays
                signDefault
            }
        }
    `, {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteDocType() {
  return useMutation(
    gql`  
         mutation deleteDocType($id: String){
            deleteDocType(id: $id) {
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

function maxNOrderDocType() {
  return useQuery(
    gql`
            query maxOrderActiveDocType {
                maxOrderActiveDocType
            }
        `, {}, {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteDocType, getAllDocType, getDocTypeById, maxNOrderDocType, saveDocType, searchDocType };