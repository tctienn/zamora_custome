import { useLazyQuery, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { AttachmentSignType } from '@/apps/document/model/attachment';
import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findByObjectId(objectId: string, userDeptRole?: UserDeptRoleInput) {
  return useQuery(
    gql`
      query findByObjectId($objectId: String, $userDeptRole: UserDeptRole) {
        findByObjectId(objectId: $objectId, userDeptRole: $userDeptRole) {
          id
          fullName
          objectId
          objectType
          fileName
          fileExtension
          filePath
          note
          isEncrypt
          isDeleted
          pdfAlready
          hasImage
          attachType
          size
        }
      }
    `,
    {
      objectId,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findAllDocTemplate() {
  return useQuery(
    gql`
      query findAllDocTemplate {
        findAllDocTemplate {
          id
          fullName
          objectId
          objectType
          fileName
          fileExtension
          filePath
          note
          isEncrypt
          isDeleted
          pdfAlready
          hasImage
          attachType
          size
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

function isSigned(
  attachmentId: string,
  userDeptRole: UserDeptRoleInput,
  signType: AttachmentSignType,
) {
  return useLazyQuery(
    gql`
      query isSigned(
        $attachmentId: String!
        $userDeptRole: UserDeptRole!
        $signType: AttachmentSignType!
      ) {
        isSigned(
          attachmentId: $attachmentId
          userDeptRole: $userDeptRole
          signType: $signType
        )
      }
    `,
    {
      attachmentId,
      userDeptRole,
      signType,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { findAllDocTemplate, findByObjectId, isSigned };
