import { useMutation, useQuery, } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { DOCUMENT_CLIENT_ID, } from '@/common/api/graphql/apollo-clients';

function getByTypeGraphql(organizationType: string) {
  return useQuery(
    gql`
      query getByType($organizationType: OrganizationType) {
        getByType(organizationType: $organizationType) {
          code
          isActive
          description
          norder
          id
          name
          type
          parentId
          isDeleted
          createdTime
          createdBy
          lastModifiedTime
          lastModifiedBy
          tags
        }
      }
    `,
    { organizationType },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveTagsOrganization() {
  return useMutation(
    gql`
      mutation saveTags($organizationId: String, $tags: [String]) {
        saveTags(organizationId: $organizationId, tags: $tags)
      }
    `,
    { clientId: DOCUMENT_CLIENT_ID },
  );
}

function getRootOrganizationGraphql(organizationType: string) {
  return useQuery(
    gql`
      query getRoot($organizationType: OrganizationType){
          getRoot(organizationType : $organizationType){
              id
              name
              code
          }
      }
    `,
    { organizationType },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllOrg() {
  return useQuery(
    gql`
      query getAll {
        getAll {
          code
          isActive
          description
          id
          name
          type
          parentId
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

function saveOrganizationGraphql() {
  return useMutation(
    gql`
      mutation saveOrganization($organizationInput: OrganizationDocumentInput) {
        saveOrganization(organizationInput: $organizationInput) {
          code
          isActive
          description
          norder
          id
          name
          type
          parentId
          isDeleted
          createdTime
          createdBy
          lastModifiedTime
          lastModifiedBy
        }
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteOrganizationGraphql() {
  return useMutation(
    gql`
      mutation deleteOrganization($id: String) {
        deleteOrganization(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteOrganizationGraphql,
  getAllOrg,
  getByTypeGraphql,
  getRootOrganizationGraphql,
  saveOrganizationGraphql,
  saveTagsOrganization
};
