import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { ReceiveObjectType } from '@/apps/document/model/outgoingDocReceivers';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findByDocIdAndObjectTypeNot(docId: string, objectType: ReceiveObjectType) {
  return useQuery(
    gql`
      query findByDocIdAndObjectTypeNot($docId: String, $objectType: ReceiveObjectType){
          findByDocIdAndObjectTypeNot(docId: $docId, objectType: $objectType){
              id
              objectId
              objectName
              docId
              objectType
              receiveType
              orderNo
              receiveStatus
              receiveTime
              isDeleted
              deptId
              deptName
              roleId
              roleName
          }
      }
    `,
    {
      docId,
      objectType
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { findByDocIdAndObjectTypeNot };
