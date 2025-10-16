import { useLazyQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { SearchModel } from '@/apps/document/model/doc/search';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

function adminSearchAllDocIn(search: SearchModel, pageable: Pageable) {
  return useLazyQuery(
    gql`
        query adminSearchAllDocIn($search: SearchModel,$pageable:Pageable) {
            adminSearchAllDocIn(search: $search,pageable:$pageable) {
                totalCount
                edges {
                    node {
                        id
                        processId
                        ccId
                        commentId
                        docCode
                        docDate
                        quote
                        identifyCode
                        publisherName
                        deadlineDate
                        securityCode
                        priorityCode
                        incomingDate
                        status
                        docTypeName
                        sendBackType
                        hasPrivateComment
                        process {
                            id
                            isRead
                            processType
                            sendTime
                            senderId
                            senderDeptId
                            senderRoleId
                            senderName
                            senderDeptName
                            senderRoleName
                            stepId
                            flowInstanceId
                            processType
                            isComplete
                        }
                        book {
                            id
                            docType
                            bookNumber
                            status
                        }

                        attachments {
                            id
                            fullName
                            fileName
                            fileExtension
                            size
                            filePath
                            attachType
                        }
                        hasTaskCreated
                    }
                }
            }
        }
    `,
    {
      search,
      pageable
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export { adminSearchAllDocIn };