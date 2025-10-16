import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { necessaryTaskModel } from '@/apps/work/api/graphql/task-api';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function findTasksByAssignerRangeDateGraphql(data: { fromDate: string, toDate: string }) {
  return useQuery(
    gql`
        query ($fromDate: DateTime, $toDate: DateTime){
            findTasksByAssignerRangeDate(fromDate: $fromDate,toDate: $toDate){
                ${ necessaryTaskModel() }
            }
        }
    `, { ...data },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export { findTasksByAssignerRangeDateGraphql };