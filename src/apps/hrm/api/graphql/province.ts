import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function searchAddress(keyword: string) {
  return useQuery(
    gql`
      query searchAddress($keyword: String) {
        searchAddress(keyword: $keyword) {
          wardName
          cityName
        }
      }
    `,
    { keyword },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { searchAddress };
