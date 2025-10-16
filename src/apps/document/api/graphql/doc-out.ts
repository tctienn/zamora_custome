import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocOutSearch } from '@/apps/document/model/doc/search';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

const listDocOutFields = `
            id
            processId
            commentId
            docCode
            docDate
            quote
            editorId
            editorName
            editorDeptId
            editorDeptName
            editorRoleId
            editorRoleName
            signerName
            docTypeName
            deadlineDate
            deadlineNumber
            createdTime
            status
            securityCode
            priorityCode
            sendBackType
            issuerDeptName
            drafterId
            drafterName
            drafterDeptId
            drafterDeptName
            drafterRoleId
            drafterRoleName
            areaName
            hasPrivateComment
            drafterDeptName
            revokeType
            
            outGoingAttachments {
              id
              fullName
              fileName
              fileExtension
              size
              filePath
              attachType
              isCaSign
              isDigitalSign
            }
            
            attachmentOfOutGoingDoc{
              id
              fullName
              fileName
              fileExtension
              size
              filePath
              attachType
              isCaSign
              isDigitalSign
            }
            
            outGoingFilesRelate {
              id
              fullName
              fileName
              fileExtension
              size
              filePath
              attachType
            }
            
            flowId
`;

const listDocOutFieldsWithProcess = `${listDocOutFields}
      process {
        id
        senderId
        senderName
        senderDeptId
        senderDeptName
        senderRoleId
        senderRoleName
        sendTime
        isRead
        flowInstanceId
        isComplete
        stepId
        processType
      }
`;

const listDocOutFieldsWithComment = `${listDocOutFields}
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
`;

const listRevokedDocOutFields = `
      id
      processId
      commentId
      docCode
      docDate
      quote
      editorId
      editorName
      editorDeptId
      editorDeptName
      editorRoleId
      editorRoleName
      signerName
      docTypeName
      deadlineDate
      deadlineNumber
      createdTime
      status
      securityCode
      priorityCode
      
      process {
        id
        senderId
        senderName
        senderDeptId
        senderDeptName
        senderRoleId
        senderRoleName
        sendTime
        note
      }
`;

const listDocOutFieldsWithBook = `${listDocOutFields}
      docInBook {
        id
        bookNumber
        bookId
        docType
      }
`;

const listDocOutFieldsWithProcessAndBook = `${listDocOutFieldsWithProcess}
      docInBook {
        id
        bookNumber
        bookId
        docType
      }
`;

const listDocOutFieldsWithSigner = `${listDocOutFieldsWithBook}
      signerId
      signerName
`;

const fullDocFields = `
            id
            processId
            commentId
            bookId
            bookName
            bookNumber
            docCode
            subBookNumber
            docDate
            signerId
            signerName
            publisherId
            publisherName
            docTypeId
            docTypeName
            priorityCode
            securityCode
            areaId
            areaName
            deadlineDate
            deadlineNumber
            numberOfPage
            numberOfCopy
            quote
            isReply
            replyFor
            note
            copyFrom
            editorId
            editorName
            editorDeptId
            editorDeptName
            identifyCode
            qrCode
            fileId
            status
            isLawDocument
            signTime
            signType
            publishType
            isDeleted
            issuerDeptId
            issuerDeptName
            issuerId
            issuerName
            drafterId
            drafterName
            drafterDeptId
            drafterDeptName
            drafterRoleId
            drafterRoleName
            advice
            createdBy
            createdTime
            flowId
            isFromOutsidePaper
            lastModifiedBy
            lastModifiedTime
            isTemporaryFlow
            revokeType
`;

const fieldsAttachment = `
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
            typeOfTake
`;

