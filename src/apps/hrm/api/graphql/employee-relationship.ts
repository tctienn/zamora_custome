import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveFamilyRelationshipInfo() {
  return useMutation(
    gql`
            mutation saveFamilyRelationshipInfo($payload: FamilyRelationshipInfoPayload) {
                saveFamilyRelationshipInfo(payload: $payload)
            }
        `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteFamilyRelationshipInfo() {
  return useMutation(
    gql`
            mutation deleteFamilyRelationshipInfo($id: String) {
                deleteFamilyRelationshipInfo(id: $id)
            }
        `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getFamilyRelationshipByIdAndSnapshotId(id: string, snapshotId: string) {
  return useQuery(
    gql`
            query getFamilyRelationshipByIdAndSnapshotId($id: String, $snapshotId: String) {
                getFamilyRelationshipByIdAndSnapshotId(id: $id, snapshotId: $snapshotId)
            }
        `, {
      id,
      snapshotId
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllByTypeAndSnapshotId(relationshipType: string, snapshotId: string) {
  return useQuery(
    gql`
            query getAllByTypeAndSnapshotId($relationshipType: RelationshipType, $snapshotId: String) {
                getAllByTypeAndSnapshotId(relationshipType: $relationshipType, snapshotId: $snapshotId)
            }
        `, {
      relationshipType,
      snapshotId
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllFamilyRelationshipInfoBySnapshotId(snapshotId: string) {
  return useQuery(
    gql`
            query getAllFamilyRelationshipInfoBySnapshotId($snapshotId: String) {
                getAllFamilyRelationshipInfoBySnapshotId(snapshotId: $snapshotId)
            }
        `, { snapshotId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteFamilyRelationshipInfo,
  getAllByTypeAndSnapshotId,
  getAllFamilyRelationshipInfoBySnapshotId,
  getFamilyRelationshipByIdAndSnapshotId,
  saveFamilyRelationshipInfo
};