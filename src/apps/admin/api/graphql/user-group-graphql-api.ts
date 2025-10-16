import { useLazyQuery, useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function getUserGroupGraphql(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
      query ($keyword: String, $pageable: Pageable) {
        getUserGroups(keyword: $keyword, pageable: $pageable) {
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
              typeOfPrivacy
              groupLeaderId
              avatar
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
    `,
    { ...data },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function addUserToUserGroup() {
  return useMutation(
    gql`
      mutation ($id: String!, $userList: [UserLevelInput]!) {
        addUserToUserGroup(id: $id, userList: $userList) {
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
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function changePassword() {
  return useMutation(
    gql`
      mutation ($id: String!, $rawPassword: String!) {
        changePassword(id: $id, rawPassword: $rawPassword) {
          id
        }
      }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function deleteUserGroupGraphql() {
  return useMutation(
    gql`
      mutation ($id: String!) {
        deleteUserGroup(id: $id) {
          id
          name
          description
          createDate
          isDelete
          status
        }
      }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function updateUserGroupGraphql() {
  return useMutation(
    gql`
      mutation ($id: String, $userGroupInput: UserGroupInputUpdate) {
        updateUserGroup(id: $id, userGroupInput: $userGroupInput) {
          id
          name
          description
          status
        }
      }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function lockUserGroupGraphql() {
  return useMutation(
    gql`
      mutation ($id: String!) {
        lockOrUnlockUserGroup(id: $id) {
          id
          name
          description
          createDate
          isDelete
          status
        }
      }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function deleteUseInUserGroupGraphql() {
  return useMutation(
    gql`
      mutation ($id: String!, $userId: String!) {
        removeUserFromUserGroup(id: $id, userId: $userId) {
          id
          name
          description
          createDate
          isDelete
          status
        }
      }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function getUserGroup() {
  return useLazyQuery(
    gql`
      query ($id: String) {
        getUserGroup(id: $id) {
          id
          name
          description
          createDate
          isDelete
          status
          groupType
          typeOfPrivacy
          users {
            id
            level
            fullName
            email
          }
        }
      }
    `,
    {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllGroup() {
  return useQuery(
    gql`
      query getAllGroup {
        getAllGroup {
          id
          groupType
          createDate
          description
          isDelete
          name
          status
          typeOfPrivacy
        }
      }
    `,
    {},
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  addUserToUserGroup,
  changePassword,
  deleteUseInUserGroupGraphql,
  deleteUserGroupGraphql,
  getAllGroup,
  getUserGroup,
  getUserGroupGraphql,
  lockUserGroupGraphql,
  updateUserGroupGraphql,
};
