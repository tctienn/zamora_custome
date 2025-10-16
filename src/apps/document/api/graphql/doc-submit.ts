import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { UserDeptRoleInput } from '@/apps/document/model/doc/doc-in';
import type { DocSubmitSearch } from '@/apps/document/model/doc/search';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';
import type { Pageable } from '@/common/model/query';

const docSubmitListFields = `
  id
  processId
  commentId
  about
  number
  symbol
  year
  editorId
  editorName
  editorDeptId
  editorDeptName
  editorRoleId
  editorRoleName
  toDeptPresentName
  createdTime
  docDate
  dateInput
  status
  flowId
  sendBackType
  
  filePresentation {
    id
    fullName
    fileName
    fileExtension
    size
    filePath
    attachType
  }
  
  filePresentationDocSubmit {
    id
    fullName
    fileName
    fileExtension
    size
    filePath
    attachType
  }
  
  relatedDocuments {
    id
    fullName
    fileName
    fileExtension
    size
    filePath
    attachType
  }
`;

const docSubmitListFieldsWithProcess = `${docSubmitListFields}
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
      readTime
      isComplete
      flowInstanceId
      processType
      stepId
    }
    `;

const docSubmitListFieldsWithComment = `${docSubmitListFields}
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

const fieldsDocSubmit = `
            id
            processId
            commentId
            fileId
            docLocation
            docDate
            docType
            about
            submitToIds
            submitToNames
            workSummary
            proposeOpinion
            fileInclude
            editorId
            editorName
            editorDeptId
            editorRoleId
            opinion1
            opinion2
            opinion3
            opinion4
            opinion5
            opinion6
            status
            isDeleted
            fromDeptPresentId
            fromDeptPresentName
            number
            symbol
            year
            securityCode
            dateInput
            numberSubmissions
            toDeptPresentId
            toDeptPresentName
            flowId
            leaderOpinion
            docOutIds
            createdTime
            createdBy
            isTemporaryFlow
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
                isCaSign
                isDigitalSign
