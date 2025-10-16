import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { SearchDeadlineExtension } from '@/apps/work/model/taskDeadlineExtension';
import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function getTaskDeadlineExtensionByTaskId(searchModel: SearchDeadlineExtension, pageable: Pageable) {
  return useLazyQuery(
    gql`
          query searchDeadlineExtension($searchModel: SearchDeadlineExtension,$pageable:Pageable){
              searchDeadlineExtension(searchModel: $searchModel,pageable:$pageable){
                  totalCount
                  edges {
                      node {
                          id
                          taskId
                          reason
                          newDeadline
                          isAccepted
                          createdBy
                          createdTime
                          lastModifiedBy
                          lastModifiedTime
                          status
                      }
                  }
              }
          }
      `, {
      searchModel: searchModel,
      pageable: pageable
    }, { clientId: WORK_CLIENT_ID }
  );
}

export { getTaskDeadlineExtensionByTaskId };