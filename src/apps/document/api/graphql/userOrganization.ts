import { useLazyQuery, useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { OrganizationType } from '@/apps/document/model/organization';
import { DOCUMENT_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function findByOrganizationIdGraphql(
  organizationId: string | null | undefined,
) {
  return useQuery(
    gql`
      query findByOrganizationId($organizationId: String) {
        findByOrganizationId(organizationId: $organizationId) {
          id
          organizationId
          userId
          isDeleted
          position
          isConcurrently
          createdTime
          createdBy
          fullName
          gender
          lastModifiedTime
          lastModifiedBy
          phone
          email
          createdDateOfUser
          birthDay
          positionName
          role
        }
      }
    `,
    { organizationId },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findByOrganizationIdLazyQuery() {
  return useLazyQuery(
    gql`
      query findByOrganizationId($organizationId: String) {
        findByOrganizationId(organizationId: $organizationId) {
          id
          organizationId
          userId
          isDeleted
          position
          isConcurrently
          createdTime
          createdBy
          fullName
          gender
          lastModifiedTime
          lastModifiedBy
          phone
          email
          createdDateOfUser
          birthDay
          positionName
          role
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

function getAllUserOrganization() {
  return useQuery(
    gql`
      query getAllUserOrganization {
        getAllUserOrganization {
          id
          organizationId
          userId
          isDeleted
          position
          email
          birthDay
          positionName
          role
          roleName
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

function saveUserOrganizationGraphql() {
  return useMutation(
    gql`
      mutation saveUserOrganization(
        $userOrganizationInputs: [UserOrganizationPayload]
      ) {
        saveUserOrganization(userOrganizationInputs: $userOrganizationInputs)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function findUsersByOrganizationTypeAndRole(type: OrganizationType, role: string) {
  return useQuery(
    gql`
        query findUsersByOrganizationTypeAndRole($type: OrganizationType, $role: String) {
          findUsersByOrganizationTypeAndRole(type: $type,role: $role){
                id
                organizationId
                userId
                isDeleted
                position
                isConcurrently
                createdTime
                createdBy
                fullName
                gender
                lastModifiedTime
                lastModifiedBy
                phone
                email
                createdDateOfUser
                birthDay
                role
                organizationInfo{
                  name
                }
          }
        }
    `,
    {
      type,
      role
    },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  findByOrganizationIdGraphql,
  findByOrganizationIdLazyQuery,
  findUsersByOrganizationTypeAndRole,
  getAllUserOrganization,
  saveUserOrganizationGraphql
};
