import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

import { HRM_CLIENT_ID } from '@/common/api/graphql/apollo-clients';

function saveWorkProcess() {
  return useMutation(
    gql`
        mutation saveWorkProcess($payload: WorkProcessPayload) {
            saveWorkProcess(payload: $payload)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function deleteWorkProcess() {
  return useMutation(
    gql`
        mutation deleteWorkProcess($id: String) {
            deleteWorkProcess(id: $id)
        }
    `,
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getWorkProcessByIdAndEmployeeId(id: string, employeeId: string) {
  return useQuery(
    gql`
        query getWorkProcessByIdAndEmployeeId($id: String, $employeeId: String) {
            getWorkProcessByIdAndEmployeeId(id: $id, employeeId: $employeeId)
        }
    `, {
      id,
      employeeId
    },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllWorkProcessByEmployeeId(employeeId: string) {
  return useQuery(
    gql`
        query getAllWorkProcessByEmployeeId($employeeId: String) {
            getAllWorkProcessByEmployeeId(employeeId: $employeeId)
        }
    `, { employeeId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

function getAllWorkProcessBySnapshotId(snapshotId: string) {
  return useQuery(
    gql`
        query getAllWorkProcessBySnapshotId($snapshotId: String) {
            getAllWorkProcessBySnapshotId(snapshotId: $snapshotId)
        }
    `, { snapshotId },
    {
      clientId: HRM_CLIENT_ID,
      fetchPolicy: 'network-only',
    },
  );
}

export {
  deleteWorkProcess,
  getAllWorkProcessByEmployeeId,
  getAllWorkProcessBySnapshotId,
  getWorkProcessByIdAndEmployeeId,
  saveWorkProcess
};