import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findLogByObjectId(objectId: string) {
  return useQuery(
    gql`
      query findLogByObjectId($objectId: String) {
        findLogByObjectId(objectId: $objectId) {
              id
              objectId
              docType
              actionType
              createdTime
              createdBy
              lastModifiedTime
              lastModifiedBy
        }
      }
    `,
    { objectId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { findLogByObjectId };
