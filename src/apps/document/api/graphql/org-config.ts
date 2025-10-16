import { useLazyQuery, useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { OrganizationType } from '@/apps/document/model/organization';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAllOrgConfig(type: OrganizationType) {
  return useQuery(
    gql`
      query getAllOrgConfig($type: OrganizationType) {
        getAllOrgConfig(type: $type) {
          id
          orgParentId
          orgChildId
        }
      }
    `,
    { type },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getOrgChildrenByOrgId() {
  return useLazyQuery(
    gql`
      query getOrgChildrenByOrgId($id: String) {
        getOrgChildrenByOrgId(id: $id) {
          id
          orgParentId
          orgChildId
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

function saveOrgConfig() {
  return useMutation(
    gql`
      mutation saveOrgConfig(
        $orgParentIds: String
        $orgChildIds: String
        $type: OrganizationType
      ) {
        saveOrgConfig(
          orgParentIds: $orgParentIds
          orgChildIds: $orgChildIds
          type: $type
        )
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteOrgParent() {
  return useMutation(
    gql`
      mutation deleteOrgParent($orgParentId: String) {
        deleteOrgParent(orgParentId: $orgParentId)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteOrgChild() {
  return useMutation(
    gql`
      mutation deleteOrgChild($orgParentId: String, $orgChildId: String) {
        deleteOrgChild(orgParentId: $orgParentId, orgChildId: $orgChildId)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteOrgChild,
  deleteOrgParent,
  getAllOrgConfig,
  getOrgChildrenByOrgId,
  saveOrgConfig,
};
