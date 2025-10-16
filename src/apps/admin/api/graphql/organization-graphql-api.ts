import { useLazyQuery, useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import type { Ref } from 'vue';

import type { 
  CountDirectChildrenUsersByCodeQueryResult, 
  CountDirectChildrenUsersByCodeResult,
  FilterOrganizationsVariables 
} from '@/apps/admin/model/organization';
import { ADMIN_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function getOrganizationGraphql(data: { keyword: string; pageable: object }) {
  return useQuery(
    gql`
        query ($keyword: String, $pageable: Pageable) {
            organizations(keyword: $keyword, pageable: $pageable) {
                edges {
                    node {
                        id
                        code
                        name
                        description
                        parentCode
                        status
                        type
                        manager
                        effectiveDate
                        expirationDate
                        fileAttach
                    }
                }
                totalCount
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

function getAllOrganizationGraphql() {
  return useQuery(
    gql`
        query {
            allOrganizationPublic {
                id
                code
                name
                parentCode
                description
                status
                type
                manager
                effectiveDate
                expirationDate
                fileAttach
                users {
                    id
                    email
                    fullName
                    username
                    avatar
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

function allOrganizationCountSubOrgPublic() {
  return useQuery(
    gql`
      query allOrganizationCountSubOrgPublic{
          allOrganizationCountSubOrgPublic{
            id
            code
            name
            description
            status
            parentCode
            type
            order
            totalUsers
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

function allOrganizationGraphql() {
  return useQuery(
    gql`
        query {
            allOrganization {
                id
                code
                name
                parentCode
                description
                status
                type
                manager
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

function getListOrganizationIsDeleteFalseGraphql() {
  return useQuery(
    gql`
        query {
            getListOrganizationIsDeleteFalse {
                id
                code
                name
                parentCode
                description
                status
                type
                manager
                effectiveDate
                expirationDate
                fileAttach
                logo
                order
                acronym
                businessRegisAddress
                workAddress
                representative
                dateOfEstablishment
                decisionNumber
                decisionDate
                businessRegisNumber
                taxCode
                telephoneNumber
                fax
                website
                email
                tags
                isAudioCall
                isVideoCall
                numberSign
                users {
                    id
                    email
                    fullName
                    username
                    avatar
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

function getAllOrganizationPublicGraphql() {
  return useQuery(
    gql`
        query {
            allOrganizationPublic {
                code
                name
                type
                status
                parentCode
                id
                tags
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

function getLazyAllOrganizationPublicGraphql() {
  return useLazyQuery(
    gql`
        query {
            allOrganizationPublic {
                code
                name
                parentCode
                id
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

function saveOrganizationGraphql() {
  return useMutation(
    gql`
        mutation ($id: String!, $organizationInput: OrganizationInput!) {
            saveOrganization(id: $id, organizationInput: $organizationInput) {
                id
                code
                name
                parentCode
                description
                status
            }
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function organizationGraphql(code: string) {
  return useQuery(
    gql`
      query organization($code: String!){
              organization(code: $code){
              id
              code
              name
              description
              status
              parentCode
              type
              manager
              effectiveDate
              expirationDate
              fileAttach
              logo
              order
              acronym
              businessRegisAddress
              workAddress
              representative
              dateOfEstablishment
              decisionNumber
              decisionDate
              businessRegisNumber
              taxCode
              telephoneNumber
              fax
              website
              email
              tags
              isVideoCall
              isAudioCall
              }
          }
    `, { code },
    { clientId: ADMIN_CLIENT_ID },
  );
}

function saveTags() {
  return useMutation(
    gql`
        mutation saveTags($organizationId: String, $tags: [String]) {
            saveTags(organizationId: $organizationId, tags: $tags)
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function deleteOrganizationGraphql() {
  return useMutation(
    gql`
        mutation ($id: String!) {
            deleteOrganization(id: $id) {
                id
                code
                name
                parentCode
                description
                status
            }
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function addUserIntoOrganization() {
  return useMutation(
    gql`
        mutation addUserIntoOrganization(
            $id: String!
            $users: [UserOrganizationInput]
        ) {
            addUserIntoOrganization(id: $id, users: $users) {
                code
                description
                id
                name
            }
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function getUsersInOrganization(organizationId: string) {
  return useQuery(
    gql`
        query getUsersInOrganization($organizationId: String) {
            getUsersInOrganization(organizationId: $organizationId) {
                id
                code
                name
                description
                status
                parentCode
                isDeleted
                type
                manager
                effectiveDate
                expirationDate
                fileAttach
                usersMoreInfo {
                    id
                    fullName
                    username
                    email
                    avatar
                    birthDay
                    phone
                    positionName
                    employeeId
                }
            }
        }
    `,
    { organizationId },
    {
      clientId: ADMIN_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllOrganizationWithUserMoreInfoGraphql() {
  return useQuery(
    gql`
        query {
            getAllOrganizationWithUserMoreInfo {
                id
                code
                name
                parentCode
                description
                status
                type
                manager
                effectiveDate
                expirationDate
                fileAttach
                usersMoreInfo {
                    id
                    fullName
                    username
                    email
                    avatar
                    birthDay
                    phone
                    positionName
                    employeeId
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

function getRootGraphql() {
  return useQuery(
    gql`
        query getRoot{
            getRoot{
                id
                name
                code
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

function addUserIntoOrganizationGraphql() {
  return useMutation(
    gql`
        mutation addUserIntoOrganization(
            $id: String!
            $users: [UserOrganizationInput]
        ) {
            addUserIntoOrganization(id: $id, users: $users) {
                id
                users {
                    id
                    fullName
                    email
                }
                name
            }
        }
    `,
    { clientId: ADMIN_CLIENT_ID },
  );
}

function getOrganizationByIdGraphql(organizationId: string) {
  return useQuery(
    gql`
        query getOrganizationById($organizationId: String) {
            getOrganizationById(organizationId: $organizationId) {
                id
                name
                code
                description
                users {
                    id
                    fullName
                    email
                }
            }
        }
    `,
    { organizationId },
    {
      fetchPolicy: 'network-only',
      clientId: ADMIN_CLIENT_ID,
    },
  );
}

function organizationByStatusGraphql() {
  return useQuery(
    gql`
        query {
            organizationByStatus {
                id
                code
                name
                parentCode
                description
                status
                users {
                    id
                }
            }
        }
    `,
    {},
    {
      fetchPolicy: 'network-only',
      clientId: ADMIN_CLIENT_ID,
    },
  );
}

function getUsersByRoleAndByOrganizationId() {
  return useLazyQuery(
    gql`
        query getUsersByRoleAndByOrganizationId(
            $organizationId: String!
            $role: String!
        ) {
            getUsersByRoleAndByOrganizationId(
                organizationId: $organizationId
                role: $role
            ) {
                id
                username
                email
                fullName
                birthDay
                avatar
                mainSign
                flashingSignature
                gender
                locked
                createDate
                phone
                roles
                simCa
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

function findByUsersIdGraphql(userId: string) {
  return useQuery(
    gql`
        query findByUsersId($userId: String){
            findByUsersId(userId: $userId) {
                id
                code
                name
                parentCode
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

function filterOrganizations(data: FilterOrganizationsVariables) {
  return useQuery(
    gql`
        query FilterOrganizations($code: String, $type: String, $parentCode: String) {
            filterOrganizations(code: $code, type: $type, parentCode: $parentCode) {
                id
                code
                name
                description
                status
                parentCode
                isDeleted
                type
                manager
                effectiveDate
                expirationDate
                fileAttach
                logo
                order
                acronym
                businessRegisAddress
                workAddress
                representative
                dateOfEstablishment
                decisionNumber
                decisionDate
                businessRegisNumber
                taxCode
                telephoneNumber
                fax
                website
                email
                tags
                isVideoCall
                isAudioCall
                numberSign
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

export {
  addUserIntoOrganization,
  addUserIntoOrganizationGraphql,
  allOrganizationCountSubOrgPublic,
  allOrganizationGraphql,
  deleteOrganizationGraphql,
  filterOrganizations,
  findByUsersIdGraphql,
  getAllOrganizationGraphql,
  getAllOrganizationPublicGraphql,
  getAllOrganizationWithUserMoreInfoGraphql,
  getLazyAllOrganizationPublicGraphql,
  getListOrganizationIsDeleteFalseGraphql,
  getOrganizationByIdGraphql,
  getOrganizationGraphql,
  getRootGraphql,
  getUsersByRoleAndByOrganizationId,
  getUsersInOrganization,
  organizationByStatusGraphql,
  organizationGraphql,
  saveOrganizationGraphql,
  saveTags
};
