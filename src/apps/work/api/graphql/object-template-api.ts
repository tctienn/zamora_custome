import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getObjectPropertiesGraphql() {
  return useQuery(
    gql`
        query {
            getObjectProperties {
                fieldName
                name
                dataType
                referenceData
                defaultValue
                listValue
                type
                description
                status
                order
                required
                group
            }
        }
    `, {}, {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { getObjectPropertiesGraphql };