function findDocOutByIdGraph(userDeptRole: UserDeptRoleInput, id: string) {
  return useQuery(
    gql`
        query findByDocOutById($userDeptRole: UserDeptRole!, $id: String!) {
            findByDocOutById(userDeptRole: $userDeptRole, id: $id) {
                ${fullDocFields}
                docTypeCode
                drafterDeptCode
                isProcessing
                receivers{
                    id
                    objectId
                    objectName
                    objectType
                    receiveType
                    orderNo
                    receiveStatus
                    receiveTime
                    isDeleted
                    roleId
                    roleName
                    deptId
                    deptName
                }
                outGoingAttachments{
                    ${fieldsAttachment}
                }
                outGoingFilesRelate{
                    ${fieldsAttachment}
                }
                incomingDoc{
                    id
                    processId
                    ccId
                    commentId
                    quote
                    docDate
                    docCode
                }
            }
        }
    `,
    {
      userDeptRole,
      id,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function docOutDrafts(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable,
) {
  return useLazyQuery(
    gql`
        query docOutDrafts($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docOutDrafts(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        ${listDocOutFields}
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

function countDocOutDrafts(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutDrafts(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutDrafts(search: $search, userDeptRole: $userDeptRole)
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

function docOutWaitingProcess(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable,
) {
  return useLazyQuery(
    gql`
        query docOutWaitingProcess($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docOutWaitingProcess(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        ${listDocOutFieldsWithProcess}
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

function countDocOutWaitingProcess(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutWaitingProcess(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutWaitingProcess(search: $search, userDeptRole: $userDeptRole)
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

function docOutProcessing(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable,
) {
  return useLazyQuery(
    gql`
        query docOutProcessing($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docOutProcessing(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        ${listDocOutFieldsWithProcess}
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

function countDocOutProcessing(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutProcessing(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutProcessing(search: $search, userDeptRole: $userDeptRole)
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

function docOutRevoked(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable,
) {
  return useLazyQuery(
    gql`
        query docOutRevoked($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docOutRevoked(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        ${listRevokedDocOutFields}
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

function countDocOutRevoked(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutRevoked(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutRevoked(search: $search, userDeptRole: $userDeptRole)
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

function docOutWaitingIssued(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable,
) {
  return useLazyQuery(
    gql`
        query docOutWaitingIssued($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docOutWaitingIssued(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        isFromOutsidePaper
                        ${listDocOutFieldsWithSigner}
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

function countDocOutWaitingIssued(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutWaitingIssued(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutWaitingIssued(search: $search, userDeptRole: $userDeptRole)
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

function docOutIssued(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable,
) {
  return useLazyQuery(
    gql`
        query docOutIssued($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docOutIssued(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        ${listDocOutFieldsWithBook}
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

function countDocOutIssued(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutIssued(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutIssued(search: $search, userDeptRole: $userDeptRole)
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

function docOutIssuedInDept(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable,
) {
  return useLazyQuery(
    gql`
        query docOutIssuedInDept($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docOutIssuedInDept(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        ${listDocOutFieldsWithBook}
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

function countDocOutIssuedInDept(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutIssuedInDept(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutIssuedInDept(search: $search, userDeptRole: $userDeptRole)
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

function docOutWaitingComments(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable,
) {
  return useLazyQuery(
    gql`
        query docOutWaitingComments($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docOutWaitingComments(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        ${listDocOutFieldsWithComment}
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

function countDocOutWaitingComments(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutWaitingComments(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutWaitingComments(search: $search, userDeptRole: $userDeptRole)
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

function docOutCommented(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable,
) {
  return useLazyQuery(
    gql`
        query docOutCommented($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docOutCommented(search: $search, userDeptRole: $userDeptRole, pageable: $pageable) {
                totalCount
                edges {
                    node {
                        ${listDocOutFieldsWithComment}
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

function countDocOutCommented(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutCommented(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutCommented(search: $search, userDeptRole: $userDeptRole)
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

function countDocOutOverdue(userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
      query countDocOutOverdue($userDeptRole: UserDeptRole!) {
        countDocOutOverdue(userDeptRole: $userDeptRole)
      }
    `,
    { userDeptRole },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function countDocOutDeadline(
  daysBefore: number | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query ($daysBefore: Int, $userDeptRole: UserDeptRole!) {
        countDocOutDeadline(
          daysBefore: $daysBefore
          userDeptRole: $userDeptRole
        )
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

function promulgate() {
  return useMutation(
    gql`
      mutation promulgate($docId: String, $userDeptRole: UserDeptRole) {
        promulgate(docId: $docId, userDeptRole: $userDeptRole)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteDocOut() {
  return useMutation(
    gql`
      mutation deleteDocOut($id: String!, $userDeptRole: UserDeptRole!) {
        deleteDocOut(id: $id, userDeptRole: $userDeptRole)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function canRevokeDocOut(docId: string, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
      query canRevokeDocOut($docId: String, $userDeptRole: UserDeptRole!) {
        canRevokeDocOut(docId: $docId, userDeptRole: $userDeptRole)
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

function canRevokeDocOutLazy(docId: string, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
      query canRevokeDocOut($docId: String, $userDeptRole: UserDeptRole!) {
        canRevokeDocOut(docId: $docId, userDeptRole: $userDeptRole)
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

function getListCanRevokeDocOut(
  docId: string,
  userDeptRole: UserDeptRoleInput,
) {
  return useQuery(
    gql`
      query getListCanRevokeDocOut(
        $docId: String
        $userDeptRole: UserDeptRole!
      ) {
        getListCanRevokeDocOut(docId: $docId, userDeptRole: $userDeptRole) {
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
          ... on OutgoingProcess {
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

function getFilesFromSystemDocOut() {
  return useLazyQuery(
    gql`
      query getFilesFromSystemDocOut($userDeptRole: UserDeptRole!) {
        getFilesFromSystemDocOut(userDeptRole: $userDeptRole) {
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

function findByIdIn(userDeptRole: UserDeptRoleInput, ids: [string]) {
  return useQuery(
    gql`
        query findByIdIn($userDeptRole: UserDeptRole!,$ids: [String]) {
            findByIdIn(userDeptRole: $userDeptRole,ids: $ids){
                ${listDocOutFields}
            }
        }
    `,
    {
      userDeptRole,
      ids,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function searchAllDocOut(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
          query searchAllDocOut($search: DocOutSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
              searchAllDocOut(
                  search: $search
                  userDeptRole: $userDeptRole
                  page: $pageable
              ) {
                  edges {
                      node {
                          ${listDocOutFieldsWithProcessAndBook}
                      }
                  }
                  totalCount
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

function countDocOutWaitingWithPriority(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutWaitingWithPriority(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutWaitingWithPriority(
          search: $search
          userDeptRole: $userDeptRole
        ) {
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

function countDocOutProcessingWithPriority(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutProcessingWithPriority(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutProcessingWithPriority(
          search: $search
          userDeptRole: $userDeptRole
        ) {
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

function countDocOutWaitingCommentsWithPriority(
  search: DocOutSearch | undefined,
  userDeptRole: UserDeptRoleInput,
) {
  return useLazyQuery(
    gql`
      query countDocOutWaitingCommentsWithPriority(
        $search: DocOutSearch
        $userDeptRole: UserDeptRole!
      ) {
        countDocOutWaitingCommentsWithPriority(
          search: $search
          userDeptRole: $userDeptRole
        ) {
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

function getDocOutByUserId(page?: Pageable) {
  return useLazyQuery(
    gql`
          query getAllDocOutByUserId($page:Pageable){
              getAllDocOutByUserId(page:$page){
                  edges{
                      node{
                          processId
                          commentId
                          id
                          quote
                          docCode
                          docDate
                          outGoingAttachments{
                              fileName
                              filePath
                              size
                              fileExtension
                              fullName
                              id
                          }
                      }
                  }
              }
          }
      `, { page: page },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}
export {
  canRevokeDocOut,
  canRevokeDocOutLazy,
  countDocOutCommented,
  countDocOutDeadline,
  countDocOutDrafts,
  countDocOutIssued,
  countDocOutIssuedInDept,
  countDocOutOverdue,
  countDocOutProcessing,
  countDocOutProcessingWithPriority,
  countDocOutRevoked,
  countDocOutWaitingComments,
  countDocOutWaitingCommentsWithPriority,
  countDocOutWaitingIssued,
  countDocOutWaitingProcess,
  countDocOutWaitingWithPriority,
  deleteDocOut,
  docOutCommented,
  docOutDrafts,
  docOutIssued,
  docOutIssuedInDept,
  docOutProcessing,
  docOutRevoked,
  docOutWaitingComments,
  docOutWaitingIssued,
  docOutWaitingProcess,
  findByIdIn,
  findDocOutByIdGraph,
  getDocOutByUserId,
  getFilesFromSystemDocOut,
  getListCanRevokeDocOut,
  promulgate,
  searchAllDocOut,
};
