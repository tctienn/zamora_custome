import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { OrganizationType } from '@/apps/document/model/organization';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAllClericalChargedByOrgType(orgType: OrganizationType) {
  return useQuery(
    gql`
      query getAllClericalChargedByOrgType($orgType: OrganizationType) {
        getAllClericalChargedByOrgType(orgType: $orgType) {
          userId
          deptIds
        }
      }
    `,
    { orgType },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getListClericalChargedByOrgType(orgType: OrganizationType) {
  return useQuery(
    gql`
      query getListClericalChargedByOrgType($orgType: OrganizationType) {
        getListClericalChargedByOrgType(orgType: $orgType) {
            id
          userId
          deptId
        }
      }
    `,
    { orgType },
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveListClericalCharged() {
  return useMutation(
    gql`
      mutation saveListClericalCharged($data: ClericalChargeList) {
        saveListClericalCharged(data: $data)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteClericalChargedByUserId() {
  return useMutation(
    gql`
      mutation deleteClericalChargedByUserId($userId: String) {
        deleteClericalChargedByUserId(userId: $userId)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteClericalChargedByUserId,
  getAllClericalChargedByOrgType,
  getListClericalChargedByOrgType,
  saveListClericalCharged,
};
