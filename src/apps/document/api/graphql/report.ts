import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function reportDocIn() {
  return useLazyQuery(
    gql`
        query reportDocIn($userDeptRole: UserDeptRole,$reportDocInModel: ReportDocInModel, $pageable: Pageable) {
          reportDocIn(userDeptRole: $userDeptRole,reportDocInModel: $reportDocInModel, pageable: $pageable){
          totalCount
          edges {
                node {
                  id
                  incomingDate
                  bookName
                  docCode
                  quote
                  docTypeName
                  priorityCode
                  publisherName
                  docDate
                  deliveryNumber
                  note
              }
            }
          }
        }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function reportDocOut() {
  return useLazyQuery(
    gql`
        query reportDocOut($userDeptRole: UserDeptRole!, $reportDocOutModel: ReportDocOutModel, $pageable: Pageable) {
          reportDocOut(userDeptRole: $userDeptRole, reportDocOutModel: $reportDocOutModel, pageable: $pageable){
          totalCount
            edges {
                node {
                    id
                    docDate
                    bookName
                    docCode
                    quote
                    priorityCode
                    signerName
                    issuerDeptName
                    numberOfCopy
                    docTypeName
                    receiverUserName
                    receiverDeptName
                    issueDate
                }
            }
          }
        }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { reportDocIn, reportDocOut };
