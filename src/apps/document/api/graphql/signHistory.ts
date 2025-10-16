import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function signDoc() {
  return useMutation(
    gql`
      mutation signDoc($signHistoryModel: SignHistoryModel) {
        signDoc(signHistoryModel: $signHistoryModel) {
          id
          attachmentId
          signerId
          signerName
          signerRoleId
          signerRoleName
          signerDeptId
          signerDeptName
          signType
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

export { signDoc };
