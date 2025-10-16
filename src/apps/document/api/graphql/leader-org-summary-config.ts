import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import type { OrganizationType } from '@/apps/document/model/organization';
import { DOCUMENT_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function getAllLeaderOrgSummaryConfigs(orgType: OrganizationType) {
  return useQuery(
    gql`
      query getAllLeaderOrgSummaryConfigs($orgType: OrganizationType) {
        getAllLeaderOrgSummaryConfigs(orgType: $orgType) {
          id
          userId
          deptId
          orgType
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

function getLeaderOrgSummaryConfigsByUserId(userId: string) {
  return useQuery(
    gql`
      query getLeaderOrgSummaryConfigsByUserId($userId: String) {
        getLeaderOrgSummaryConfigsByUserId(userId: $userId) {
          id
          userId
          deptId
          orgType
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

function deleteLeaderOrgSummaryConfig() {
  return useMutation(
    gql`
      mutation deleteLeaderOrgSummaryConfig($id: String) {
        deleteLeaderOrgSummaryConfig(id: $id)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function saveLeaderOrgSummaryConfig() {
  return useMutation(
    gql`
      mutation saveLeaderOrgSummaryConfig($data: ListLeaderOrgSummaryConfig) {
        saveLeaderOrgSummaryConfig(data: $data)
      }
    `,
    {
      clientId: DOCUMENT_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteLeaderOrgSummaryConfig,
  getAllLeaderOrgSummaryConfigs,
  getLeaderOrgSummaryConfigsByUserId,
  saveLeaderOrgSummaryConfig,
};
