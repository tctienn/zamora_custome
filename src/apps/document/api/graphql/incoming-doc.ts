import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function flowAction() {
  return useMutation(
    gql`
        mutation flowAction(
          $currentProcessId: String!, 
          $incomingProcesses: [IncomingProcessInput]!, 
          $userDeptRole: UserDeptRole!, $result: String!,
          $moreInfo:AdditionalInfoFlowAction) {
            flowAction(
              currentProcessId: $currentProcessId, 
              incomingProcesses: $incomingProcesses, 
              userDeptRole: $userDeptRole , 
              result: $result, moreInfo:$moreInfo )
        }
        `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function completeDoc() {
  return useMutation(
    gql`
            mutation completeDoc($currentProcessId: String!, $note:String, $userDeptRole: UserDeptRole!) {
                completeDoc(currentProcessId: $currentProcessId, note: $note, userDeptRole: $userDeptRole)
            }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function sendDocBack() {
  return useMutation(
    gql`
        mutation sendDocBack($docId: String!, $userDeptRole: UserDeptRole!,$moreInfo:AdditionalInfoFlowAction) {
            sendDocBack(docId: $docId, userDeptRole: $userDeptRole, moreInfo:$moreInfo )
        }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function setDocToCC() {
  return useMutation(
    gql`
            mutation setDocToCC($docId: String!, $userDeptRole: UserDeptRole!) {
                setDocToCC(docId: $docId, userDeptRole: $userDeptRole)
            }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function readProcess() {
  return useMutation(
    gql`
      mutation readProcess($processId: String!) {
        readProcess(processId: $processId)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function readCC() {
  return useMutation(
    gql`
      mutation readCC($ccId: String!) {
        readCC(ccId: $ccId)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function revokeGraphql() {
  return useMutation(
    gql`
          mutation revoke($revokeModelInput:RevokeModelInput,$userDeptRole:UserDeptRole!) {
              revoke(revokeModelInput: $revokeModelInput,userDeptRole: $userDeptRole){
                  ccInfoIds
                  commentIds
                  incomingProcessIds
              }
          }
      `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}
export {
  completeDoc,
  flowAction,
  readCC,
  readProcess,
  revokeGraphql,
  sendDocBack,
  setDocToCC,
};
