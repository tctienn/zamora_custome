import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { WORK_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

export function getMessage(projectId: string, pageable: Pageable) {
  return useLazyQuery(
    gql`
        query getMessage($projectId: String!, $pageable: Pageable){
            getMessage(projectId: $projectId, pageable: $pageable) {
                totalCount
                edges{
                    node{
                        id
                        isDeleted
                        name
                        projectId
                        sendId
                        createdTime
                        createdBy
                        lastModifiedTime
                        lastModifiedBy
                        content
                        replyId
                        attachments{
                            id
                            size
                            name
                            downloadPath
                            extension
                        }
                        seenUserIds
                    }
                }
            }
        }
    `, {
      projectId: projectId,
      pageable: pageable
    },
    {
      clientId: WORK_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}