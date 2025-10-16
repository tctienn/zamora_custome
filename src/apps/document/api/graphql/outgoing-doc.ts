import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function outFlowAction() {
  return useMutation(
    gql`
          mutation outFlowAction(
              $currentProcessId: String!,
              $outgoingProcesses: [OutgoingProcessInput]!,
              $userDeptRole: UserDeptRole!, $result: String!,
              $moreInfo:AdditionalInfoFlowAction) {
              outFlowAction(
                  currentProcessId: $currentProcessId,
                  outgoingProcesses: $outgoingProcesses,
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

function readOutProcess() {
  return useMutation(
    gql`
      mutation readOutProcess($processId: String!) {
        readOutProcess(processId: $processId)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function sendDocOutBack() {
  return useMutation(
    gql`
          mutation sendDocOutBack($processId: String!, $userDeptRole: UserDeptRole!,$moreInfo:AdditionalInfoFlowAction) {
              sendDocOutBack(processId: $processId, userDeptRole: $userDeptRole, moreInfo:$moreInfo )
          }
      `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function revokeDocOutGraphql() {
  return useMutation(
    gql`
          mutation revokeDocOut($revokeModelInput:RevokeModelInput,$userDeptRole:UserDeptRole!) {
              revokeDocOut(revokeModelInput: $revokeModelInput,userDeptRole: $userDeptRole){
                  commentIds
                  outgoingProcessIds
              }
          }
      `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function revokePromulgatedDoc() {
  return useMutation(
    gql`
          mutation revokePromulgatedDoc($model: RevokePromulgatedDocModel, $userDeptRole: UserDeptRole!) {
              revokePromulgatedDoc(model: $model, userDeptRole: $userDeptRole)
          }
      `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function cancelPromulgateDoc() {
  return useMutation(
    gql`
          mutation cancelPromulgateDoc($model: CancelPromulgatedDocModel) {
              cancelPromulgateDoc(model: $model)
          }
      `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { cancelPromulgateDoc, outFlowAction, readOutProcess, revokeDocOutGraphql, revokePromulgatedDoc, sendDocOutBack };
