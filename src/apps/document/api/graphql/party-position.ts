import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchPartyPosition(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable){
          searchPartyPosition(keyword: $keyword, pageable: $pageable) {
            totalCount
            edges {
              node {
                id
                name
                code
                status
                description
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

function getPartyPositionById(id: string) {
  return useQuery(
    gql`
            query ($id: String){
                getPartyPositionById(id: $id) {
                    id
                    code
                    name
                    description
                    status
                  }
            }
        `, { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getAllPartyPosition() {
  return useQuery(
    gql`
            query getAllPartyPosition{
                getAllPartyPosition {
                    id
                    code
                    name
                    description
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

function savePartyPosition() {
  return useMutation(
    gql`  
         mutation savePartyPosition($partyPosition: PartyPositionInput){
            savePartyPosition(partyPosition: $partyPosition) {
                id
                code
                name
                status
            }
        }
    `, {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deletePartyPosition() {
  return useMutation(
    gql`  
         mutation deletePartyPosition($id: String){
            deletePartyPosition(id: $id) {
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

export { deletePartyPosition, getAllPartyPosition, getPartyPositionById, savePartyPosition, searchPartyPosition };