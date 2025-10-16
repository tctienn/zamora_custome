import { useLazyQuery, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { SearchModel } from '@/apps/document/model/doc/search';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

const listDocFields = `
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
                canDelete
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
                  bookId
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
`;

function waitingDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
        query($search: SearchModel, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
          waitingDocs(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
            ${listDocFields}
          }
        }
        `,
    {
      search,
      userDeptRole,
      pageable,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countWaitingDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query ($search: SearchModel, $userDeptRole: UserDeptRole!) {
        countWaitingDocs(search: $search, userDeptRole: $userDeptRole)
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function processingDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
        query($search: SearchModel, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
          processingDocs(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
            ${listDocFields}
          }
        }
        `,
    {
      search,
      userDeptRole,
      pageable,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getSigner() {
  return useQuery(
    gql`
      query getSigner {
        getSigner
      }
    `,
    {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countProcessingDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query ($search: SearchModel, $userDeptRole: UserDeptRole!) {
        countProcessingDocs(search: $search, userDeptRole: $userDeptRole)
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function processedDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
        query($search: SearchModel, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
          processedDocs(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
            ${listDocFields}
          }
        }
        `,
    {
      search,
      userDeptRole,
      pageable,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countProcessedDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query ($search: SearchModel, $userDeptRole: UserDeptRole!) {
        countProcessedDocs(search: $search, userDeptRole: $userDeptRole)
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function ccDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
      query (
        $search: SearchModel
        $userDeptRole: UserDeptRole!
        $pageable: Pageable
      ) {
        ccDocs(
          search: $search
          userDeptRole: $userDeptRole
          pageable: $pageable
        ) {
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
              cc {
                id
                senderId
                senderRoleId
                senderDeptId
                sendTime
                senderName
                senderRoleName
                senderDeptName
                isRead
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

              book {
                id
                bookId
                docType
                bookNumber
                status
              }
            }
          }
        }
      }
    `,
    {
      search,
      userDeptRole,
      pageable,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countCCDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query ($search: SearchModel, $userDeptRole: UserDeptRole!) {
        countCCDocs(search: $search, userDeptRole: $userDeptRole)
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function waitingCommentDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
    query ($search: SearchModel, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
      waitingCommentDocs(
        search: $search
        userDeptRole: $userDeptRole
        pageable: $pageable
      ) {
        ${docCommentFields}
      }
    }
    `,
    {
      search,
      userDeptRole,
      pageable,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countWaitingCommentDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query ($search: SearchModel, $userDeptRole: UserDeptRole!) {
        countWaitingCommentDocs(search: $search, userDeptRole: $userDeptRole)
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

const docCommentFields = `
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
            
            comment {
              id
              fromUserId
              fromDeptId
              fromRoleId
              fromUserName
              fromDeptName
              fromRoleName
              sendTime
              isRead
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
            
            book {
              id
              bookId
              docType 
              bookNumber
              status
            }
          }
        }
        `;

function commentedDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
    query ($search: SearchModel, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
      commentedDocs(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
        ${docCommentFields}
      }
    }
    `,
    {
      search,
      userDeptRole,
      pageable,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countCommentedDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query ($search: SearchModel, $userDeptRole: UserDeptRole!) {
        countCommentedDocs(search: $search, userDeptRole: $userDeptRole)
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

const listRevokedDocFields = `
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
                  note
                }
                book {
                  id
                  docType 
                  bookNumber
                  status
                }
              }
            }
          `;

function revokedDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
        query ($search: SearchModel, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
          revokedDocs(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
              ${listRevokedDocFields}
          }
        }
        `,
    {
      search,
      userDeptRole,
      pageable,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countRevokedDocs(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query ($search: SearchModel, $userDeptRole: UserDeptRole!) {
        countRevokedDocs(search: $search, userDeptRole: $userDeptRole)
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countOverdueDocs(userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
      query ($userDeptRole: UserDeptRole!) {
        countOverdueDocs(userDeptRole: $userDeptRole)
      }
    `,
    { userDeptRole },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countDeadlineDocs(
  daysBefore: number | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query ($daysBefore: Int, $userDeptRole: UserDeptRole!) {
        countDeadlineDocs(daysBefore: $daysBefore, userDeptRole: $userDeptRole)
      }
    `,
    {
      daysBefore,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function canRevokeDoc(docId: string, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
      query canRevokeDoc($docId: String, $userDeptRole: UserDeptRole!) {
        canRevokeDoc(docId: $docId, userDeptRole: $userDeptRole)
      }
    `,
    {
      docId,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function canRevokeDocLazy(docId: string, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
      query canRevokeDoc($docId: String, $userDeptRole: UserDeptRole!) {
        canRevokeDoc(docId: $docId, userDeptRole: $userDeptRole)
      }
    `,
    {
      docId,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function canReturnDocLazy(docId: string, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
      query canReturn($docId: String, $userDeptRole: UserDeptRole!) {
        canReturn(docId: $docId, userDeptRole: $userDeptRole)
      }
    `,
    {
      docId,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getListCanRevokeDoc(docId: string, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
      query getListCanRevokeDoc($docId: String, $userDeptRole: UserDeptRole!) {
        getListCanRevokeDoc(docId: $docId, userDeptRole: $userDeptRole) {
          ... on CCInfo {
            __typename
            id
            receiverId
            receiverName
            receiverDeptId
            receiverDeptName
            receiverDeptName
            receiverRoleId
            receiverRoleName
            sendTime
          }
          ... on Comment {
            __typename
            id
            toUserId
            toUserName
            toDeptId
            toDeptName
            toRoleId
            toRoleName
            content
            sendTime
          }
          ... on IncomingProcess {
            __typename
            id
            receiverId
            receiverName
            receiverDeptId
            receiverDeptName
            receiverDeptName
            receiverRoleId
            receiverRoleName
            note
            sendTime
            status
          }
        }
      }
    `,
    {
      docId,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getFilesFromSystemDocIn() {
  return useLazyQuery(
    gql`
      query getFilesFromSystemDocIn($userDeptRole: UserDeptRole!) {
        getFilesFromSystemDocIn(userDeptRole: $userDeptRole) {
          docId
          quote
          docDate
          docCode
          docId
          quote
          docDate
          docCode
          attachmentId
          fullName
          objectId
          fileName
          fileExtension
          filePath
          size
          createdBy
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

function searchAllDocIn(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
          query searchAllDocIn($search: SearchModel, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
              searchAllDocIn(
                  search: $search
                  userDeptRole: $userDeptRole
                  page: $pageable
              ) {
                  ${listDocFields}
              }
          }
      `,
    {
      search,
      userDeptRole,
      pageable,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countWaitingWithPriority(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countWaitingWithPriority(
        $search: SearchModel
        $userDeptRole: UserDeptRole!
      ) {
        countWaitingWithPriority(search: $search, userDeptRole: $userDeptRole) {
          countNormal
          countExpress
        }
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countProcessingWithPriority(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countWaitingWithPriority(
        $search: SearchModel
        $userDeptRole: UserDeptRole!
      ) {
        countWaitingWithPriority(search: $search, userDeptRole: $userDeptRole) {
          countNormal
          countExpress
        }
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countWaitingCommentWithPriority(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countWaitingWithPriority(
        $search: SearchModel
        $userDeptRole: UserDeptRole!
      ) {
        countWaitingWithPriority(search: $search, userDeptRole: $userDeptRole) {
          countNormal
          countExpress
        }
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countCCDocsWithPriority(
  search: SearchModel | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countCCDocsWithPriority(
        $search: SearchModel
        $userDeptRole: UserDeptRole!
      ) {
        countCCDocsWithPriority(search: $search, userDeptRole: $userDeptRole) {
          countNormal
          countExpress
        }
      }
    `,
    {
      search,
      userDeptRole,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getDocInByUserId(page?: Pageable) {
  return useLazyQuery(
    gql`
      query getAllDocInByUserId($page: Pageable) {
        getAllDocInByUserId(page: $page) {
          edges {
            node {
              processId
              commentId
              ccId
              id
              quote
              docCode
              docDate
              attachments {
                id
                fileName
                filePath
                fileExtension
                fullName
                size
              }
            }
          }
        }
      }
    `,
    { page: page },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getTagsByDocInId(id: string) {
  return useLazyQuery(
    gql`
          query getTagsByDocInId($id: String) {
              getTagsByDocInId(id: $id)
          }
      `,
    { id: id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  canReturnDocLazy,
  canRevokeDoc,
  canRevokeDocLazy,
  ccDocs,
  commentedDocs,
  countCCDocs,
  countCCDocsWithPriority,
  countCommentedDocs,
  countDeadlineDocs,
  countOverdueDocs,
  countProcessedDocs,
  countProcessingDocs,
  countProcessingWithPriority,
  countRevokedDocs,
  countWaitingCommentDocs,
  countWaitingCommentWithPriority,
  countWaitingDocs,
  countWaitingWithPriority,
  getDocInByUserId,
  getFilesFromSystemDocIn,
  getListCanRevokeDoc,
  getSigner,
  getTagsByDocInId,
  processedDocs,
  processingDocs,
  revokedDocs,
  searchAllDocIn,
  waitingCommentDocs,
  waitingDocs
};