`;

function findDocSubmitById(id: string, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
        query findDocSubmitById($id: String, $userDeptRole: UserDeptRole) {
          findDocSubmitById(id: $id, userDeptRole: $userDeptRole){
            ${fieldsDocSubmit}
            isProcessing
            filePresentation{
                ${fieldsAttachment}
            }
            relatedDocuments{
                ${fieldsAttachment}
            }
            signHistory{
                id
            }
            process {
                id
                flowInstanceId
            }
            questions{
                id
                label
                docId
                orderNumber
                isYesNoQuestion
                options{
                    id
                    label
                    questionId
                    orderNumber
                    otherOpinion
                }
            }
          }
        }
        `
    , {
      id,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function docSubmitDrafts(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput, pageable: Pageable) {
  return useLazyQuery(
    gql`
          query docSubmitDrafts($search: DocSubmitSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docSubmitDrafts(search: $search, userDeptRole: $userDeptRole, pageable: $pageable){
              totalCount
              edges {
                node {
                  ${docSubmitListFields}
                }
              }
            }
          }
          `
    , {
      search,
      userDeptRole,
      pageable
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function canReturnDocSubmit() {
  return useLazyQuery(
    gql`
      query canReturnDocSubmit($userDeptRole: UserDeptRole, $docId: String){
          canReturnDocSubmit(userDeptRole: $userDeptRole, docId: $docId)
      }`
    , {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function docSubmitWaitingProcess(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput,
  isRequiredSignCa = false, isRequiredSignDigital = false, pageable: Pageable) {
  return useLazyQuery(
    gql`
          query docSubmitWaitingProcess($search: DocSubmitSearch, $userDeptRole: UserDeptRole!,
           $isRequiredSignCa: Boolean, $isRequiredSignDigital: Boolean, $pageable: Pageable) {
            docSubmitWaitingProcess(search: $search, userDeptRole: $userDeptRole,isRequiredSignCa: $isRequiredSignCa, 
            isRequiredSignDigital: $isRequiredSignDigital, pageable: $pageable){
              totalCount
              edges {
                node {
                  ${docSubmitListFieldsWithProcess}
                  isDisableButtonFlow
                }
              }
            }
          }
          `
    , {
      search,
      userDeptRole,
      isRequiredSignCa,
      isRequiredSignDigital,
      pageable
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function docSubmitProcessing(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput, pageable: Pageable) {
  return useLazyQuery(
    gql`
          query docSubmitProcessing($search: DocSubmitSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docSubmitProcessing(search: $search, userDeptRole: $userDeptRole, pageable: $pageable){
              totalCount
              edges {
                node {
                  ${docSubmitListFieldsWithProcess}
                }
              }
            }
          }
          `
    , {
      search,
      userDeptRole,
      pageable
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function docSubmitProcessed(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput, pageable: Pageable) {
  return useLazyQuery(
    gql`
          query docSubmitProcessed($search: DocSubmitSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docSubmitProcessed(search: $search, userDeptRole: $userDeptRole, pageable: $pageable){
              totalCount
              edges {
                node {
                  ${docSubmitListFieldsWithProcess}
                }
              }
            }
          }
          `
    , {
      search,
      userDeptRole,
      pageable
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function docSubmitWaitingComment(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput, pageable: Pageable) {
  return useLazyQuery(
    gql`
          query docSubmitWaitingComment($search: DocSubmitSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docSubmitWaitingComment(search: $search, userDeptRole: $userDeptRole, pageable: $pageable){
              totalCount
              edges {
                node {
                  ${docSubmitListFieldsWithComment}
                }
              }
            }
          }
          `
    , {
      search,
      userDeptRole,
      pageable
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function docSubmitCommented(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput, pageable: Pageable) {
  return useLazyQuery(
    gql`
          query docSubmitCommented($search: DocSubmitSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
            docSubmitCommented(search: $search, userDeptRole: $userDeptRole, pageable: $pageable){
              totalCount
              edges {
                node {
                  ${docSubmitListFieldsWithComment}
                }
              }
            }
          }
          `
    , {
      search,
      userDeptRole,
      pageable
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function docSubmitRevoked(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput, pageable: Pageable) {
  return useLazyQuery(
    gql`
            query docSubmitRevoked($search: DocSubmitSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
              docSubmitRevoked(search: $search, userDeptRole: $userDeptRole, pageable: $pageable){
                totalCount
                edges {
                  node {
                  ${docSubmitListFieldsWithProcess}
                  }
                }
              }
            }
            `
    , {
      search,
      userDeptRole,
      pageable
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function countDocSubmitDrafts(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query countDocSubmitDrafts($search: DocSubmitSearch, $userDeptRole: UserDeptRole!) {
            countDocSubmitDrafts(search: $search, userDeptRole: $userDeptRole)
          }
          `
    , {
      search,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function countDocSubmitWaitingProcess(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query countDocSubmitWaitingProcess($search: DocSubmitSearch, $userDeptRole: UserDeptRole!) {
            countDocSubmitWaitingProcess(search: $search, userDeptRole: $userDeptRole)
          }
          `
    , {
      search,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function countDocSubmitProcessing(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query countDocSubmitProcessing($search: DocSubmitSearch, $userDeptRole: UserDeptRole!) {
            countDocSubmitProcessing(search: $search, userDeptRole: $userDeptRole)
          }
          `
    , {
      search,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function countDocSubmitProcessed(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query countDocSubmitProcessed($search: DocSubmitSearch, $userDeptRole: UserDeptRole!) {
            countDocSubmitProcessed(search: $search, userDeptRole: $userDeptRole)
          }
          `
    , {
      search,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function countDocSubmitWaitingComment(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query countDocSubmitWaitingComment($search: DocSubmitSearch, $userDeptRole: UserDeptRole!) {
            countDocSubmitWaitingComment(search: $search, userDeptRole: $userDeptRole)
          }
          `
    , {
      search,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function countDocSubmitCommented(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query countDocSubmitCommented($search: DocSubmitSearch, $userDeptRole: UserDeptRole!) {
            countDocSubmitCommented(search: $search, userDeptRole: $userDeptRole)
          }
          `
    , {
      search,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function countDocSubmitRevoked(search: DocSubmitSearch | undefined, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query countDocSubmitRevoked($search: DocSubmitSearch, $userDeptRole: UserDeptRole!) {
            countDocSubmitRevoked(search: $search, userDeptRole: $userDeptRole)
          }
          `
    , {
      search,
      userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function findAttachmentByRole() {
  return useLazyQuery(
    gql`
        query findAttachmentByRole($userDeptRole: UserDeptRole){
            findAttachmentByRole(userDeptRole: $userDeptRole){
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
                objectType
                status
            }
        }
          `
    , {},
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function deleteDocSubmit() {
  return useMutation(
    gql`
      mutation deleteDocSubmit($id: String) {
        deleteDocSubmit(id: $id)
      }`,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    }
  );
}

function revokeDocSubmitGraphql() {
  return useMutation(
    gql`
          mutation revokeDocSubmit($revokeModelInput:RevokeDocSubmitModel,$userDeptRole:UserDeptRole!) {
              revokeDocSubmit(revokeDocSubmitInput: $revokeModelInput,userDeptRole: $userDeptRole)
          }
      `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function canRevokeDocSubmit(docId: string, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
          query canRevokeDocSubmit($docId:String,$userDeptRole:UserDeptRole!) {
              canRevokeDocSubmit(docId: $docId,userDeptRole: $userDeptRole)
          }
      `,
    {
      docId: docId,
      userDeptRole: userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function canRevokeDocSubmitLazy(docId: string, userDeptRole: UserDeptRoleInput) {
  return useLazyQuery(
    gql`
          query canRevokeDocSubmit($docId:String,$userDeptRole:UserDeptRole!) {
              canRevokeDocSubmit(docId: $docId,userDeptRole: $userDeptRole)
          }
      `,
    {
      docId: docId,
      userDeptRole: userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function listRevokeDocSubmitGraphql(docId: string, userDeptRole: UserDeptRoleInput) {
  return useQuery(
    gql`
          query listRevokeDocSubmit($docId:String,$userDeptRole:UserDeptRole!) {
              listRevokeDocSubmit(docId: $docId,userDeptRole: $userDeptRole){
                  ...on DocSubmitProcess{
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
                  ...on Comment{
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
              }
          }
      `, {
      docId: docId,
      userDeptRole: userDeptRole
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export function searchAllDocSubmit(
  search: DocSubmitSearch | undefined,
  userDeptRole: UserDeptRoleInput,
  pageable: Pageable | undefined,
) {
  return useLazyQuery(
    gql`
          query searchAllDocSubmit($search: DocSubmitSearch, $userDeptRole: UserDeptRole!, $pageable: Pageable) {
              searchAllDocSubmit(
                  search: $search
                  userDeptRole: $userDeptRole
                  page: $pageable
              ) {
                  edges {
                      node {
                          ${docSubmitListFieldsWithProcess}
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

export {
  canReturnDocSubmit,
  canRevokeDocSubmit,
  canRevokeDocSubmitLazy,
  countDocSubmitCommented,
  countDocSubmitDrafts,
  countDocSubmitProcessed,
  countDocSubmitProcessing,
  countDocSubmitRevoked,
  countDocSubmitWaitingComment,
  countDocSubmitWaitingProcess,
  deleteDocSubmit,
  docSubmitCommented,
  docSubmitDrafts,
  docSubmitProcessed,
  docSubmitProcessing,
  docSubmitRevoked,
  docSubmitWaitingComment,
  docSubmitWaitingProcess,
  findAttachmentByRole,
  findDocSubmitById,
  listRevokeDocSubmitGraphql,
  revokeDocSubmitGraphql
};
