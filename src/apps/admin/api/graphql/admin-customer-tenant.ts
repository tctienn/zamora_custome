import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { ADMIN_CLIENT_ID, DOCUMENT_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function getUserGraphql(data: {
  fullName: string;
  username: string;
  email: string;
  page: number;
  size: number;
  property: string;
  direction: string;
}) {
  return useQuery(
    gql`
        query (
            $fullName: String!
            $username: String!
            $email: String!
            $page: Int!
            $size: Int!
            $property: String!
            $direction: Direction
        ) {
            users(
                userFilter: {
                    fullName: $fullName
                    username: $username
                    email: $email
                }
                pageable: {
                    page: $page
                    size: $size
                    sort: [{ property: $property, direction: $direction }]
                }
            ) {
                totalCount
                edges {
                    node {
                        id
                        username
                        email
                        fullName
                        phone
                    }
                }
            }
        }
    `,
    { ...data },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'cache-and-network',
    },
  );
}

function getAllUserGraphql(data: {
  keyword: string;
  organization: string;
  pageable: object;
}) {
  return useQuery(
    gql`
        query getAllUser(
            $keyword: String
            $organization: String
            $pageable: Pageable
        ) {
            getAllUser(
                keyword: $keyword
                organization: $organization
                pageable: $pageable
            ) {
                totalCount
                edges {
                    node {
                        id
                        username
                        fullName
                        email
                        phone
                        locked
                        roles
                        avatar
                        organizationOrder
                        organizationCode
                        organizationName
                        organizationId
                        mainSign
                        flashingSignature
                        createDate
                        simCa
                        position
                        birthDay
                        gender
                        positionName
                        positionCode
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

function getUserByOrg(data: {
  keyword: string;
  organization: string;
  pageable: object;
}) {
  return useQuery(
    gql`
        query getUserByOrg(
            $keyword: String
            $organization: String
            $pageable: Pageable
        ) {
            getUserByOrg(
                keyword: $keyword
                organization: $organization
                pageable: $pageable
            ) {
                totalCount
                edges {
                    node {
                        id
                        username
                        fullName
                        email
                        phone
                        locked
                        roles
                        avatar
                        organizationOrder
                        organizationCode
                        organizationName
                        organizationId
                        mainSign
                        flashingSignature
                        createDate
                        simCa
                        position
                        birthDay
                        gender
                        positionName
                        positionCode
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

function getAllUserNotAdminGraphql(data: {
  keyword: string;
  organization: string;
  pageable: object;
}) {
  return useQuery(
    gql`
        query getAllUserNotAdmin(
            $keyword: String
            $organization: String
            $pageable: Pageable
        ) {
            getAllUserNotAdmin(
                keyword: $keyword
                organization: $organization
                pageable: $pageable
            ) {
                totalCount
                edges {
                    node {
                        id
                        username
                        fullName
                        email
                        phone
                        locked
                        roles
                        avatar
                        organizationOrder
                        organizationCode
                        organizationName
                        organizationId
                        mainSign
                        flashingSignature
                        createDate
                        simCa
                        position
                        birthDay
                        gender
                        positionName
                        positionCode
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

function createUserGraphql() {
  return useMutation(
    gql`
        mutation ($userInput: UserInput!) {
            createUser(userInput: $userInput) {
                id
                username
                email
                fullName
                phone
            }
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function getFormatEmail() {
  return useQuery(
    gql`
        query getFormatEmail{
            getFormatEmail
        }
    `,
    {},
    { clientId: ADMIN_CLIENT_ID }
  );
}

function deleteUserGraphql() {
  return useMutation(
    gql`
        mutation deleteUser($id: String!) {
            deleteUser(id: $id) {
                id
                username
            }
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function lockOrUnlockGraphql() {
  return useMutation(
    gql`
        mutation lockOrUnlock($id: String!) {
            lockOrUnlock(id: $id) {
                id
                username
                email
                fullName
                phone
            }
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function resetPasswordGraphql() {
  return useMutation(
    gql`
        mutation resetPassword($id: String!) {
            resetPassword(id: $id) {
                id
                username
            }
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function getAllUserStatusActive() {
  return useQuery(
    gql`
        query getAllUserStatusActive {
            getAllUserStatusActive {
                username
                avatar
                birthDay
                email
                fullName
                id
                phone
                locked
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

function findPersonal() {
  return useQuery(
    gql`
        query findPersonal {
            findPersonal {
                id
                fullName
                username
                phone
                email
                avatar
                birthDay
                mainSign
                flashingSignature
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

function currentUser() {
  return useQuery(
    gql`
        query currentUser {
            currentUser {
                roles
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

function changePasswordInProfile() {
  return useMutation(
    gql`
        mutation change($oldPassword: String!, $newPassword: String!) {
            changePasswordInProfile(
                oldPassword: $oldPassword
                newPassword: $newPassword
            ) {
                id
                username
                fullName
            }
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function getAllUserServicePublic() {
  return useQuery(
    gql`
        query getAllUserServicePublic {
            getAllUserServicePublic {
                username
                email
                fullName
                id
                locked
                roles
                position
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

function getUsersByRoleTroLy() {
  return useQuery(
    gql`
        query findByRoleTroLy {
            findByRoleTroLy {
                id
                fullName
                username
                email
                positionName
                organizationId
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

function getUsersByRole(role: string) {
  return useQuery(
    gql`
        query findByRole($role: String) {
            findByRole(role: $role) {
                id
                fullName
                username
                email
                positionName
            }
        }
    `,
    { role },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllUserMoreInfoGraphql() {
  return useQuery(
    gql`
        query {
            getAllUserMoreInfo {
                id
                fullName
                username
                email
                avatar
                birthDay
                phone
                positionName
                employeeId
                departments {
                    code
                    name
                    id
                }
                roles
                gender
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

function getAllUserMoreInfoNotAdminGraphql() {
  return useQuery(
    gql`
        query {
            getAllUserMoreInfoNotAdmin {
                id
                fullName
                username
                email
                avatar
                birthDay
                phone
                positionName
                employeeId
                departments {
                    code
                    name
                    id
                }
                roles
                gender
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

function getAllUserMoreInfoNotCurrentUserGraphql() {
  return useQuery(
    gql`
        query {
            getAllUserMoreInfoNotCurrentUser {
                id
                fullName
                username
                email
                avatar
                birthDay
                phone
                positionName
                employeeId
                departments {
                    code
                    name
                    id
                }
                roles
                gender
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

function getUserCacheGraphql(userId: string) {
  return useQuery(
    gql`
        query ($userId: String) {
            getUserCache(userId: $userId) {
                id
                fullName
                username
                email
                avatar
                birthDay
                gender
                phone
                positionName
                employeeId
                departments {
                    id
                    code
                    name
                }
                roles
            }
        }
    `,
    { userId },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveUserSupport() {
  return useMutation(
    gql`
        mutation saveUserSupport($userSupport: UserSupportModel) {
            saveUserSupport(userSupport: $userSupport) {
                id
                userId
                userSupportId
                supportType
                supportPermission
                deptId
                roleId
                orgType
            }
        }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveListUserSupport() {
  return useMutation(
    gql`
        mutation saveListUserSupport(
            $userId: String
            $userSupportList: String
            $orgType: OrganizationType
            $roleId: String
            $deptId: [String]
        ) {
            saveListUserSupport(
                userId: $userId
                userSupportList: $userSupportList
                orgType: $orgType
                roleId: $roleId
                deptId: $deptId
            )
        }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveGeneralPermission() {
  return useMutation(
    gql`
        mutation saveGeneralPermission(
            $userId: String
            $supportsPermission: String
            $deptId: String
        ) {
            saveGeneralPermission(
                userId: $userId
                supportsPermission: $supportsPermission
                deptId: $deptId
            )
        }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getUserSupportByUserId(id: string, deptId: string) {
  return useQuery(
    gql`
        query getUserSupportByUserIdAndDeptId($id: String, $deptId: String) {
            getUserSupportByUserIdAndDeptId(id: $id, deptId: $deptId) {
                id
                userId
                userSupportId
                deptId
                roleId
                orgType
                supportPermission
                supportsPermission
            }
        }
    `,
    {
      id,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getUserSupportByUserIdAndUserSupportId(
  userId: string,
  userSupportId: string,
  deptId: string,
) {
  return useLazyQuery(
    gql`
        query getUserSupportByUserIdAndUserSupportIdAndDeptId(
            $userId: String
            $userSupportId: String
            $deptId: String
        ) {
            getUserSupportByUserIdAndUserSupportIdAndDeptId(
                userId: $userId
                userSupportId: $userSupportId
                deptId: $deptId
            ) {
                id
                userId
                userSupportId
                supportType
                supportPermission
            }
        }
    `,
    {
      userId,
      userSupportId,
      deptId,
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteUserSupport() {
  return useMutation(
    gql`
        mutation deleteUserSupport(
            $userId: String
            $userSupportId: String
            $deptId: String
        ) {
            deleteUserSupport(
                userId: $userId
                userSupportId: $userSupportId
                deptId: $deptId
            ) {
                id
            }
        }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllUserPublicServiceFullField() {
  return useQuery(
    gql`
        query getAllUserPublicServiceFullField {
            getAllUserPublicServiceFullField {
                id
                username
                fullName
                email
                phone
                locked
                roles
                avatar
                organizationCode
                organizationName
                organizationId
                mainSign
                flashingSignature
                createDate
                simCa
                position
                birthDay
                gender
                positionName
                positionCode
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

function getAllDelegatesByFromUser(id: string) {
  return useQuery(
    gql`
        query getAllDelegatesByFromUser($id: String) {
            getAllDelegatesByFromUser(id: $id) {
                id
                fromUser
                toUser
                fromDate
                toDate
                note
                status
            }
        }
    `,
    { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findDelegateInfoById(id: string) {
  return useQuery(
    gql`
        query findDelegateInfoById($id: String) {
            findDelegateInfoById(id: $id) {
                id
                fromUser
                toUser
                delegateObjectType {
                    roleCode
                    roleName
                    deptId
                    appPermission
                }
                fromDate
                toDate
                note
                status
            }
        }
    `,
    { id },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getPersonalSettingByUserId(userId: string) {
  return useQuery(
    gql`
        query getPersonalSettingByUserId($userId: String) {
            getPersonalSettingByUserId(userId: $userId) {
                id
                userId
                showBirthday
                showOnlyDate
                showPhoneNumber
                showEmail
                allowNotification
            }
        }
    `,
    { userId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveDelegateInfo() {
  return useMutation(
    gql`
        mutation saveDelegateInfo($delegateInfo: DelegateInfoModel) {
            saveDelegateInfo(delegateInfo: $delegateInfo)
        }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function savePersonalSetting() {
  return useMutation(
    gql`
        mutation savePersonalSetting($personalSetting: PersonalSettingInput) {
            savePersonalSetting(personalSetting: $personalSetting)
        }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  changePasswordInProfile,
  createUserGraphql,
  currentUser,
  deleteUserGraphql,
  deleteUserSupport,
  findDelegateInfoById,
  findPersonal,
  getAllDelegatesByFromUser,
  getAllUserGraphql,
  getAllUserMoreInfoGraphql,
  getAllUserMoreInfoNotAdminGraphql,
  getAllUserMoreInfoNotCurrentUserGraphql,
  getAllUserNotAdminGraphql,
  getAllUserPublicServiceFullField,
  getAllUserServicePublic,
  getAllUserStatusActive,
  getFormatEmail,
  getPersonalSettingByUserId,
  getUserByOrg,
  getUserCacheGraphql,
  getUserGraphql,
  getUsersByRole,
  getUsersByRoleTroLy,
  getUserSupportByUserId,
  getUserSupportByUserIdAndUserSupportId,
  lockOrUnlockGraphql,
  resetPasswordGraphql,
  saveDelegateInfo,
  saveGeneralPermission,
  saveListUserSupport,
  savePersonalSetting,
  saveUserSupport
};
