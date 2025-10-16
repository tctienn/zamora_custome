import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchDocumentTo(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
        query searchDocumentTo($keyword: String, $pageable: Pageable){
            searchDocumentTo(keyword: $keyword, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        id
                        excerptFromTheText
                        branch
                        content
                        documentForm
                        urgency
                        documentType
                        dateIssued
                        confidentiality
                        registrationNo
                        toDate
                        signer
                        noSaved
                        processingDeadline
                        issuingAgency
                        fileAttach
                        appendixFile
                        appendixFormFile
                        documentNo
                        sender
                        status
                        unitGetRegistrationNumber
                    }
                }
            }
        }
    `, { ...data },
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function findDocumentToById(id: string) {
  return useQuery(
    gql`
        query findDocumentToById($id: String){
            findDocumentToById(id: $id){
                id
                excerptFromTheText
                branch
                content
                documentForm
                urgency
                documentType
                dateIssued
                confidentiality
                registrationNo
                toDate
                signer
                noSaved
                processingDeadline
                issuingAgency
                fileAttach
                appendixFile
                appendixFormFile
                documentNo
                unitGetRegistrationNumber
            }
        }
    `, { id },
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteDocumentToGraph() {
  return useMutation(
    gql`
        mutation deleteDocumentTo($id: String){
            deleteDocumentTo(id: $id){
                id
            }
        }
    `,
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { deleteDocumentToGraph, findDocumentToById, searchDocumentTo };
