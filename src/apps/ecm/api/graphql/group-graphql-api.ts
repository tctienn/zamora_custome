import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ECM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getGroupGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
            query ($keyword: String, $pageable: Pageable) {
                getGroups(keyword: $keyword, pageable: $pageable) {
                    totalCount
                    edges {
                        node {
                            id
                            name
                            description
                            createDate
                            isDelete
                            status
                            groupType
                            avatar
                            typeOfPrivacy
                            users {
                                id
                                level
                                fullName
                                email
                                groupId
                            }
                        }
                    }
                }
            }
        `, { ...data },
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getGroupsForConfigGraphql(data: { keyword: string, pageable: object }) {
  return useQuery(
    gql`
            query ($keyword: String, $pageable: Pageable) {
                getGroupsForConfig(keyword: $keyword, pageable: $pageable) {
                    totalCount
                    edges {
                        node {
                            id
                            name
                            description
                            createDate
                            isDelete
                            status
                            groupType
                            avatar
                            typeOfPrivacy
                            groupLeaderId
                            users {
                                id
                                level
                                fullName
                                email
                                groupId
                            }
                        }
                    }
                }
            }
        `, { ...data },
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getGroupsForUser() {
  return useQuery(
    gql`
            {
                getGroupsForUser {
                    id
                    name
                    permission
                }
            }`
  );
}

function deleteGroupGraphql() {
  return useMutation(
    gql`
            mutation ($id: String!) {
                deleteGroup(id: $id) {
                    id,
                    name
                    description
                    createDate
                    isDelete
                    status
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function lockGroupGraphql() {
  return useMutation(
    gql`
            mutation ($id: String!) {
                lockOrUnlockGroup(id: $id) {
                    id,
                    name
                    description
                    createDate
                    isDelete
                    status
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function updateGroupGraphql() {
  return useMutation(
    gql`
            mutation ($id:String, $userGroupInput:UserGroupInputUpdate) {
                updateGroup(id:$id, userGroupInput: $userGroupInput) {
                    id
                    name
                    description
                    status
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function getGroup(id: string) {
  return useQuery(
    gql`
            query($id: String) {
                getGroup(id: $id) {
                    id,
                    name
                    description
                    createDate
                    isDelete
                    status
                    groupType
                    users {
                        id
                        level
                        fullName
                        email
                        groupId
                    }
                }
            }
        `, { id }
    , {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function decentralizationUser() {
  return useMutation(
    gql`
            mutation ($id: String!, $userList: [UserLevelInput]!) {
                decentralizationUser(id: $id, userList: $userList) {
                    id
                    users {
                        id
                        level
                        fullName
                        email
                        groupId
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function allGroups() {
  return useQuery(
    gql`
            {
                allGroups {
                    id,
                    name
                }
            }`,
    {},
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getEcmGroupUserInGraphql() {
  return useQuery(
    gql`
            query {
                groupUserIn {
                    id
                    name
                    description
                    createDate
                    groupType
                    status
                    avatar
                    groupLeaderId
                    typeOfPrivacy
                    users {
                        id
                        level
                        fullName
                        email
                        groupId
                    }
                    typeOfPrivacy
                    favoriteUserList{
                        id
                        name
                        email
                    }
                }
            }`, {},
    {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

const groupNoteColumns = [
  'id',
  'creatorId',
  'creator',
  'createdAt',
  'content',
  'pinned',
  'isDeleted',
].join(' ');

const groupTopicColumns = [
  'id',
  'creatorId',
  'creator',
  'createdAt',
  'name',
  'isDeleted',
].join(' ');

function getEcmGroupGraphql(groupId: string) {
  return useQuery(
    gql`
            query($groupId: String!) {
                ecmGroup(groupId: $groupId) {
                    id
                    name
                    description
                    createDate
                    status
                    groupType
                    users {
                        id
                        level
                        fullName
                        email
                        avatar
                    }
                }
            }
        `, { groupId }
    , {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getGroupById(groupId: string) {
  return useQuery(
    gql`
            query($groupId: String  ) {
                getGroupById(groupId: $groupId) {
                    id
                    name
                    description
                    createDate
                    status
                    groupType
                    users {
                        id
                        level
                        fullName
                        email
                        groupId
                    }
                }
            }
        `, { groupId }
    , {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getEcmGroupNotesGraphql(groupId: string) {
  return useQuery(
    gql`
            query($groupId: String!) {
                ecmGroupNotes(groupId: $groupId) {
                    ${groupNoteColumns}
                }
            }
        `, { groupId }
    , {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveEcmGroupNoteGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupNote: GroupNoteInput!) {
                saveEcmGroupNote(groupId: $groupId, groupNote: $groupNote) {
                    id
                    notes {
                        ${groupNoteColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function pinEcmGroupNoteGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupNoteId: String!) {
                pinEcmGroupNote(groupId: $groupId, groupNoteId: $groupNoteId) {
                    id
                    notes {
                        ${groupNoteColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function unpinEcmGroupNoteGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupNoteId: String!) {
                unpinEcmGroupNote(groupId: $groupId, groupNoteId: $groupNoteId) {
                    id
                    notes {
                        ${groupNoteColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function deleteEcmGroupNoteGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupNoteId: String!) {
                deleteEcmGroupNote(groupId: $groupId, groupNoteId: $groupNoteId) {
                    id
                    notes {
                        ${groupNoteColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function restoreEcmGroupNoteGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupNoteId: String!) {
                restoreEcmGroupNote(groupId: $groupId, groupNoteId: $groupNoteId) {
                    id
                    notes {
                        ${groupNoteColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function removeEcmGroupNoteGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupNoteId: String!) {
                removeEcmGroupNote(groupId: $groupId, groupNoteId: $groupNoteId) {
                    id
                    notes {
                        ${groupNoteColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function getEcmGroupTopicsGraphql(groupId: string) {
  return useQuery(
    gql`
            query($groupId: String!) {
                ecmGroupTopics(groupId: $groupId) {
                    ${groupTopicColumns}
                }
            }
        `, { groupId }
    , {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveEcmGroupTopicGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupTopic: GroupTopicInput!) {
                saveEcmGroupTopic(groupId: $groupId, groupTopic: $groupTopic) {
                    id
                    topics {
                        ${groupTopicColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function deleteEcmGroupTopicGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupTopicId: String!) {
                deleteEcmGroupTopic(groupId: $groupId, groupTopicId: $groupTopicId) {
                    id
                    topics {
                        ${groupTopicColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function restoreEcmGroupTopicGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupTopicId: String!) {
                restoreEcmGroupTopic(groupId: $groupId, groupTopicId: $groupTopicId) {
                    id
                    topics {
                        ${groupTopicColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function removeEcmGroupTopicGraphql() {
  return useMutation(
    gql`
            mutation ($groupId: String!, $groupTopicId: String!) {
                removeEcmGroupTopic(groupId: $groupId, groupTopicId: $groupTopicId) {
                    id
                    topics {
                        ${groupTopicColumns}
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function joinGroup() {
  return useMutation(
    gql`
            mutation joinGroup($groupId: String){
                joinGroup(groupId: $groupId)
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function getAllGroup() {
  return useQuery(
    gql`
            query getAllGroup{
                getAllGroup{
                    id
                    name
                }
            }
        `,
    {},
    { clientId: ECM_CLIENT_ID }
  );
}

function getEcmGroupTopicCommentsGraphql(data: { topicId: string, pageable: object }) {
  return useLazyQuery(
    gql`
            query($topicId: String!, $pageable: Pageable) {
                ecmGroupTopicComments(topicId: $topicId, pageable: $pageable) {
                    totalCount
                    edges {
                        node {
                            id
                            topicId
                            content
                            senderId
                            sentAt
                            avatar
                            sender
                        }
                    }
                }
            }
        `, { ...data }
    , {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveEcmGroupTopicCommentGraphql() {
  return useMutation(
    gql`
            mutation ($topicId: String!, $groupTopicComment: GroupTopicCommentInput!) {
                saveEcmGroupTopicComment(topicId: $topicId, groupTopicComment: $groupTopicComment) {
                    id
                    topicId
                    content
                    senderId
                    sentAt
                    avatar
                    sender
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function likeOrDislikeGroup() {
  return useMutation(
    gql`
            mutation likeOrDislike($groupId: String){
                likeOrDislikeGroup(groupId: $groupId){
                    id
                    name
                    favoriteUserList{
                        id
                        name
                        email
                    }
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function getGroupDashboard(total: number) {
  return useQuery(
    gql`
            query getGroupDashboard($total: Int){
                getGroupDashboard(total: $total){
                    totalAllGroup
                    totalFavoriteGroup
                    allGroup{
                        id
                        name
                        avatar
                        totalDocument
                        users{
                            id
                            fullName
                            email
                            level
                            groupId
                        }
                    }
                    favoriteGroup{
                        id
                        name
                        avatar
                        totalDocument
                        users{
                            id
                            fullName
                            email
                            level
                            groupId
                        }
                    }
                }
            }
        `, { total }, {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getCommentFilesGraphql(data: { fileId: string, pageable: object }) {
  return useLazyQuery(
    gql`
            query($fileId: String!, $pageable: Pageable) {
                getCommentFiles(fileId: $fileId, pageable: $pageable) {
                    totalCount
                    edges {
                        node {
                            id
                            fileId
                            content
                            senderId
                            sentAt
                            avatar
                            sender
                        }
                    }
                }
            }
        `, { ...data }
    , {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function saveCommentFileGraphql() {
  return useMutation(
    gql`
            mutation ($fileId: String!, $groupCommentFileInput: GroupCommentFileInput!) {
                saveCommentFile(fileId: $fileId, groupCommentFileInput: $groupCommentFileInput) {
                    id
                    fileId
                    content
                    senderId
                    sentAt
                    avatar
                    sender
                }
            }
        `, { clientId: ECM_CLIENT_ID }
  );
}

function getUserGroupInfoGraphql(data: { groupId: string, userId: string }) {
  return useQuery(
    gql`
            query getUserGroupInfo($groupId: String, $userId: String){
                getUserGroupInfo(groupId: $groupId, userId: $userId){
                    id
                    name
                    userId
                    username
                    email
                    fullName
                    birthDay
                    avatar
                    phone
                    roles
                }
            }
        `, { ...data }
    , {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

function getListUser(groupId: string) {
  return useQuery(
    gql`
            query getListUser($groupId: String){
                getListUser(groupId: $groupId){
                    groupId
                    groupName
                    groupStatus
                    groupType
                    groupDescription
                    users{
                        userId
                        userName
                        userLevel
                        userFullName
                        userAvatar
                        userEmail
                    }
                }
            }
        `, { groupId }
    , {
      clientId: ECM_CLIENT_ID,
      fetchPolicy: 'network-only'
    }
  );
}

export {
  allGroups,
  decentralizationUser,
  deleteEcmGroupNoteGraphql,
  deleteEcmGroupTopicGraphql,
  deleteGroupGraphql,
  getAllGroup,
  getCommentFilesGraphql,
  getEcmGroupGraphql,
  getEcmGroupNotesGraphql,
  getEcmGroupTopicCommentsGraphql,
  getEcmGroupTopicsGraphql,
  getEcmGroupUserInGraphql,
  getGroup,
  getGroupById,
  getGroupDashboard,
  getGroupGraphql,
  getGroupsForConfigGraphql,
  getGroupsForUser,
  getListUser,
  getUserGroupInfoGraphql,
  joinGroup,
  likeOrDislikeGroup,
  lockGroupGraphql,
  pinEcmGroupNoteGraphql,
  removeEcmGroupNoteGraphql,
  removeEcmGroupTopicGraphql,
  restoreEcmGroupNoteGraphql,
  restoreEcmGroupTopicGraphql,
  saveCommentFileGraphql,
  saveEcmGroupNoteGraphql,
  saveEcmGroupTopicCommentGraphql,
  saveEcmGroupTopicGraphql,
  unpinEcmGroupNoteGraphql,
  updateGroupGraphql
};
