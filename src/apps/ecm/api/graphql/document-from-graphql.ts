import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchDocumentFrom(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
            query searchDocumentFrom($keyword: String, $pageable: Pageable){
                searchDocumentFrom(keyword: $keyword, pageable: $pageable){
                    totalCount
                    edges{
                        node{
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

function findDocumentById(id: string) {
  return useQuery(
    gql`
            query findDocumentById($id: String){
                findDocumentById(id: $id){
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
                }
            }
        `, { id },
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function deleteDocumentGraph() {
  return useMutation(
    gql`
            mutation deleteDocument($id: String){
                deleteDocument(id: $id){
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

export { deleteDocumentGraph, findDocumentById, searchDocumentFrom };
